// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title Warrant Canary with enclosed funds
/// @author haurog
/// @notice  A warrant canary contract implementation which allows enclosed funds (ETH only) to be withdrawn by a third party upon expiration

contract WarrantCanary is Ownable, Pausable {

    uint public IDcount;
    struct warrantCanary {
        uint ID;
        uint expirationTime;
        uint lastUpdatedInBlock;  // tracks in which block expiration or trusted third party has been changed
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
                "You are neither the owner or trusted third party of this warrant canary.");
        if (msg.sender == warrantCanaries[warrantCanaryID].trustedThirdParty) {
            require(block.timestamp >= warrantCanaries[warrantCanaryID].expirationTime,
                "Warrant canary has not expired yet.");
        }
        _;
    }

    modifier FundsOnlyWithThirdParty(address trustedThirdParty_) {
        // only allow funding if a trusted third party is chosen
        if (trustedThirdParty_ == address(0)) {
            require(msg.value == 0, "Funds can only be sent to warrant canaries with a trusted third party set.");
        }
        _;
    }

    /// @notice Creates a new Warrant Canary with trusted thirdParty (can be set to 0x0)
    /// @param expirationTime_: The time (unix epoch in seconds) when the warrant canary expires
    /// @param purpose_: A string describing the purpose of the warrant canary
    /// @param trustedThirdParty_: An address of a trusted third party. Can be 0x0 if a plain warrant canary should be used.
    function createWarrantCanary(
        uint expirationTime_,
        string memory purpose_,
        address payable trustedThirdParty_
    )
        public
        payable
        FundsOnlyWithThirdParty(trustedThirdParty_)
        whenNotPaused()
    {
        warrantCanaries[IDcount] = warrantCanary(
        {
            ID : IDcount,
            expirationTime: expirationTime_,
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

    /// @notice Update the expiration time for an owned warrant canary contract
    /// @param warrantCanaryID_: ID (uint) of the warrant canary whose expiration time should be changed
    /// @param newExpirationTime_: The time (unix epoch in seconds) when the warrant canary expires
    function updateExpiration(uint warrantCanaryID_, uint newExpirationTime_)
        public
        onlyCanaryOwner(warrantCanaryID_)
    {
        uint oldExpirationTime = warrantCanaries[warrantCanaryID_].expirationTime;
        warrantCanaries[warrantCanaryID_].expirationTime= newExpirationTime_;
        updateLastUpdatedInBlock(warrantCanaryID_);
        emit LogExpirationUpdated(warrantCanaryID_, oldExpirationTime, newExpirationTime_);
    }

    /// @notice Add funds to a warrant canary (ETH only)
    /// @param warrantCanaryID_: ID (uint) of the warrant canary to which the funds are added
    function addFunds(uint warrantCanaryID_)
    public
    payable
    FundsOnlyWithThirdParty(warrantCanaries[warrantCanaryID_].trustedThirdParty)
    whenNotPaused()
    {
        warrantCanaries[warrantCanaryID_].enclosedFunds += msg.value;
        emit LogFundsAdded(warrantCanaryID_, msg.value);
    }

    /// @notice Change the address of the trusted third party
    /// @param warrantCanaryID_: ID (uint) of the warrant canary whose trusted third party should be changed
    function changeTrustedThirdParty(
        uint warrantCanaryID_,
        address payable newTrustedThirdParty_
    )
        public
        onlyCanaryOwner(warrantCanaryID_)

    {
        if (newTrustedThirdParty_ == address(0)) {
            require(warrantCanaries[warrantCanaryID_].enclosedFunds == 0,
            "Trusted third party can only be set to 0x0 if there are no funds enclosed.");
        }
        address oldTrustedThirdParty = warrantCanaries[warrantCanaryID_].trustedThirdParty;
        warrantCanaries[warrantCanaryID_].trustedThirdParty = newTrustedThirdParty_;
        updateLastUpdatedInBlock(warrantCanaryID_);
        emit LogChangedTrustedThirdParty(warrantCanaryID_, oldTrustedThirdParty, newTrustedThirdParty_);
    }

    function withdrawSomeFunds(uint warrantCanaryID_, uint fundsToWithdraw_)
        public
        onlyCanaryOwnerOrTrustedThirdParty(warrantCanaryID_)
    {
        require(warrantCanaries[warrantCanaryID_].enclosedFunds >= fundsToWithdraw_);
        warrantCanaries[warrantCanaryID_].enclosedFunds -= fundsToWithdraw_;
        (bool sent, ) = msg.sender.call{value: fundsToWithdraw_}("");
        require(sent, "Failed to send funds.");
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
        "The warrant Canary still has funds and can not be deleted.");

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

    function updateLastUpdatedInBlock(uint warrantCanaryID_) internal {
        warrantCanaries[warrantCanaryID_].lastUpdatedInBlock = block.number;
    }


    // The following functions are admin functions (owner of the contract only)
    // Therefore they are very minimal without events emitted.

    function pauseContract() public onlyOwner() {
        _pause();
    }

    function unpauseContract() public onlyOwner() {
        _unpause();
    }

    function retrieveExcessFunds() public onlyOwner() {
        uint allEnclosedFunds;
        for(uint i = 0; i < IDcount; i++)
        {
            allEnclosedFunds += warrantCanaries[i].enclosedFunds;
        }
        uint withdrawAmount = address(this).balance - allEnclosedFunds;
        (bool sent, ) = msg.sender.call{value: withdrawAmount}("");
        require(sent, "Failed to send Ether.");
    }
}
