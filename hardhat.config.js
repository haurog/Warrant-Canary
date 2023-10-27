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
        },
        scrollSepolia: {
            url: "https://scroll-public.scroll-testnet.quiknode.pro",
        },
        scrollMainnet: {
            url: "https://scroll-mainnet.chainstacklabs.com/",
        },
    },
    etherscan: {
        apiKey: {
          scrollSepolia: 'abc',
        },
        customChains: [
          {
            network: 'scrollSepolia',
            chainId: 534351,
            urls: {
              apiURL: 'https://sepolia-blockscout.scroll.io/api',
              browserURL: 'https://sepolia-blockscout.scroll.io/',
            },
          },
        ],
      },
    // etherscan: {
    //     apiKey: process.env.ETHERSCAN_API_KEY
    // },
};