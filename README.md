[![Netlify Status](https://api.netlify.com/api/v1/badges/5561d0b9-0edc-4994-afea-e8013861e87f/deploy-status)](https://app.netlify.com/sites/warrantcanary/deploys)

# A Warrant Canary Smart Contract with Enclosed Funds

This project is a [warrant canary contract](https://en.wikipedia.org/wiki/Warrant_canary), which allows users of the contract to passively inform a broad audience that a certain event has happened by not updating the a timestamp in the contract. Additionally, a user can enclose funds in the contract which can be moved by a predefined third party to their own wallet after expiration of the warrant canary. In this configuration the contract acts like a [dead man's switch](https://en.wikipedia.org/wiki/Dead_man%27s_switch). It is written in solidity, so it runs on Ethereum or any EVM compatible chain.

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



https://user-images.githubusercontent.com/36535774/143702192-58e3da3f-898c-4b6f-a4e5-dc094dee31ba.mp4



### [Design Patterns Decisions](design_pattern_decisions.md)

### [Avoiding Attack Vectors and Bugs](avoiding_common_attacks.md)

### [Deployed Address](deployed_address.txt)

### Directory Structure

* `.github/workflows`: Defining github actions to run tests automatically
* `client`: Frontend for the Warrant Canary contract. Plain HTML, CSS and javascript.
* contracts: Deployed smart contracts.
* migrations: Migration configuration files for deploying the smart contracts.
* test: Files for testing the smart contracts with truffle.


### Run Tests Locally

* Install NodeJS
* Install truffle
* Install and run ganache-cli or ganache
* Run `npm install` in project root to install dependencies.
* Run ganache on port: `8545`
* Run truffle `truffle test`
* Code coverage can be tested with `truffle run coverage`

### Deployment

To rinkeby:
```
truffle migrate --reset --network rinkeby
```

Verify:
```
truffle run verify WarrantCanary --network rinkeby
```

### Possible Improvements and Known Issues

* In general event handling does not seem to be too reliable, sometimes it is missing updates.
* Switching the account in Metamask is not handled on the website. Needs to be reloaded manually.
* If ERC-20 tokens are accidentally sent to the contract they cannot be retrieved.
* To make this contractand frontend more useable, a badge like element, like netlify badge at the top of this readme, will need to be developed such that anyone can add such a badge to their website to publicly show the status of their warrant canary.

