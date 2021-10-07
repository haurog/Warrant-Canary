pragma solidity ^0.8.0;

/*
*  This is the initial design of the Warrant Canary contract. This will be only
*  the scaffolding for the general structure
*/

contract WarrantCanaray {

    uint IDcount;
    address adminOwner;

    struct warrantCanary {
        uint ID;
        uint expirationBlock;
        uint lastUpdatedInBlock;
        string purpose;
        address payable warrantCanaryOwner;
        address payable trustedThirdParty;
        uint enclosedFunds;
    }

    mapping(uint => warrantCanary)  warrantCanaries;


    modifier onlyCanaryOwner() {
        _;
    }

    modifier onlyCanaryOwnerOrTrustedThirdParty() {
        _;
    }

    function createWarrantCanary(uint expirationBlock, string memory purpose, address trustedThirdParty) public payable {
        // Create a new Warrant Canary with trusted thirdParty (can be set to 0x0)
    }

    function createWarrantCanarySimple(uint expirationBlock, string memory purpose) public {
        // Calls the normal createWarrantCanary function with trustedThirdParty = 0x0
    }

    function updateExpiration(uint newExpirationBlock, uint warrantCanaryID) public onlyCanaryOwner {
        // Update the block number at which a warrant canary expires
    }

    function addFunds(uint warrantCanaryID) public payable{
        // add more fund to a warrant canary
    }

    function changeTrustedThirdParty(address newTrustedThirdParty) public onlyCanaryOwner {
        // change the address of a trusted third party
    }

    function withdrawSomeFunds(uint warrantCanaryID, uint fundsToWithdraw) public onlyCanaryOwnerOrTrustedThirdParty {
        // withdraws the specified amount of funds
    }

    function withdrawAllFunds(uint warrantCanaryID) public onlyCanaryOwnerOrTrustedThirdParty {
        // Withdraws all funds from a warrant canary. Calls "withdrawSomeFunds" with fundsTOWithDraw = warrantCanary.enclosedFunds
    }

    function deleteWarrantCanary(uint warrantCanaryID) public onlyCanaryOwnerOrTrustedThirdParty {
        // deletes the warrant canary from the mapping (only possible if enclosedFunds = 0)
    }

    function Expiration(uint warrantCanaryID) public {
        // returns the expiration Block set in the warrantCanary
    }

}
