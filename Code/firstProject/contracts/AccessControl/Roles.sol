// SPDX-License-Identifier: MIT
/* 
This library is used for managing the addresses assigned to a role
*/
pragma solidity ^0.8.0;

library Roles {
    struct Role {
        mapping ( address=> bool) carrier;
        mapping ( address=>bool) available;
    }

    //Check if an account owns this role
    function owns(Role storage role, address account) internal view returns (bool) {
        require (account != address(0),"Error this role does not belong to this account");
        return role.carrier[account];
    }

    function isFree(Role storage role, address account) internal view returns (bool) {
        require (account != address(0),"Error this role does not belong to this account ");
        return role.available[account];
    }

    function makeFree(Role storage role, address account) internal {
        require (account != address(0),"Error in making this account available");
        role.available[account] = true;
    }

    function makeTaken(Role storage role, address account) internal {
        require (account != address(0),"Error in in making this account unavailable");
        role.available[account] = false;
    }

    //Give an account access to the role
    function add (Role storage role, address account) internal {
        require (account != address(0),"Error this role does not belong to this account");
        require (!owns(role,account), "Erro in checking the ownership of this account");

        role.carrier[account] = true;
        role.available[account] = true;
    }

    //Remove an account's access to this role
    function remove (Role storage role, address account) internal {
        require (account != address(0), "Error in removing the role's access");
        require(owns(role,account),"Error this role does not belong to this account");

        role.carrier[account] = false;
        role.available[account] = false;
    }

}
