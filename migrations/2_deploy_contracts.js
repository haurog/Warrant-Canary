module.exports = async function(deployer) {
    const WarrantCanary = artifacts.require('./WarrantCanary.sol');
    await deployer.deploy(WarrantCanary);
    const contract = await WarrantCanary.deployed();
    console.log("Contract address:", contract.address)
};