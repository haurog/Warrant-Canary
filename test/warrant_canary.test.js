const WarrantCanary = artifacts.require("WarrantCanary");

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

      assert(
        createTx.logs[0].event == "LogCreated",
        "creating a warrant canary should emit a Created event",
      );

      const result = await instance.warrantCanaries.call(0);
      // console.log("Purpose: " + result.purpose);

      assert(result.purpose == purpose,
        "The purpose is not stored correctly",
      );
      assert(result.expirationBlock == expirationBlock,
        "The expirationBlock is not stored properly.",
      );

      assert(result.warrantCanaryOwner == accounts[0],
        "The owner of the warrant Canary is not set properly",
      );
    });

    it("should emit a Log when funds are added and withdrawn", async () => {
      const fundsAdded = 250; // wei
      const fundsWithdrawn = 200; //wei
      const addFundsTx = await instance.addFunds(0, {value: fundsAdded});
      const withdrawTx = await instance.withdrawSomeFunds(0, fundsWithdrawn);

      // console.log("test: " + withdrawTx.logs[0].event);

      assert(
        addFundsTx.logs[0].event == "LogFundsAdded",
        "adding funds should emit an event",
      );

      assert(
        withdrawTx.logs[0].event == "LogFundsWithdrawn",
        "Withdrawing funds should emit an event",
      );

      let result = await instance.warrantCanaries.call(0);

      // console.log("added: " + fundsAdded + " withdrawn: " + fundsWithdrawn + " enclosed: " + result.enclosedFunds);
      assert.equal(
        result.enclosedFunds,
        fundsAdded-fundsWithdrawn,
        "Enclosed Funds does not equal added minus withdrawn funds"
      )

      const withdrawAllTx = await instance.withdrawAllFunds(0);
      result = await instance.warrantCanaries.call(0);

      assert.equal(
        result.enclosedFunds, 0,
        "Withdrawing everything does not remove all funds"
      );

      // const withdrawTxFail = await instance.withdrawSomeFunds(0, fundsWithdrawn, {account: account[1]});

    });
  });

});
