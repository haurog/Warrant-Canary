const WarrantCanary = artifacts.require("WarrantCanary");
const truffleAssert = require('truffle-assertions');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("WarrantCanary", function (accounts) {

  let instance;
  let createTx;
  const purpose = "test the contract."
  const expirationBlock = 111;

  beforeEach(async () => {
    instance = await WarrantCanary.new();
    createTx = await instance.createWarrantCanarySimple(expirationBlock, purpose);

  });

  describe("Create warrant canary contract.", () => {
    it("should emit a Log and store all elements correctly when a simple contract is created.", async () => {

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

    it("should emit a Log when funds are added and withdrawn", async () => {

      const fundsAdded = web3.utils.toWei('1', 'ether');
      const fundsWithdrawn = web3.utils.toWei('0.9', 'ether');
      const test = web3.utils.toWei('1', 'ether')
      const addFundsTx = await instance.addFunds(0, {value: fundsAdded});
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

      await truffleAssert.reverts(
        instance.withdrawSomeFunds(0, 10, {from: accounts[1]}),
        truffleAssert.ErrorType.REVERT,
        "only owner or trusted third party are allowed to withdraw funds"
      );

      truffleAssert.eventEmitted(
        await instance.changeTrustedThirdParty(0, accounts[1]),
        "LogChangedTrustedThirdParty"
      );

      await truffleAssert.passes(
        await instance.withdrawAllFunds(0, {from: accounts[1]}),
        "account 1 is now the trusted third party, so the transaction should pass."
      );

      truffleAssert.eventEmitted(
        await instance.withdrawAllFunds(0),
        "LogFundsWithdrawn"
      );

      result = await instance.warrantCanaries.call(0);

      assert.equal(result.enclosedFunds, 0,
        "Withdrawing everything does not remove all funds"
      );
    });
  });

});
