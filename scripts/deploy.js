const hre = require("hardhat");
const ethProvider = require('eth-provider') // eth-provider is a simple EIP-1193 provider
const frame = ethProvider('frame') // Connect to Frame
frame.setChain(534352); // Scroll Mainnet
// frame.setChain(534351);    // Scroll testnet on Sepolia
// frame.setChain(11155111); // Sepolia



async function main() {
  const warrantCanary = await hre.ethers.getContractFactory("WarrantCanary");
  const tx = await warrantCanary.getDeployTransaction()
  tx.from = (await frame.request({ method: 'eth_requestAccounts' }))[0]
  await frame.request({ method: 'eth_sendTransaction', params: [tx] })

  await warrantCanary.waitForDeployment();

  console.log( `Deployed to${warrantCanary.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});