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
});
