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


Things to be determined: 
* How to handle multi-sig warrant canarys. -> not in initial version of the contract 
  * Could have a m of n feature where at least m signatures are necessary to initiate the above **user** interactions. 
  * Would also need to have a possibilty to add and remove signatures. 
  * Also would need to be able to change the m and n  (test that m can never be larger than n)
