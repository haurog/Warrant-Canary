# Avoiding Attack Vectors and Bugs

## SWC-116 (Block values as a proxy for time)

The contract uses `block.timestamp` as a indication of time, therefore it is vulnerable to this kind of attack. Further investigation of the issue showed that nowadays the maximum amount a timestamp can be shifted into the future is [15 seconds](https://ethereum.stackexchange.com/questions/99427/is-timestamp-manipulation-still-possible-and-if-yes-can-users-spot-that-and-di) in the [geth code implementation.](https://github.com/ethereum/go-ethereum/blob/94451c2788295901c302c9bf5fa2f7b021c924e2/consensus/ethash/consensus.go#L264) This small timestamp manipulation is not relevant in this smart contract, as only a trusted third party can do anything with an expired warrant canary. If the miner of the block with a manipulated timestamp and the trusted third party in the warrant canary are the same entity the enclosed funds in the warrant canary can be withdrawn at most 15 seconds before the expected time.

## SWC-107 (Reentrancy)

Use Check-Effects-Interactions pattern in the function `withdrawSomeFunds()`.

## SWC-103 (Floating pragma)

Used a very specific compiler version `0.8.9` to make sure it will be compiled with the same version on any machine.

## SWC-135 (Code With No Effects)

Use test coverage to make sure that all lines of code are touched by the test. Only 2 branches are not tested, both of them are only executed in case of withdrawn amount is rejected by the receiving address. This case would revert the whole transaction and does not need to be tested in too much detail.