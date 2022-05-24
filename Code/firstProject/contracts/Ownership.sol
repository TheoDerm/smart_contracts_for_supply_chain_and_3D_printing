// SPDX-License-Identifier: MIT

/* 
This class is used for assigning ownership and through it
regulate who has the priviledges of making actions in the Supply Chain
*/
pragma solidity ^0.8.0;

contract Ownership {
    address private owner;
    
    event TransferOwnership (address indexed old, address indexed newOwner);

    modifier allowOwner() {
        require(isHolder(), "Error: only the contract owner can make this action");
        _;
    }

    //Check that the sender is the owner of the contract
    function isHolder() public view returns (bool) {
        return msg.sender == owner;
    }

    //Look the owner's address
    function ownerSearch() public view returns (address) {
        return owner;
    }

    //Public transfterOwnership
    function transferOwnership(address newOwner) public allowOwner {
        transferOwnershipInternal(newOwner);
    }

    //Only owner can remove ownership
    function removeOwnership() public allowOwner {
        emit TransferOwnership(owner, address(0));
        owner = address(0);
    }


    //Internal trasnferOwnership
    function transferOwnershipInternal(address newOwner) internal {
        require (newOwner != address(0), "Error: the new address must be different than the previous");
        emit TransferOwnership(owner, newOwner);
        owner = newOwner ;
    }

    //Assign an owner to the contract
    constructor () {
        owner = msg.sender;
        emit TransferOwnership(address(0), owner);
    }


}