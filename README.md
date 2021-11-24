# Final Project: A warrant canary with enclosed funds

The idea of this project is to build a warrant canary contract, which allows users of the contract to passively inform a broad audience that a certain event has happened by not updating the a timestamp (blocknumber) in the contract. Additionally, a user can enclose funds in the contract which can be moved by a predefined third party to their own wallet.

A **user** can do several different interactions:

* Create a warrant canary. To do this he needs to:
  1. Define a time after which the warrant canary expires if the blocktime is not updated.
  2. Add a short description of the purpose of the warrant canary
  3. Add a trusted third party if necessary. (wallet address)
* Update the timestamp to prove that a certain event did not happen yet.
* Move funds to the warrant canary.
* Update the time after which the warrant canary expires.
* Update the wallet address of the trusted third party
* Remove funds from the warrant canary.
* Delete the warrant canary (and withdraw all enclosed funds)

A **trusted third party** can only withdraw funds if the warrant canary has expired (some predefined time has passed since last timestamp update)

The **general audience** can check if the warrant canary has expired and therefore know, that a certain event has happened.

The **owner** of the contract can:
* Pause the contract so no new warrant canaries can be created and no funds can be added to existing ones. Withdrawing and updating expiration is still possible.
* Withdraw excess funds, meaning funds that are not associated with a warrant canary.
* Withdraw ERC-20 tokens which have been sent to the address accidentally.


### Website

The websity is deplyed using netlify: https://warrantcanary.netlify.app/

### Deployed Address

The contract is on rinkeby under:

[0xF06c47b7FeB65aF49dDD78c1816BD4f31c2d56F1](https://rinkeby.etherscan.io/address/0xf06c47b7feb65af49ddd78c1816bd4f31c2d56f1#code)


### Deployment

To rinkeby:
```
truffle migrate --reset --network rinkeby
```

Verify:
```
truffle run verify WarrantCanary --network rinkeby
```


### Gas optimizations with compiler optimizations disabled/enabled
```
·---------------------------|----------------------------|-------------| |---------------------------|--------------|
|  Solc version: 0.8.9      ·  Optimizer enabled: false  ·  Runs: 200  · ·  Optimizer enabled: true  ·  Runs: 1500  ·
····························|····························|·············| |···························|··············|
|  Methods
····························|··············|·············|·············| |·············|·············|··············|
|  Method                   ·  Min         ·  Max        ·  Avg        · ·  Min        ·  Max        ·  Avg         ·
····························|··············|·············|·············| |·············|·············|··············|
|  addFunds                 ·       46153  ·      46165  ·      46155  · ·      45490  ·      45502  ·       45492  ·
····························|··············|·············|·············| |·············|·············|··············|
|  changeTrustedThirdParty  ·       25648  ·      74309  ·      65147  · ·      24629  ·      72397  ·       63282  ·
····························|··············|·············|·············| |·············|·············|··············|
|  createWarrantCanary      ·      159181  ·     248012  ·     192104  · ·     156868  ·     245664  ·      189776  ·
····························|··············|·············|·············| |·············|·············|··············|
|  deleteWarrantCanary      ·       58554  ·      59873  ·      58994  · ·      57677  ·      59131  ·       58162  ·
····························|··············|·············|·············| |·············|·············|··············|
|  pauseContract            ·           -  ·          -  ·      30327  · ·          -  ·          -  ·       29880  ·
····························|··············|·············|·············| |·············|·············|··············|
|  renounceOwnership        ·           -  ·          -  ·      15549  · ·          -  ·          -  ·       14778  ·
····························|··············|·············|·············| |·············|·············|··············|
|  retrieveExcessFunds      ·           -  ·          -  ·      41300  · ·          -  ·          -  ·       39865  ·
····························|··············|·············|·············| |·············|·············|··············|
|  transferOwnership        ·           -  ·          -  ·      31265  · ·          -  ·          -  ·       30111  ·
····························|··············|·············|·············| |·············|·············|··············|
|  unpauseContract          ·           -  ·          -  ·      30412  · ·          -  ·          -  ·       29905  ·
····························|··············|·············|·············| |·············|·············|··············|
|  updateExpiration         ·       35979  ·      36003  ·      35991  · ·      35098  ·      35122  ·       35110  ·
····························|··············|·············|·············| |·············|·············|··············|
|  withdrawAllFunds         ·       27740  ·      31840  ·      28791  · ·      26825  ·      30925  ·       27856  ·
····························|··············|·············|·············| |·············|·············|··············|
|  withdrawSomeFunds        ·           -  ·          -  ·      40263  · ·          -  ·          -  ·       39287  ·
····························|··············|·············|·············| |·············|·············|··············|
|  Deployments              ·                                          · ·                                          ·
····························|··············|·············|·············| |·············|·············|··············|
|  WarrantCanary            ·           -  ·          -  ·    2896460  · ·          -  ·          -  ·     1797814  ·
·---------------------------|--------------|-------------|-------------| |-------------|-------------|--------------|
```