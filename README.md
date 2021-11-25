[![Netlify Status](https://api.netlify.com/api/v1/badges/5561d0b9-0edc-4994-afea-e8013861e87f/deploy-status)](https://app.netlify.com/sites/warrantcanary/deploys)

# Final Project: A warrant canary with enclosed funds

This project is a [warrant canary contract](https://en.wikipedia.org/wiki/Warrant_canary), which allows users of the contract to passively inform a broad audience that a certain event has happened by not updating the a timestamp in the contract. Additionally, a user can enclose funds in the contract which can be moved by a predefined third party to their own wallet. In this configuration the contract acts like a [dead man's switch](https://en.wikipedia.org/wiki/Dead_man%27s_switch).

A **user** can do several different interactions:

* Create a warrant canary. To do this he needs to:
  1. Define a time after which the warrant canary expires if the expiration time is not updated.
  2. Add a short description of the purpose of the warrant canary.
  3. Add a trusted third party if necessary. (wallet address).
* Update the timestamp to prove that a certain event did not happen yet.
* Move funds to the warrant canary.
* Update the time after which the warrant canary expires.
* Update the wallet address of the trusted third party.
* Remove funds from the warrant canary.
* Delete the warrant canary.

A **trusted third party** can:
* Withdraw funds if the warrant canary has expired.
* Delete the warrant canary if it has expired.

The **general audience** can:
* Check if the warrant canary has expired and therefore know, that a certain event has happened
* Add funds to any warrant canary.

The **owner** of the contract can:
* Pause the contract so no new warrant canaries can be created and no funds can be added to existing ones. Withdrawing and updating expiration is still possible.
* Withdraw excess funds, meaning funds that are not associated with a warrant canary. (This functionality is tested in the smart contract tests)
* Withdraw ERC-20 tokens which have been sent to the address accidentally. -> not implemented.


### Website

The website is deployed using netlify: https://warrantcanary.netlify.app/

### [Design Patterns Decisions](design_pattern_decisions.md)

### [Avoiding Common Attacks](avoiding_common_attacks.md)

### [Deployed Address](deployed_address.txt)

### Directory Structure

* `.github/workflows`: Defining github actions to run tests automatically
* `client`: Frontend for the Warrant Canary contract. Plain HTML, CSS and javascript.
* contracts: Deployed smart contracts.
* migrations: Migration configuration files for deploying the smart contracts.
* test: Files for testing the smart contracts with truffle.


### Run tests locally

* Run `npm install` in project root to install dependencies.
* Run ganache on port: `8545`
* Run truffle `truffle test`

### Deployment

To rinkeby:
```
truffle migrate --reset --network rinkeby
```

Verify:
```
truffle run verify WarrantCanary --network rinkeby
```

### Public Ethereum Address to receive Certificate as NFT

haurog.eth aka 0x1c0AcCc24e1549125b5b3c14D999D3a496Afbdb1
