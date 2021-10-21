const WarrantCanary = artifacts.require('./WarrantCanary.sol');

module.exports = function(deployer) {
    deployer.deploy(WarrantCanary);
};