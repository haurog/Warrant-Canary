const hre = require("hardhat");

async function main() {
  const warrantCanary = await hre.ethers.deployContract("WarrantCanary");

  await warrantCanary.waitForDeployment();

  console.log( `Deployed to${warrantCanary.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});