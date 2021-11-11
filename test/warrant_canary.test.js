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


contract("WarrantCanary", function (accounts) {

  let instance;
  let createTx;
  const purpose = "test the contract."
  let expirationBlock;


  const fundsAdded = web3.utils.toWei('0.1', 'ether');
  const fundsWithdrawn = web3.utils.toWei('0.09', 'ether');

  beforeEach(async () => {
    instance = await WarrantCanary.new();
    expirationBlock = await web3.eth.getBlockNumber();
    // console.log("Current Block:" + expirationBlock);
    createTx = await instance.createWarrantCanary(expirationBlock, purpose, '0x0000000000000000000000000000000000000000');
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

  it("Testing ownable library", async () => {
    let owner = await instance.owner();
    assert.equal(owner, accounts[0], "The owner of the contract has not been set properly")

    await instance.transferOwnership(accounts[1])
    owner = await instance.owner();
    assert.equal(owner, accounts[1], "The owner of the contract has not been set properly")

    await instance.renounceOwnership({from: accounts[1]});
    owner = await instance.owner();
    assert.equal(owner, 0, "The owner of the contract has not been set properly")
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

});
