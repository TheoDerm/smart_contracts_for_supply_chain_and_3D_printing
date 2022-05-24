// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Roles.sol";

contract ManagerDepot {
    using Roles for Roles.Role;

    //Event for adding and removing ManagerDepot
    event AddedManagerDepot(address indexed account);
    event RemovedManagerDepot(address indexed account);

    event MadeAvailableManagerDepot(address indexed account);
    event MadeUnavailableManagerDepot(address indexed account);

    //This struct inherits the struct Role from the "Roles" library
    Roles.Role private dManagers;

    constructor() {
        addManagerDepotInternal(msg.sender);
    }

    //Check this role
    function isManagerDepot(address account) public view returns (bool) {
        return dManagers.owns(account);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyManagerDepot() {
        require(isManagerDepot(msg.sender), "Error: Only depot manager is authorised to make this action");
        _;
    }

    function makeUnavailableManagerDepot(address account) public onlyManagerDepot{
        dManagers.makeTaken(account);

        emit MadeUnavailableManagerDepot(account);
    }

    function makeAvailableManagerDepot(address account) public onlyManagerDepot{
        dManagers.makeFree(account);

        emit MadeAvailableManagerDepot(account);
    }

    function isAvailableManagerDepot(address account) public view returns (bool) {
        return dManagers.isFree(account);
    }
  
    function addManagerDepotInternal(address account) internal {
        dManagers.add(account);
        emit AddedManagerDepot(account);
    }

  
    function removeManagerDepotInternal(address account) internal {
        dManagers.remove(account);
        emit RemovedManagerDepot(account);
    }
}