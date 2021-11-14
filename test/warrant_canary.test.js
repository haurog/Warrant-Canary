const WarrantCanary = artifacts.require("WarrantCanary");
const truffleAssert = require('truffle-assertions');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */

function convertArrayToSmallNumber(IDsOwned) {
  for (i = 0; i < IDsOwned.length ; i++) {
    IDsOwned[i] = IDsOwned[i].toNumber();
  }
}

function calculateNextContractAddress(account_, nonce_) {
  // This function calculates the next address where a contract will be deployed
  // adapted from: https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed/761#761
  const rlp = require('rlp');
  const keccak = require('keccak');

  var nonce = nonce_;
  var sender = account_;

  var input_arr = [ sender, nonce ];
  var rlp_encoded = rlp.encode(input_arr);

  var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

  var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
  // console.log("next contract address: " + contract_address);

  return contract_address;
}


contract("WarrantCanary", function (accounts) {

  let instance;
  let createTx;
  const purpose = "test the contract."
  let expirationBlock;
  let nextContractAddress;

  const fundsAdded = web3.utils.toWei('0.1', 'ether');
  const fundsWithdrawn = web3.utils.toWei('0.09', 'ether');
  const excessFundsAdded = web3.utils.toWei('0.254', 'ether');

  beforeEach(async () => {
    instance = await WarrantCanary.new();
    expirationBlock = await web3.eth.getBlockNumber();
    createTx = await instance.createWarrantCanary(expirationBlock, purpose, '0x0000000000000000000000000000000000000000');
    // nextContractAddress = calculateNextContractAddress(accounts[0], await web3.eth.getTransactionCount(accounts[0]));
  });

  it("Creating Warrant Canary and store necessary information", async () => {

    assert.equal(createTx.logs[0].event, "LogCreated",
      "creating a warrant canary should emit a Created event",
    );

    let stateofWC = await instance.warrantCanaries.call(0);
    // console.log("Purpose: " + result.purpose);

    assert.equal(stateofWC.purpose, purpose,
      "The purpose is not stored correctly",
    );
    assert.equal(stateofWC.expirationBlock, expirationBlock,
      "The expirationBlock is not stored properly.",
    );

    assert.equal(stateofWC.warrantCanaryOwner, accounts[0],
      "The owner of the warrant Canary is not set properly",
    );
  });

  it("Test that lastUpdatedInBlock state is set properly", async () => {
    let stateofWC = await instance.warrantCanaries.call(0);
    blocknumberNow = await web3.eth.getBlockNumber();
    assert.equal(stateofWC.lastUpdatedInBlock, blocknumberNow,
      "The lastUpdatedInBLocknumber is wrong.",
    );

    await instance.changeTrustedThirdParty(0, accounts[5]);
    stateofWC = await instance.warrantCanaries.call(0);
    blocknumberNow = await web3.eth.getBlockNumber();
    assert.equal(stateofWC.lastUpdatedInBlock, blocknumberNow,
      "The lastUpdatedInBLocknumber is not updated when changing trusted third party",
    );

    await instance.updateExpiration(0, blocknumberNow + 10);;
    stateofWC = await instance.warrantCanaries.call(0);
    blocknumberNow = await web3.eth.getBlockNumber();
    assert.equal(stateofWC.lastUpdatedInBlock, blocknumberNow,
      "The lastUpdatedInBLocknumber is not updated when changing the expiration",
    );
  });

  it("Testing Ownable library", async () => {
    let owner = await instance.owner();
    assert.equal(owner, accounts[0], "The owner of the contract has not been set properly")

    await instance.transferOwnership(accounts[1])
    owner = await instance.owner();
    assert.equal(owner, accounts[1], "The owner of the contract has not been set properly")

    await instance.renounceOwnership({from: accounts[1]});
    owner = await instance.owner();
    assert.equal(owner, 0, "The owner of the contract has not been set properly")
  });

  it("Testing Pausable library", async () => {
    await instance.changeTrustedThirdParty(0, accounts[1]);

    instance.togglePauseState();

    await truffleAssert.reverts(
      instance.createWarrantCanary(expirationBlock, purpose, '0x0000000000000000000000000000000000000000'),
      truffleAssert.ErrorType.REVERT,
      "Contract is pause so adding funds should fail"
    );

    await truffleAssert.reverts(
      instance.addFunds(0, { value: fundsAdded }),
      truffleAssert.ErrorType.REVERT,
      "Contract is paused so adding funds should fail"
    );

    await truffleAssert.passes(
      instance.withdrawAllFunds(0),
      "Contract is paused withdrawing should still work"
    );

    await truffleAssert.reverts(
      instance.togglePauseState({ from: accounts[1] }),
      truffleAssert.ErrorType.REVERT,
      "Only owner should be able to toggle the pause state of the contract"
    );

    instance.togglePauseState();

    await truffleAssert.passes(
      instance.addFunds(0, { value: fundsAdded }),
      "Contract is unpaused again, so adding funds should be possible"
    );

    await instance.withdrawAllFunds(0);
  });

  it("Testing adding and withdrawing funds", async () => {
    await truffleAssert.reverts(
      instance.addFunds(0, { value: fundsAdded }),
      truffleAssert.ErrorType.REVERT,
      "Trusted Third Party has not been set, so transaction should revert"
    );

    await instance.changeTrustedThirdParty(0, accounts[5]);
    const addFundsTx = await instance.addFunds(0, { value: fundsAdded });
    const withdrawTx = await instance.withdrawSomeFunds(0, fundsWithdrawn);

    assert.equal(addFundsTx.logs[0].event, "LogFundsAdded",
      "adding funds should emit an event",
    );

    assert.equal(withdrawTx.logs[0].event, "LogFundsWithdrawn",
      "Withdrawing funds should emit an event",
    );

    let stateofWC = await instance.warrantCanaries.call(0);

    // console.log("added: " + fundsAdded + " withdrawn: " + fundsWithdrawn + " enclosed: " + result.enclosedFunds);
    assert.equal(stateofWC.enclosedFunds, fundsAdded - fundsWithdrawn,
      "Enclosed Funds does not equal added minus withdrawn funds"
    )

    truffleAssert.eventEmitted(
      await instance.withdrawAllFunds(0),
      "LogFundsWithdrawn"
    );

    stateofWC = await instance.warrantCanaries.call(0);

    assert.equal(stateofWC.enclosedFunds, 0,
      "Withdrawing everything does not remove all funds"
    );

    await truffleAssert.reverts(
      instance.send(fundsAdded, {from: accounts[0]}),
      truffleAssert.ErrorType.REVERT,
      "Contract should not be allowed to receive plain ETH without calling a function"
    );
  });

  it("Testing third party access to funds", async () => {
    await instance.changeTrustedThirdParty(0, accounts[5]);
    const addFundsTx = await instance.addFunds(0, { value: fundsAdded });


    await truffleAssert.reverts(
      instance.withdrawSomeFunds(0, 10, { from: accounts[1] }),
      truffleAssert.ErrorType.REVERT,
      "Only owner or trusted third party are allowed to withdraw funds"
    );

    truffleAssert.eventEmitted(
      await instance.changeTrustedThirdParty(0, accounts[1]),
      "LogChangedTrustedThirdParty"
    );

    await truffleAssert.passes(
      instance.withdrawAllFunds(0, { from: accounts[1] }),
      "account 1 is now the trusted third party, so the transaction should pass."
    );

    stateofWC = await instance.warrantCanaries.call(0);

    assert.equal(stateofWC.enclosedFunds, 0,
      "Withdrawing everything does not remove all funds"
    );
  });

  it("Testing expiration block for third party access to funds", async () => {
    await instance.changeTrustedThirdParty(0, accounts[1]);
    const addFundsTx = await instance.addFunds(0, { value: fundsAdded });

    let currentBlockNumber = await web3.eth.getBlockNumber();

    // set expiration into the future
    truffleAssert.eventEmitted(
      await instance.updateExpiration(0, currentBlockNumber + 10 ),
      "LogExpirationUpdated"
    );

    await truffleAssert.reverts(
      instance.withdrawAllFunds(0, { from: accounts[1] }),
      truffleAssert.ErrorType.REVERT,
      "Expiration Block is in the Future. Third party should not be able to withdraw."
    );

    currentBlockNumber = await web3.eth.getBlockNumber();
    await instance.updateExpiration(0, currentBlockNumber);

    await truffleAssert.passes(
      instance.withdrawAllFunds(0, { from: accounts[1] }),
      "Warrant Canary expired, so the transaction should pass."
    );

    stateofWC = await instance.warrantCanaries.call(0);

    assert.equal(stateofWC.enclosedFunds, 0,
      "Withdrawing everything does not remove all funds"
    );

  });

  it("Tests that a warrant canary can be deleted", async () => {

    let idToDelete = 3;
    let numberOfCanaries = 5;  // total number after following for loop

    // Add a few more warrant canaries with the same owner:
    for (i = 1; i < numberOfCanaries; i++) {
      await instance.createWarrantCanary(expirationBlock, purpose, accounts[i]);
    }

    const addFundsTx = await instance.addFunds(idToDelete, { value: fundsAdded });

    let IDsOwned = await instance.getIDsOwned(accounts[0]);
    convertArrayToSmallNumber(IDsOwned);
    let IDsTrusted = await instance.getIDsTrusted(accounts[idToDelete]);
    convertArrayToSmallNumber(IDsTrusted);

    // Make sure owner and trusted party are set properly
    assert(IDsOwned.indexOf(idToDelete) !== -1, "ID not in owned warrant canary IDs");
    assert(IDsTrusted.indexOf(idToDelete) !== -1, "ID not in trusted warrant canary IDs");


    await truffleAssert.reverts(
      instance.deleteWarrantCanary(idToDelete),
      truffleAssert.ErrorType.REVERT,
      "There are still funds enclosed. Warrant Canary cannot be deleted."
    );

    await instance.withdrawAllFunds(idToDelete);

    truffleAssert.eventEmitted(
      await instance.deleteWarrantCanary(idToDelete),
      "LogDeleted"
    );

    stateofWC = await instance.warrantCanaries.call(idToDelete);

    assert.equal(stateofWC.warrantCanaryOwner, 0,
      "Warrant Canary has not been deleted."
    );

    IDsOwned = await instance.getIDsOwned(accounts[0]);
    convertArrayToSmallNumber(IDsOwned);
    IDsTrusted = await instance.getIDsTrusted(accounts[idToDelete]);
    convertArrayToSmallNumber(IDsTrusted);

    // Make sure that the IDs have been deleted in respective the mappings
    assert(IDsOwned.indexOf(idToDelete) === -1, "ID is still in owned warrant canary IDs");
    assert(IDsTrusted.indexOf(idToDelete) === -1, "ID is still in trusted warrant canary IDs");

  });

  it("Preparing Blockchain for the next test", async () => {
    // This is to prepare the blockchain for the next test (preload contract address with ETH)
    nextContractAddress = calculateNextContractAddress(accounts[0], await web3.eth.getTransactionCount(accounts[0]));
    await web3.eth.sendTransaction(
      {
        from: accounts[1],
        to: nextContractAddress, // doesn't need to exist
        value: excessFundsAdded,
        gasLimit: 90000
      }
    );

    assert.equal(await web3.eth.getBalance(nextContractAddress), excessFundsAdded,
      "The funds have not been added to the expected contract address");
  });

  it("Test if owner can withdraw excess funds", async () => {
    numberOfCanaries = 5;
    assert.equal(await web3.eth.getBalance(instance.address), excessFundsAdded,
      "The contract address is empty");

    // Add a few more warrant canaries with the same owner and add some funds:
    for (i = 1; i < numberOfCanaries; i++) {
      await instance.createWarrantCanary(expirationBlock, purpose, accounts[1], { value: fundsAdded });
    }

    let addressBalanceBefore = await web3.eth.getBalance(instance.address);
    await instance.retrieveExcessFunds();
    let addressBalanceAfter = await web3.eth.getBalance(instance.address);

    // console.log("before: " + addressBalanceBefore);
    // console.log("after:  " + addressBalanceAfter);

    assert(addressBalanceBefore - addressBalanceAfter == excessFundsAdded,
      "Owner could not retrieve excess funds");

    // get ETH back
    for (i = 1; i < numberOfCanaries; i++) {
      await instance.withdrawAllFunds(i);
    }

  });

});
