# Design Patterns Decisions

## Access Control Design Patterns

* The `Ownable` design pattern is used to control some functions of the contract which only the contract deployer can use. The functions are:
- `retrieveExcessFunds()` To retrieve funds which are not associated with any warrant canary. (ETH only). To contract generally refuses to accept ETH sent to the contract address, but this functionality nevertheless allows to retrieve funds which have been deposited to the contract address via different means. The last two [tests](test/warrant_canary.test.js) check that this functionality works by pre-loading the next contract deployment address with ETH and then deploy the contract on top of it.
- `pauseContract()` and `unpauseContract()` to pause the contract and prevent the creation of further warrant canaries and adding funds to existing contracts. Other functionalities are not limited.
* Generally only the owner of a warrant canary and the trusted third party (after expiration only) can interact with an existing warrant canary.
* Anyone can add funds at any time, as long as the contract itself is not paused.


## Inheritance and Interfaces

The contract inherits `Ownable` and `Pausable` from OpenZeppelin.


## Gas Optimizations

Generally I did not optimize the contract manually. I increased the optimization runs for the solidity compiler and saw quite a difference in gas usage for running the tests. Therefore, the automatically optimized warrant canary contract has been deployed.
The following table shows the difference in gas usage before (left) and after (right) enabling optimizations during compilation:

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