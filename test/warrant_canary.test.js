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
    createTx = await instance.createWarrantCanarySimple(expirationBlock, purpose);
  });

  it("Creating Warrant Canary and store necessary information", async () => {

    assert.equal(createTx.logs[0].event, "LogCreated",
      "creating a warrant canary should emit a Created event",
    );

    const result = await instance.warrantCanaries.call(0);
    // console.log("Purpose: " + result.purpose);

    assert.equal(result.purpose, purpose,
      "The purpose is not stored correctly",
    );
    assert.equal(result.expirationBlock, expirationBlock,
      "The expirationBlock is not stored properly.",
    );

    assert.equal(result.warrantCanaryOwner, accounts[0],
      "The owner of the warrant Canary is not set properly",
    );
  });

  it("Testing adding and withdrawing funds", async () => {
    const addFundsTx = await instance.addFunds(0, { value: fundsAdded });
    const withdrawTx = await instance.withdrawSomeFunds(0, fundsWithdrawn);

    assert.equal(addFundsTx.logs[0].event, "LogFundsAdded",
      "adding funds should emit an event",
    );

    assert.equal(withdrawTx.logs[0].event, "LogFundsWithdrawn",
      "Withdrawing funds should emit an event",
    );

    let result = await instance.warrantCanaries.call(0);

    // console.log("added: " + fundsAdded + " withdrawn: " + fundsWithdrawn + " enclosed: " + result.enclosedFunds);
    assert.equal(result.enclosedFunds, fundsAdded - fundsWithdrawn,
      "Enclosed Funds does not equal added minus withdrawn funds"
    )

    truffleAssert.eventEmitted(
      await instance.withdrawAllFunds(0),
      "LogFundsWithdrawn"
    );

    result = await instance.warrantCanaries.call(0);

    assert.equal(result.enclosedFunds, 0,
      "Withdrawing everything does not remove all funds"
    );
  });

  it("Testing third party access to funds", async () => {
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

    result = await instance.warrantCanaries.call(0);

    assert.equal(result.enclosedFunds, 0,
      "Withdrawing everything does not remove all funds"
    );
  });

  it("Testing expiration block for third party access to funds", async () => {
    const addFundsTx = await instance.addFunds(0, { value: fundsAdded });

    await instance.changeTrustedThirdParty(0, accounts[1]);

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

    result = await instance.warrantCanaries.call(0);

    assert.equal(result.enclosedFunds, 0,
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

    result = await instance.warrantCanaries.call(idToDelete);

    assert.equal(result.warrantCanaryOwner, 0,
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
