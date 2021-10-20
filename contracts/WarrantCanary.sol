// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
*
*/

contract WarrantCanary {

    address adminOwner;
    uint IDcount;
    struct warrantCanary {
        uint ID;
        uint expirationBlock;
        uint lastUpdatedInBlock;
        string purpose;
        address payable warrantCanaryOwner;
        address payable trustedThirdParty;
        uint enclosedFunds;
    }

    mapping(uint => warrantCanary)  warrantCanaries;  // All warrant canaries by ID
    mapping(address => uint[]) IDsOwned;  // to store all warrant canaries that an address owns
    mapping(address => uint[]) IDsTrusted;  // to store all warrant canaries that have this trusted third party.


    modifier onlyCanaryOwner(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner);
        _;
    }

    modifier onlyCanaryOwnerOrTrustedThirdParty(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner ||
                msg.sender == warrantCanaries[warrantCanaryID].trustedThirdParty);
        _;
    }

    function createWarrantCanary(
        uint expirationBlock_,
        string memory purpose_,
        address payable trustedThirdParty_
    )
        public
        payable
    {
        // Create a new Warrant Canary with trusted thirdParty (can be set to 0x0)
        warrantCanaries[IDcount] = warrantCanary(
        {
            ID : IDcount,
            expirationBlock: expirationBlock_,
            lastUpdatedInBlock: block.number,
            purpose: purpose_,
            warrantCanaryOwner: payable(msg.sender),
            trustedThirdParty: trustedThirdParty_,
            enclosedFunds: msg.value
        });

        IDsOwned[msg.sender].push(IDcount);

        if (trustedThirdParty_!= address(0)) {
            IDsTrusted[trustedThirdParty_].push(IDcount);
        }

        IDcount++;

    }

    function createWarrantCanarySimple(uint expirationBlock_, string memory purpose_)
        public
    {
        createWarrantCanary(expirationBlock_, purpose_, payable(address(0)));
    }

    function updateExpiration(uint warrantCanaryID, uint newExpirationBlock)
        public
        onlyCanaryOwner(warrantCanaryID)
    {
        // Update the block number at which a warrant canary expires
    }

    function addFunds(uint warrantCanaryID) public payable{
        // add more fund to a warrant canary
    }

    function changeTrustedThirdParty(
        uint warrantCanaryID,
        address newTrustedThirdParty
    )
        public
        onlyCanaryOwner(warrantCanaryID)
    {
        // change the address of a trusted third party
    }

    function withdrawSomeFunds(uint warrantCanaryID, uint fundsToWithdraw)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID)
    {
        // withdraws the specified amount of funds
    }

    function withdrawAllFunds(uint warrantCanaryID)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID)
    {
        // Withdraws all funds from a warrant canary. Calls "withdrawSomeFunds" with fundsTOWithDraw = warrantCanary.enclosedFunds
    }

    function deleteWarrantCanary(uint warrantCanaryID)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID) {
        // deletes the warrant canary from the mapping (only possible if enclosedFunds = 0)
    }

    function Expiration(uint warrantCanaryID) public {
        // returns the expiration Block set in the warrantCanary
    }

}
