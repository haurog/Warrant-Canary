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

    mapping(uint => warrantCanary) public  warrantCanaries;  // All warrant canaries accessed by IDs
    mapping(address => uint[]) public IDsOwned;  // Store all warrant canaries that an address owns
    mapping(address => uint[]) public IDsTrusted;  // Store all warrant canaries that have this address as a trusted third party

    event LogCreated(uint warrantCanaryID, string purpose,address trustedThirdParty);
    event LogExpirationUpdated(uint warrantCanaryID, uint oldExpirationBlock, uint newExpirationBlock);
    event LogFundsAdded(uint warrantCanaryID, uint amount);
    event LogChangedTrustedThirdParty(uint warrantCanaryID, address oldTrustedThirdParty, address newTrustedThirdParty);
    event LogFundsWithdrawn(uint warrantCanaryID, uint amount);
    event LogDeleted(uint warrantCanaryID);


    modifier onlyCanaryOwner(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner,
                "You are not the owner of this warrant canary.");
        _;
    }

    modifier onlyCanaryOwnerOrTrustedThirdParty(uint warrantCanaryID) {
        require(msg.sender == warrantCanaries[warrantCanaryID].warrantCanaryOwner ||
                msg.sender == warrantCanaries[warrantCanaryID].trustedThirdParty,
                "You are neither the owner or trusted third party of this warrant canary");
        if (msg.sender == warrantCanaries[warrantCanaryID].trustedThirdParty) {
            require(block.number >= warrantCanaries[warrantCanaryID].expirationBlock,
                "Warrant canary has not expired yet");
        }
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
        require(warrantCanaries[warrantCanaryID_].enclosedFunds >= fundsToWithdraw_);
        warrantCanaries[warrantCanaryID_].enclosedFunds -= fundsToWithdraw_;
        payable(msg.sender).transfer(fundsToWithdraw_);
        emit LogFundsWithdrawn(warrantCanaryID_, fundsToWithdraw_);
    }

    function withdrawAllFunds(uint warrantCanaryID_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_)
    {
        // Withdraws all funds from a warrant canary. Calls "withdrawSomeFunds" with fundsToWithDraw = warrantCanary.enclosedFunds
        withdrawSomeFunds(warrantCanaryID_, warrantCanaries[warrantCanaryID_].enclosedFunds);
    }

    function deleteWarrantCanary(uint warrantCanaryID_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_) {
        // deletes the warrant canary from the mapping (only possible if enclosedFunds = 0)
        require(warrantCanaries[warrantCanaryID_].enclosedFunds == 0,
        "The warrant Canary is not empty and can not be deleted.");

        address wcOwner = warrantCanaries[warrantCanaryID_].warrantCanaryOwner;
        address wcTrusted = warrantCanaries[warrantCanaryID_].trustedThirdParty;

        IDsOwned[wcOwner] = removeByValue(IDsOwned[wcOwner], warrantCanaryID_);


        if (wcTrusted != address(0)) {
            IDsTrusted[wcTrusted] = removeByValue(IDsTrusted[wcTrusted], warrantCanaryID_);
        }

        delete warrantCanaries[warrantCanaryID_];

        emit LogDeleted(warrantCanaryID_);
    }

    function removeByValue(uint[] storage array_, uint valueToDelete_)
        private
        returns(uint[] storage)
    {
        // Keeps the order of the non removed elements (more expensive and not really necessary in this project)

        uint index = 0;
        // find index of the value (is unique)
        for(; index <= array_.length && array_[index] != valueToDelete_ ; index++){}

        // shift all elements after index one element upwards
        for (; index < array_.length - 1; index++){
            array_[index] = array_[index + 1];
        }
        // delete last element
        array_.pop();

        return array_;
    }

    function getIDsOwned(address wcOwner)
        public
        view
        returns(uint[] memory)
    {
        return IDsOwned[wcOwner];
    }

    function getIDsTrusted(address wcTrusted)
        public
        view
        returns(uint[] memory)
    {
        return IDsTrusted[wcTrusted];
    }
}
