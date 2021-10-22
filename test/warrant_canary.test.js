const WarrantCanary = artifacts.require("WarrantCanary");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("WarrantCanary", function (accounts) {
  it("should assert true", async function () {
    await WarrantCanary.deployed();
    return assert.isTrue(true);
  });
  // it("should return the list of accounts", async ()=> {
  //   console.log(accounts);
  // });

  let instance;

  beforeEach(async () => {
    instance = await WarrantCanary.new();
  });

  describe("Create warrant canary contract.", () => {
    it("should emit a Log and store all elements correctly when created simple", async () => {
      let eventEmitted = false;
      const purpose = "test the contract."
      const expirationBlock = 111;
      const tx = await instance.createWarrantCanarySimple(expirationBlock, purpose);

      if (tx.logs[0].event == "LogCreated") {
        eventEmitted = true;
      }

      assert.equal(
        eventEmitted,
        true,
        "creating a warrant canary should emit a Created event",
      );

      const result = await instance.warrantCanaries.call(0);
      // console.log(result.purpose);

      assert.equal(
        result.purpose,
        purpose,
        "The purpose is not stored correctly",
      );
      assert.equal(
        result.expirationBlock,
        expirationBlock,
        "The expirationBlock is not stored properly.",
      );
      assert.equal(
        result.warrantCanaryOwner,
        accounts[0],
        "The owner of the warrant Canary is not set properly",
      );
    });
  });
});
