// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
*
*/

contract WarrantCanary {

    address adminOwner;
    uint public IDcount;
    struct warrantCanary {
        uint ID;
        uint expirationBlock;
        uint lastUpdatedInBlock;
        string purpose;
        address payable warrantCanaryOwner;
        address payable trustedThirdParty;
        uint enclosedFunds;
    }

    mapping(uint => warrantCanary) public  warrantCanaries;  // All warrant canaries by ID
    mapping(address => uint[]) public IDsOwned;  // to store all warrant canaries that an address owns
    mapping(address => uint[]) public IDsTrusted;  // to store all warrant canaries that have this trusted third party.

    event LogCreated(uint warrantCanaryID, string purpose,address trustedThirdParty);
    event LogExpirationUpdated(uint warrantCanaryID, uint oldExpirationBlock, uint newExpirationBlock);
    event LogFundsAdded(uint warrantCanaryID, uint amount);
    event LogChangedTrustedThirdParty(uint warrantCanaryID, address oldTrustedThirdParty, address newTrustedThirdParty);

    modifier onlyCanaryOwner(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner);
        _;
    }

    modifier onlyCanaryOwnerOrTrustedThirdParty(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner ||
                msg.sender == warrantCanaries[warrantCanaryID].trustedThirdParty);
        _;
    }

    modifier updateLastUpdatedInBlock(uint warrantCanaryID) {
        _;
        warrantCanaries[warrantCanaryID].lastUpdatedInBlock = block.number;
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

        emit LogCreated(IDcount, purpose_, trustedThirdParty_);

        IDcount++;

    }

    function createWarrantCanarySimple(uint expirationBlock_, string memory purpose_)
        public
    {
        createWarrantCanary(expirationBlock_, purpose_, payable(address(0)));
    }

    function updateExpiration(uint warrantCanaryID_, uint newExpirationBlock_)
        public
        onlyCanaryOwner(warrantCanaryID_)
        updateLastUpdatedInBlock(warrantCanaryID_)
    {
        uint oldExpirationBlock = warrantCanaries[warrantCanaryID_].expirationBlock;
        warrantCanaries[warrantCanaryID_].expirationBlock = newExpirationBlock_;
        emit LogExpirationUpdated(warrantCanaryID_, oldExpirationBlock, newExpirationBlock_);
    }

    function addFunds(uint warrantCanaryID_) public payable{
        warrantCanaries[warrantCanaryID_].enclosedFunds += msg.value;
        emit LogFundsAdded(warrantCanaryID_, msg.value);
    }

    function changeTrustedThirdParty(
        uint warrantCanaryID_,
        address payable newTrustedThirdParty_
    )
        public
        onlyCanaryOwner(warrantCanaryID_)
        updateLastUpdatedInBlock(warrantCanaryID_)
    {
        address oldTrustedThirdParty = warrantCanaries[warrantCanaryID_].trustedThirdParty;
        warrantCanaries[warrantCanaryID_].trustedThirdParty = newTrustedThirdParty_;
        emit LogChangedTrustedThirdParty(warrantCanaryID_, oldTrustedThirdParty, newTrustedThirdParty_);
    }

    function withdrawSomeFunds(uint warrantCanaryID_, uint fundsToWithdraw_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_)
    {
        // withdraws the specified amount of funds
    }

    function withdrawAllFunds(uint warrantCanaryID_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_)
    {
        // Withdraws all funds from a warrant canary. Calls "withdrawSomeFunds" with fundsTOWithDraw = warrantCanary.enclosedFunds
    }

    function deleteWarrantCanary(uint warrantCanaryID_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_) {
        // deletes the warrant canary from the mapping (only possible if enclosedFunds = 0)
    }

    function Expiration(uint warrantCanaryID_) public {
        // returns the expiration Block set in the warrantCanary
    }

}