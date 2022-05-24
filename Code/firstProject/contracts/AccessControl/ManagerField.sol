// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Roles.sol";

contract ManagerField {
    using Roles for Roles.Role;

    //Event for adding and removing ManagerField
    event AddedManagerField(address indexed account);
    event RemovedManagerField(address indexed account);

    //This struct inherits the struct Role from the "Roles" library
    Roles.Role private fManagers;

    constructor() {
        addManagerFieldInternal(msg.sender);
    }

    //Check this role
    function isManagerField(address account) public view returns (bool) {
        return fManagers.owns(account);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyManagerField() {
        require(isManagerField(msg.sender), "Error: Only field manager is authorised to make this action");
        _;
    }

  
    function addManagerFieldInternal(address account) internal {
        fManagers.add(account);
        emit AddedManagerField(account);
    }

  
    function removeManagerFieldInternal(address account) internal {
        fManagers.remove(account);
        emit RemovedManagerField(account);
    }
}