// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Roles.sol";

contract Operator {
    using Roles for Roles.Role;

    //Event for adding and removing operator
    event AddedOperator(address indexed account);
    event RemovedOperator(address indexed account);

    event MadeAvailableOperator(address indexed account);
    event MadeUnavailableOperator(address indexed account);
  


    //This struct inherits the struct Role from the "Roles" library
    Roles.Role private operators;

    constructor() {
        addOperatorInternal(msg.sender);
    }

    //Check this role
    function isOperator(address account) public view returns (bool) {
        return operators.owns(account);
    }

    // Define a modifier that checks to see if msg.sender has the appropriate role
    modifier onlyOperator() {
        require(isOperator(msg.sender), "Error: Only operator is authorised to make this action");
        _;
    }

    function isAvailableOperator(address account) public view returns (bool) {
        return operators.isFree(account);
    }
    
    function makeUnavailableOperator(address account) public onlyOperator{
        operators.makeTaken(account);

        emit MadeUnavailableOperator(account);
    }

    function makeAvailableOperator(address account) public onlyOperator{
        operators.makeFree(account);

        emit MadeAvailableOperator(account);
    }

    function addOperatorInternal(address account) internal {
        operators.add(account);
        emit AddedOperator(account);
    }

  
    function removeOperatorInternal(address account) internal {
        operators.remove(account);
        emit RemovedOperator(account);
    }
}