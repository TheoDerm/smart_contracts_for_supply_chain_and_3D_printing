// SPDX-License-Identifier: MIT

/* 
NOTES FOR FUTURE DEVELOPMENT:
1: Part is created by operator and contract owner?

*/
pragma solidity ^0.8.0;

import "./AccessControl/Operator.sol";
import "./AccessControl/ManagerDepot.sol";
import "./AccessControl/ManagerField.sol";
import "./Ownership.sol";

contract SupplyChain is Ownership, Operator, ManagerDepot, ManagerField {
    address owner;      //Contract owner
    uint stock;         //Current stock of units in the SC
    uint upc;           //Universal Product Code . stock and UPC will make the product's id
    
    mapping (uint => Part) parts;                       // List of part in the MSCN   
    mapping (uint => TxBlock) partsHistory;             // Tracks the parts' history thorugh the supply chain
    mapping (uint => Depot) depots;                     // List of depots and their Operators/Managers
    mapping (uint => Printer) printers;
    mapping (address => bool) addressInUse;

   bytes32[3] stl_hashes =[
       bytes32(0x7465737300000000000000000000000000000000000000000000000000000000),
       bytes32(0x7465737400000000000000000000000000000000000000000000000000000000),
       bytes32(0x7465737500000000000000000000000000000000000000000000000000000000)];

    bytes32[3] cad_hashes = [
        bytes32(0x7465737236700000000000000000000000000000000000000000000000000000),
        bytes32(0x7465737236800000000000000000000000000000000000000000000000000000),
        bytes32(0x7465737236900000000000000000000000000000000000000000000000000000)];


    
    
    enum PrinterStage {NotRequested, WaitingApproval, Approved}
    /* Supply Chain States */
    enum State {
        Created,                //0
        ShippedToDepot,         //1
        ShippedToField,         //2 
        Deployed                //3
    }

    struct Printer {
        bytes32 printerId; 
        uint layer_thickness;
        string fill_pattern; 
        string orientation; 
        bytes32 stl; 
        bytes32 cad; 
        int temp;
        PrinterStage pStage;
    }

    struct Part {
        uint id;                // Part's unique id
        bytes32 printerId;      // Id of the printer that created the part 
        State state;            // The state of the part in the supply chain
        int lon;                // Longitude of the part's creation
        int lat;                // Latitude of the part's creation
        uint timestamp;         // Time of the part's creation
        bool deployed;          // Is the part deployed? Upon creation set to false
        uint stock;             // Stock keepign units
        uint upc;               // Universal Product Code being give by the printer upon creation
       
        address partOwner;      // The address of the part's current owner
        address partOperator;   // The adderss of the part's creator (it's always an operator)
        uint    creationDepotId; // The depot that created the part

    }

    struct Depot {
        uint depotId;                   // The depot's identification number
        address depotOperator;          // The depot's operator
        address depotManager;           // The depot's manager
        bool isDCreated;                // Keep the status of the Depot
    }

    

    struct TxBlock {
        uint CR;    //Creation Block    
        uint DTD;   //Depot to Depot block
        uint DTF;   //Depot to Field block
    }
    

    event RequestedPart(uint _upc);
    event ApprovedPart(uint _upc);
    event DepotCreated(uint depotId);
    event DepotDeleted(uint depotId);
    event DiscardedPart(uint upc);
    event Created(uint upc);
    event StoredAtDepot(uint upc);
    event ShippedToDepot(uint upc);
    event ShippedToField(uint upc);
    event Deployed(uint upc);



    /*
    Modifiers for checking ownership
    */
    modifier allowOnlyOwner() {
        require(msg.sender == owner, "Only the contract owner is authorised to take this action");
        _;
    }

    
     modifier verifyCaller (address _address) {
        require(msg.sender == _address, "SupplyChain::verifyCaller - The caller is not the one supposed" );
        _;
    }

    /* Modifier for checking that a part is created  */
    modifier isCreated (uint _upc) {
        require (parts[_upc].state == State.Created || parts[_upc].state == State.ShippedToDepot, "Error, the part doesn't exist!");
        _;
    }

    modifier isInField (uint _upc) {
        require (parts[_upc].state == State.ShippedToField, "Error, the part hasn't reached the field yet!");
        _;
    }

    modifier checkDepotManager(address _manager) {
        require(isManagerDepot(_manager), "Error, this address doesn't belong to a Depot Manager");
        _;
    }

    modifier checkDepotOperator(address _operator) {
        require(isOperator(_operator), "Error, this address doesn't belong to an Operator");
        _;
    }

    modifier isDepotCreated(uint depotId) {
        require(depots[depotId].isDCreated, "Error, there is no Depot with that Id in our network");
        _;
    }

    modifier isPartRequested(uint _upc) {
        require(printers[_upc].pStage == PrinterStage.WaitingApproval, "Error, part is not requested or is already approved");
        _;  
    }

    modifier isPartApproved(uint _upc) {
        require(printers[_upc].pStage == PrinterStage.Approved, "Error, part is not approved for production");
        _;
    }

    modifier partNotRequested(uint _upc) {
        require(printers[_upc].pStage == PrinterStage.NotRequested, "Part already requested");
        _;
    }
    

    modifier partNotCreated(uint _upc) {
        require(parts[_upc].id == 0, "Part is already created");
        _;
    }
    
    modifier checkAddress(address account) {
        require(addressInUse[account] == false, "Error, address already in use");
        _;
    }

    modifier checkArmyAccess() {
        require(isHolder() || isManagerDepot(msg.sender) || isManagerField(msg.sender) || isOperator(msg.sender), "Only army participants are authorised to make this action");
        _;
    }

    modifier validHashes(bytes32 _stl, bytes32 _cad) {
        require(checkHashes(_stl, _cad), "Error, part is not approved due to failed integrity checks on STL and CAD files. Please check them again or discard the part!");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        stock=1;
        upc=1;
    }

    /*
        Add Operators, Depot Managers, Field Managers
        Allowed: Only contract owner
    */
    function addOperator(address account) public allowOnlyOwner() checkAddress(account){
        addOperatorInternal(account);
        addressInUse[account] = true;
    }
   
    function addManagerDepot(address account) public allowOnlyOwner() checkAddress(account){
        addManagerDepotInternal(account);
        addressInUse[account] = true;
    }
    
    function addManagerField(address account) public allowOnlyOwner() checkAddress(account){
        addManagerFieldInternal(account);
        addressInUse[account] = true;

    }

    function removeManagerDepot() public onlyManagerDepot() {
        removeManagerDepotInternal(msg.sender);
        addressInUse[msg.sender] = false;
    }

    function removeManagerField() public onlyManagerField() {
        removeManagerFieldInternal(msg.sender);
        addressInUse[msg.sender] = false;

    }

    function removeOperator() public onlyOperator() {
        removeOperatorInternal(msg.sender);
        addressInUse[msg.sender] = false;

    }
    
    /*
        Create the Depots of the SC and add the Operators, Managers
        Allowed: Only contract owner
    */
    function addDepot(uint _depotId, address _operator, address _manager) public allowOnlyOwner() checkDepotManager(_manager) checkDepotOperator(_operator) {
        require(isAvailableOperator(_operator), "Operator N/A");
        require(isAvailableManagerDepot(_manager), "Manager Depot N/A");
        require(depots[_depotId].isDCreated == false, "Depot already created");
        

        addDepotInternal(_depotId, _operator, _manager);
    }   

    function addDepotInternal(uint _depotId, address _operator, address _manager) internal {
        Depot memory depot;
        depot.depotId = _depotId;
        depot.depotOperator = _operator;
        depot.depotManager = _manager;
        depot.isDCreated = true;
        depots[_depotId] = depot;
        
        makeUnavailableOperator(_operator);
        makeUnavailableManagerDepot(_manager);
        emit DepotCreated(_depotId);

    }

    function deleteDepot(uint _depotId) public allowOnlyOwner() isDepotCreated(_depotId) {
        makeAvailableOperator(depots[_depotId].depotOperator);
        makeAvailableManagerDepot(depots[_depotId].depotManager);
        delete depots[_depotId];

        emit DepotDeleted(_depotId);
    }
    /*
        0:  Depot Manager Send the Request for part manufacture
            Allowed only Depot Manager
    */

    function requestPart(uint _upc, uint _layer_thickness, string memory _fill_pattern, string memory _orientation, bytes32 _stl, bytes32 _cad, int _temp) public onlyManagerDepot() partNotRequested(_upc) {

        Printer memory printer;  
        printer.layer_thickness = _layer_thickness;
        printer.fill_pattern = _fill_pattern;
        printer.orientation = _orientation;
        printer.stl = _stl;
        printer.cad = _cad;
        printer.temp = _temp;
        printer.pStage = PrinterStage.WaitingApproval;
        printer.printerId = keccak256(abi.encodePacked(_layer_thickness, _fill_pattern, _orientation,_temp));

        printers[_upc] = printer;

        emit RequestedPart(_upc);
    }

    function approvePart(uint _upc) public onlyOperator() isPartRequested(_upc){ 
        if(checkHashes(printers[_upc].stl, printers[_upc].cad) != true) {
            discardPartInternal(_upc);
        } else {
            printers[_upc].pStage = PrinterStage.Approved;
            emit ApprovedPart(_upc);
        }
        
    }

    function checkHashes(bytes32 stl, bytes32 cad) internal view returns(bool flag) {
        uint count = 0;
        for (uint i=0; i<stl_hashes.length; i++) {
            if(stl_hashes[i] == stl) {
                count = count + 1;
            }
            if(cad_hashes[i] == cad) {
                count = count + 1;
            }
        }
        if(count == 2 ) {
            return true;
        } else {
            return false;
        }   
    }

    function discardPart(uint _upc) public onlyOperator() isPartRequested(_upc) {
        discardPartInternal(_upc);
    }

    function discardPartInternal(uint _upc) internal {
        delete printers[_upc];
        emit DiscardedPart(_upc);
    }

    /*  
        1: Operator creates spare part
        Allowed: Only operator   
    */
    function createdPart(uint _upc, int _lon, int _lat, uint _depot) public onlyOperator() isDepotCreated(_depot) isPartApproved(_upc) partNotCreated(_upc){
       
         /* Create the part and add all the attributes */
        Part memory part;
        part.id = _upc + stock;   
        part.stock = stock;                                 // product Id unique. Combines the upc added by the printer/operator and the current stock number
        part.state = State.Created;                         // product state in the Supply Chain
        part.partOperator = depots[_depot].depotOperator;   
        part.partOwner = depots[_depot].depotManager;       // product owner through its movement
        part.lat = _lat;                                    // product latitude when created
        part.lon = _lon;                                    // product longitude when created
        part.timestamp = block.timestamp;                   // product timestamp when created
        part.deployed = false;                              // product deployment status
        part.printerId = printers[_upc].printerId;          // printer's id that created this product
        part.creationDepotId = _depot;

        /* Add the part to an array of tracking parts */
        parts[_upc] = part;
        
        /* Create the part's history block to be added */
        uint temp;
        TxBlock memory txBlock;
        txBlock.CR = block.number;
        txBlock.DTD = temp;
        txBlock.DTF = temp;
        partsHistory[_upc] = txBlock;

        stock = stock + 1;                      // update stock number

        emit Created(_upc);                 // emit event
    }

    /*  
        2: Part is shipped to a different Depot    
        Allowed: Only depot manager   
    */
    function shipPartToDepot(uint _upc, address _depotManager) public onlyManagerDepot() isCreated(_upc) verifyCaller(parts[_upc].partOwner) {
        require(isManagerDepot(_depotManager), "Wrong address of Depot Manager");
        require(!parts[_upc].deployed, "The part is already deployed");
        require(parts[_upc].partOwner != _depotManager, "The part is already in this depot");
        /*
        Here the part is moved from the creation Depot to another Depot. The ownership of each part goes to the depot manager.
        1. Update the part's state to SHIPPED
        2. Change the ownership of the part to the manager of the new depot 
        */
        
        parts[_upc].state = State.ShippedToDepot;
        parts[_upc].partOwner = _depotManager;
        partsHistory[_upc].DTD = block.number;
        emit ShippedToDepot(_upc);
    }

    /* 
        3: Part is shipped to the Field    
        Allowed: Only depot manager
    */
    function shipPartToField(uint _upc, address _fieldManager) public onlyManagerDepot() isCreated(_upc) verifyCaller(parts[_upc].partOwner) {
        require(isManagerField(_fieldManager), "Wrong address for Field Manager");
        require(!parts[_upc].deployed, "The part is already deployed");
        require(parts[_upc].partOwner != _fieldManager, "The part is already in this field");


        /*
        Here the part is moved from a Depot to the field. The ownership of each part goes to the field manager.
        1. Update the part's state to SHIPPED
        2. Change the ownership of the part to the field manager ?
        */

        parts[_upc].state = State.ShippedToField;
        parts[_upc].partOwner = _fieldManager;
        partsHistory[_upc].DTF = block.number;

        emit ShippedToField(_upc);
    }

    /* 
        4: Part is deployed
        Allowed: Only Field Manager
    */
    function deployPart(uint _upc) public  onlyManagerField() isInField(_upc) verifyCaller(parts[_upc].partOwner) {
        /*
        Here the part is deployed on the field equipment
        1.Update the part's state to deployed
        */

        parts[_upc].state = State.Deployed;
        parts[_upc].deployed = true;
        emit Deployed(_upc);
    }

    /*
        Added Functions to get data
    */

    function getPart(uint _upc) public checkArmyAccess() view returns (uint id, uint _stock, bytes32 printerId, address partOwner,address partOperator, uint creationDepotId, State state, int lon, int lat, uint timestamp, bool deployed) {
        Part memory part = parts[_upc];
        return (
            part.id,
            part.stock,
            part.printerId,
            part.partOwner,
            part.partOperator,
            part.creationDepotId,
            part.state,
            part.lon,
            part.lat,
            part.timestamp,
            part.deployed
        );
    }

    function getDepot(uint _depotId) public checkArmyAccess() view returns (address depotOperator, address depotManager, bool isDCreated) {
        Depot memory depot = depots[_depotId];
        return (
            depot.depotOperator,
            depot.depotManager,
            depot.isDCreated
        );
    }

    function getPartHistory(uint _upc) public checkArmyAccess() view returns (uint creation, uint dtd, uint dtf) {
        TxBlock memory txBlock = partsHistory[_upc];
        return (txBlock.CR, txBlock.DTD, txBlock.DTF);
    }

    function getSpecs(uint _upc) public checkArmyAccess() view returns(bytes32 printerId, uint _layer_thickness, string memory _fill_pattern, string memory _orientation, bytes32 _stl, bytes32 _cad, int _temp, PrinterStage pStage){
        Printer  memory printer = printers[_upc];
        return (
            printer.printerId,
            printer.layer_thickness,
            printer.fill_pattern,
            printer.orientation,
            printer.stl,
            printer.cad,
            printer.temp,
            printer.pStage
        );
    }
}