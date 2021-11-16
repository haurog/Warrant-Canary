/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const infuraURL = 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY
// console.log('URL: ' +  infuraURL);
// console.log('mnemonic: ' +  process.env.MNEMONIC);

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*'
        },
        rinkeby: {
          provider: () => new HDWalletProvider(process.env.MNEMONIC, infuraURL),
          network_id: 4,          // Rinkeby's network id
          gas: 5500000,
        },
    },
  plugins: ["solidity-coverage", "truffle-plugin-verify"],
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {excludeContracts: ['Migrations']}
  },
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },
  compilers: {
    solc: {
      version: "0.8.9",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1500
        }
      }
    }
  },

};
