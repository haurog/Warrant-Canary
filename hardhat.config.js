require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require("@nomiclabs/hardhat-truffle5");


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};