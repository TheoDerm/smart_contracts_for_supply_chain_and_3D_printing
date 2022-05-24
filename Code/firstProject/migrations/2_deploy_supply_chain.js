var SupplyChain = artifacts.require("SupplyChain");
var Roles = artifacts.require("Roles");
var Operator = artifacts.require("Operator");
var ManagerDepot = artifacts.require("ManagerDepot");
var ManagerField = artifacts.require("ManagerField");

//var Printer = artifacts.require("Printer");
var Ownership = artifacts.require("Ownership");

//For part and part arguments
/* part */
//var partId = '0x6162636400000000000000000000000000000000000000000000000000000000';
//var lon = 1123;
//var lat = 1234;
//var printerId = 113123112;

/* printer */
//var printerAddress = '0x009e9Cd5eDE5F0b84c827F2105181C532EED24CA';
//var operatorAddress = '0x009e9Cd5eDE5F0b84c827F2105181C532EED24CA';
//var quant = 10;


module.exports = function (deployer) {
    deployer.deploy(SupplyChain);
    deployer.deploy(Roles);
    deployer.deploy(Operator);
    deployer.deploy(ManagerDepot);
    deployer.deploy(ManagerField);
    
    //deployer.deploy(Printer, printerAddress, quant, operatorAddress);
    deployer.deploy(Ownership);
};