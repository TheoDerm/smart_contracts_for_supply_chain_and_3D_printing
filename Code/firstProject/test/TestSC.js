/*
To easily perform the tests:    1. Run Ganache and quickstart a blockchain
                                2. Configure the truffle-config.js and change the development port on 7545
                                3. Run: truffle test test/TestSC.js

In order to perform the tests on the private blockchain network:    1. Clone the git repo: https://github.com/deanstef/quorum-network.git
                                                                    2. Run the netowrk:
                                                                    On windows: $env:PRIVATE_CONFIG="ignore"; $env:QUORUM_CONSENSUS="clique"; docker-compose up -d   
                                                                    On Linux: PRIVATE_CONFIG=ignore QUORUM_CONSENSUS=clique docker-compose up -d 
                                                                    3: To connect tot the js console: docker exec -it quorum-network-node1-1 geth attach /qdata/dd/geth.ipc 
                                                                    4. Create and unlock 6 accounts with the following commands: personal.addAccount("seed")
                                                                                                                                 personal.unlockAccount(address,"seed",15000)                                                                                                                                 
                                                                    5. Configure the truffle-config.js and change the development port on 22000(1st node)
                                                                    6. Run: truffle test test/TestSC.js
                                                                     
*/
var SupplyChain = artifacts.require("SupplyChain");
var Operator = artifacts.require("Operator");
var ManagerDepot = artifacts.require("ManagerDepot");
var ManagerField = artifacts.require("ManagerField");
var Roles = artifacts.require("Roles");
var Ownership = artifacts.require("Ownership");

contract("Ownership", function(accounts) {
    const owner = accounts[0]
    
    it("Test: Ownership.sol -> ownerSearch()", async() => {
        const ownership = await Ownership.deployed();
        const response = await ownership.ownerSearch();
        assert.equal(response,owner,"Error: OwnerSearch function")
    })
    
    it("Test: Ownership.sol -> isHolder(), with valid input", async() => {
        const ownership = await Ownership.deployed();
        const response = await ownership.isHolder();
        assert.equal(response,true,"Error: isHolder()")
    })

    it("Test: Ownership.sol -> isHolder(), with invalid input", async() => {
        const ownership = await Ownership.deployed();
        const response = await ownership.isHolder({from:accounts[3]});
        assert.equal(response,false,"Error: isHolder()")
    })

    it("Test: Ownership.sol -> transferOwnership(), with valid input", async() => {
        const ownership = await Ownership.deployed();
        await ownership.transferOwnership(accounts[3]);
        const response = await ownership.isHolder({from:accounts[3]})
        assert.equal(response,true,"Error: transferOwnership()")
    })

    it("Test: Ownership.sol -> transferOwnership(), with invalid input", async() => {
        const ownership = await Ownership.deployed();
        const response = await ownership.isHolder()
        assert.equal(response,false,"Error: transferOwnership()")
    })

    it("Test: Ownership.sol -> removeOwnership()", async() => {
        const ownership = await Ownership.deployed();
        await ownership.removeOwnership({from:accounts[3]})
        const response = await ownership.isHolder({from:accounts[3]})
        assert.equal(response,false,"Error: removeOwnership()")
    })

});


contract("Operator", function(accounts) {
    const operatorId1 = accounts[1]
    const operatorId2 = accounts [2]
    
    it("Test: makeAvailableOperator() and makeUnavailableOperator(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        const operator = await Operator.deployed();

        await sc.addOperator(operatorId1)

        var eventEmitted = false;

        await operator.makeUnavailableOperator(operatorId1)

        const response = await operator.isAvailableOperator(operatorId1)
        await operator.getPastEvents("MadeUnavailableOperator", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response,false,"Error: Didn't make the operator unavailable")

        await operator.makeAvailableOperator(operatorId1)
       
        const response2 = await operator.isAvailableOperator(operatorId1)
        await operator.getPastEvents("MadeAvailableOperator", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response2,true,"Error: Didn't make the operator available")
    })
});


contract("ManagerDepot", function(accounts) {
    const manager = accounts[1]
    const wrongManager = accounts[2]

    it("Test: makeAvailableManagerDepot() and makeUnavailableManagerDepot(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        const managerInstance = await ManagerDepot.deployed();

        await sc.addManagerDepot(manager)

        var eventEmitted = false;

        await managerInstance.makeUnavailableManagerDepot(manager)

        const response = await managerInstance.isAvailableManagerDepot(manager)
        await managerInstance.getPastEvents("MadeUnavailableManagerDepot", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response,false,"Error: Didn't make the ManagerDepot unavailable")

        await managerInstance.makeAvailableManagerDepot(manager)
       
        const response2 = await managerInstance.isAvailableManagerDepot(manager)
        await managerInstance.getPastEvents("MadeAvailableManagerDepot", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response2,true,"Error: Didn't make the ManagerDepot available")
    })
});


contract("ManagerField", function(accounts) {
    const manager = accounts[1]
    const manager2 = accounts[2]
    
    it("Test: isManagerField(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        const managerInstance1 = await ManagerField.deployed();

        await sc.addManagerField(manager)
        
        var eventEmitted = false;
        
        const response = await managerInstance1.isManagerField(manager)
    

        await managerInstance1.getPastEvents("AddedManagerField", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response,false,"Error: Didn't add an Field Manager")
    })


    it("Test: isManagerField(), with invalid input", async() => {
        const managerInstance = await ManagerField.deployed();
    
        var eventEmitted = false;
        const response = await managerInstance.isManagerField(manager2)
        await managerInstance.getPastEvents("AddedManagerField", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        assert.equal(response,false,"Error: Wrong manager status")
    })
});


contract( "SupplyChain", function(accounts) {
    // Create a part and assign values to it
    const contractOwnerId = accounts[0]
    const operatorId1 = accounts[1]
    const operatorId2 = accounts[2]

    const fieldManagerId1 = accounts[3]
    const fieldManagerId2 = accounts[4]

    const depotManagerId1 = accounts[5]
    const depotManagerId2 = accounts[6]

    var partOwnerId = depotManagerId1;
    var depotId = 22
    var stock = 1
    var upc = 1
    var id = stock + upc 

    var printerId = "0xb8eea7b8a0cd1174711ac4905ba8226e082a61a8fef654f34736f6404d9dd28a"
    const lat = -381231
    const lon = 144859
    var state = 0

     
    var layer_thickness = 30
    var fill_pattern = "Cylindrical"
    var orientation = "Vertical"
    var stl = "0x7465737300000000000000000000000000000000000000000000000000000000"
    var cad = "0x7465737236700000000000000000000000000000000000000000000000000000"
    var temp = 60
    var pStage = 0

    
    console.log("<<<<<<<<<< ACCOUNTS >>>>>>>>>>")
    console.log("Contract Owner: accounts[0] ", contractOwnerId)
    console.log("Operator 1: accounts[1] ", operatorId1)
    console.log("Operator 2: accounts[2] ", operatorId2)

    console.log("Field Manager 1: accounts[3] ", fieldManagerId1)
    console.log("Field Manager 2: accounts[4] ", fieldManagerId2)

    console.log("Depot Manager 1: accounts[5] ", depotManagerId1)
    console.log("Depot Manager 2: accounts[6] ", depotManagerId2)

    console.log("<<<<<<<<<< TESTING THE SUPPLY CHAIN >>>>>>>>>>")
    
    it("Test: addOperator(), with valid input", async() => {  
        const sc = await SupplyChain.deployed(); 

        await sc.addOperator(operatorId1)
        var eventEmitted = false;

        //Get the response
        const response = await sc.isOperator(operatorId1)

        //check for last past emitted events 
        await sc.getPastEvents("AddedOperator", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //Verify the responses
        assert.equal(response, true, "Error: Didn't add operator")
    
    })

    it("Test: addManagerDepot(), with valid input", async() => {  
        const sc = await SupplyChain.deployed(); 

        await sc.addManagerDepot(depotManagerId1)
        var eventEmitted = false;

        //Get the response
        const response = await sc.isManagerDepot(depotManagerId1)

        //check for last past emitted events 
        await sc.getPastEvents("AddedManagerDepot", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //Verify the responses
        assert.equal(response, true, "Error: Didn't add ManagerDepot")
    
    })

    it("Test: addManagerField(), with valid input", async() => {  
        const sc = await SupplyChain.deployed(); 

        await sc.addManagerField(fieldManagerId1)
        var eventEmitted = false;

        //Get the response
        const response = await sc.isManagerField(fieldManagerId1)

        //check for last past emitted events 
        await sc.getPastEvents("AddedManagerField", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //Verify the responses
        assert.equal(response, true, "Error: Didn't add ManagerField")
    
    })


    it("Test: addDepot(), with valid input", async() => {  
        const sc = await SupplyChain.deployed(); 

        // await sc.addOperator(operatorId1)
        // await sc.addManagerDepot(depotManagerId1)
        await sc.addDepot(depotId,operatorId1,depotManagerId1)
        var eventEmitted = false;

        //Get the response
        const response = await sc.getDepot(depotId)

        //check for last past emitted events 
        await sc.getPastEvents("DepotCreated", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //Verify the responses
        assert.equal(response[0], operatorId1, "Error: Invalid operator ID")
        assert.equal(response[1], depotManagerId1, "Error: Invalid manager ID")
    })

    it("Test: addDepot(), with invalid caller", async() => {  
        let sc = await SupplyChain.deployed(); 
        try {
            await sc.addDepot(13,printerId,operatorId1,depotManagerId1,{from:operatorId1})            
            
        } catch {
            return 0;
        }
    })

    it ("Test: requestPart(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        
        //create the part
        await sc.requestPart(upc, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:depotManagerId1})

        var eventEmitted = false;
        //Get the responce
        const response = await sc.getSpecs(upc)

        //check for last past emitted events 
        await sc.getPastEvents("RequestedPart", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        pStage = 1
        //Verify the responses
        assert.equal(response[0], printerId, "Error: Invalid printer ID")
        assert.equal(response[1], layer_thickness, "Error: Invalid printer layer thickness")
        assert.equal(response[2], fill_pattern, "Error: Invalid printer fill pattern")
        assert.equal(response[3], orientation, "Error: Invalid printer orientation")
        assert.equal(response[4], stl, "Error: Invalid printer STL")
        assert.equal(response[5], cad, "Error: Invalid printer CAD")
        assert.equal(response[6], temp, "Error: Invalid printer temperature")
        assert.equal(response[7], pStage, "Error: Invalid printer stage")

    })

    it("Test: requestPart(), with invalid input", async() => {  
        let sc = await SupplyChain.deployed(); 
        try {
            await sc.requestPart(upc, layer_thickness+1, "Grid", "Horizontal", stl, cad, temp, {from:depotManagerId1})
        } catch {
            return "Part with the same UPC has already been requested";
        }
    })

    it("Test: requestPart(), with invalid input ", async() => {  
        let sc = await SupplyChain.deployed(); 
        try {
            await sc.requestPart(upc+1, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:operatorId1})
        } catch {
            return "Part with the same UPC has already been requested";
        }
    })

    it ("Test: approvePart(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        
        //create the part
        await sc.approvePart(upc,{from:operatorId1})

        var eventEmitted = false;
        //Get the responce
        const response = await sc.getSpecs(upc)

        //check for last past emitted events 
        await sc.getPastEvents("ApprovedPart", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        pStage = 2
               
        //Verify the responses
        assert.equal(response[0], printerId, "Error: Invalid printer ID")
        assert.equal(response[1], layer_thickness, "Error: Invalid printer layer thickness")
        assert.equal(response[2], fill_pattern, "Error: Invalid printer fill pattern")
        assert.equal(response[3], orientation, "Error: Invalid printer orientation")
        assert.equal(response[4], stl, "Error: Invalid printer STL")
        assert.equal(response[5], cad, "Error: Invalid printer CAD")
        assert.equal(response[6], temp, "Error: Invalid printer temperature")
        assert.equal(response[7], pStage, "Error: Invalid printer stage")

    })

    it ("Test: approvePart(), with invalid input", async() => {
        //create the part
       

        let sc = await SupplyChain.deployed(); 
        try {
            await sc.approvePart(upc,{from:depotManagerId1})
        } catch {
            return 0;
        }

    })

    it ("Test: discardPart(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        
        //create the part
        await sc.requestPart(upc+1, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:depotManagerId1})

        var eventEmitted = false;
        
        //Get the responce
        const response = await sc.getSpecs(upc+1)

        //check for last past emitted events 
        await sc.getPastEvents("RequestedPart", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        pStage = 1
        //Verify the responses
        assert.equal(response[0], printerId, "Error: Invalid printer ID")
        assert.equal(response[1], layer_thickness, "Error: Invalid printer layer thickness")
        assert.equal(response[2], fill_pattern, "Error: Invalid printer fill pattern")
        assert.equal(response[3], orientation, "Error: Invalid printer orientation")
        assert.equal(response[4], stl, "Error: Invalid printer STL")
        assert.equal(response[5], cad, "Error: Invalid printer CAD")
        assert.equal(response[6], temp, "Error: Invalid printer temperature")
        assert.equal(response[7], pStage, "Error: Invalid printer stage")

        await sc.discardPart(upc+1,{from:operatorId1})
        const response2 = await sc.getSpecs(upc+1)

        await sc.getPastEvents("DiscardedPart", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        pStage = 1
        //Verify the responses
        assert.equal(response2[0], "0x0000000000000000000000000000000000000000000000000000000000000000", "Error: Invalid printer ID")
        assert.equal(response2[1], 0, "Error: Invalid printer layer thickness")
        assert.equal(response2[2], "", "Error: Invalid printer fill pattern")
        assert.equal(response2[3], "", "Error: Invalid printer orientation")
        assert.equal(response2[4], "0x0000000000000000000000000000000000000000000000000000000000000000", "Error: Invalid printer STL")
        assert.equal(response2[5], "0x0000000000000000000000000000000000000000000000000000000000000000", "Error: Invalid printer CAD")
        assert.equal(response2[6], 0, "Error: Invalid printer temperature")
        assert.equal(response2[7], 0, "Error: Invalid printer stage")

    })

    //  Test function: createdPart /
    it ("Test: createdPart(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
        
        //create the part
        await sc.createdPart(upc, lon, lat, depotId, {from:operatorId1})

        var eventEmitted = false;
        //Get the responce
        const response = await sc.getPart(upc)

        //check for last past emitted events 
        await sc.getPastEvents("Created", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        

        //Update test partOwnerID
        partOwnerId = depotManagerId1;

        //Verify the responses
        assert.equal(response[0], id, "Error: Invalid item ID")
        assert.equal(response[1], stock, "Error: Invalid item STOCK")
        assert.equal(response[2], printerId, "Error: Invalid item PRINTERID")
        assert.equal(response[3], partOwnerId, "Error: Invalid owner ID")
        assert.equal(response[4], operatorId1, "Error: Invalid PART OPERATOR")
        assert.equal(response[5], depotId, "Error: Invalid CREATIONDEPOTID")
        assert.equal(response[6], state, "Error: Invalid item STATE")
        assert.equal(response[7], lon, "Error: Invalid item LONGIDUTE")
        assert.equal(response[8], lat, "Error: Invalid item LATITUDE")
        
        assert.equal(response[10], false, "Error: Invalid item DEPLOYED")

    })
    
    it("Test: createdPart(), with invalid caller", async() => {  
        let sc = await SupplyChain.deployed(); 
        try {
            await sc.addManagerDepot(depotManagerId2)
            await sc.createdPart(upc, lon, lat, depotId, {from:operatorId2})
        } catch {
            return 0;
        }
    })
    
    
    it("Test: createdPart(), with invalid depotId", async() => {  
        let sc = await SupplyChain.deployed(); 
        try {
            //await sc.addManagerDepot(depotManagerId1)
            await sc.createdPart(upc, lon, lat, 132, {from:operatorId1})
        } catch {
            return 0;
        }
    })

    it ("Test: shipPartToDepot(), with valid input", async() => {
        const sc = await SupplyChain.deployed();
       
        //init a var for event
        var eventEmitted = false;

        state = 1

        
        //Mark  aproduct as created by calling createdPart()
        await sc.shipPartToDepot(upc, depotManagerId2, {from:depotManagerId1})

        //Retrive the item from blockchain by calling function get item 
        const response = await sc.getPart.call(upc)

        //check for last past emitted events 
        await sc.getPastEvents("ShippedToDepot", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        

        //Update test partOwnerID
        partOwnerId = depotManagerId2;

        //Verify the responses
        assert.equal(response[0], id, "Error: Invalid item ID")
        assert.equal(response[1], stock, "Error: Invalid item STOCK")
        assert.equal(response[2], printerId, "Error: Invalid item PRINTERID")
        assert.equal(response[3], partOwnerId, "Error: Invalid owner ID")
        assert.equal(response[4], operatorId1, "Error: Invalid PART OPERATOR")
        assert.equal(response[5], depotId, "Error: Invalid CREATIONDEPOTID")
        assert.equal(response[6], state, "Error: Invalid item STATE")
        assert.equal(response[7], lon, "Error: Invalid item LONGIDUTE")
        assert.equal(response[8], lat, "Error: Invalid item LATITUDE")
        
        assert.equal(response[10], false, "Error: Invalid item DEPLOYED")



    })

    it("Test: shipPartToDepot(), with invalid input", async() => {  
        let sc = await SupplyChain.deployed(); 
        
        try {
            await sc.shipPartToDepot(upc, depotManagerId2, {from:operatorId1})
        } catch {
            return 0;
        }
    })

    it ("Test: shipPartToField(), with valid input", async() => {
        
        const sc = await SupplyChain.deployed();

        var eventEmitted = false;

        state = 2

        
        
        await sc.shipPartToField(upc, fieldManagerId1, {from:depotManagerId2})

        //Retrive the item from blockchain by calling function get item 
        const response = await sc.getPart.call(upc)

        //check for last past emitted events 
        await sc.getPastEvents("ShippedToField", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        

        //Update test partOwnerID
        partOwnerId = fieldManagerId1;

        //Verify the responses
        assert.equal(response[0], id, "Error: Invalid item ID")
        assert.equal(response[1], stock, "Error: Invalid item STOCK")
        assert.equal(response[2], printerId, "Error: Invalid item PRINTERID")
        assert.equal(response[3], partOwnerId, "Error: Invalid owner ID")
        assert.equal(response[4], operatorId1, "Error: Invalid PART OPERATOR")
        assert.equal(response[5], depotId, "Error: Invalid CREATIONDEPOTID")
        assert.equal(response[6], state, "Error: Invalid item STATE")
        assert.equal(response[7], lon, "Error: Invalid item LONGIDUTE")
        assert.equal(response[8], lat, "Error: Invalid item LATITUDE")
        
        assert.equal(response[10], false, "Error: Invalid item DEPLOYED")



    })

    it("Test: shipPartToField(), with invalid input", async() => {  
        let sc = await SupplyChain.deployed(); 
        
        try {
            await sc.shipPartToField(upc, depotManager2, {from:operatorId1})
        } catch {
            return 0;
        }
    })

    it ("Test: deployPart(), with valid input", async() => {
        
        const sc = await SupplyChain.deployed();
        // init a var for event
        var eventEmitted = false;

        state = 3

        
        await sc.deployPart(upc, {from:fieldManagerId1})

        //Retrive the item from blockchain by calling function get item 
        const response = await sc.getPart.call(upc)

        //check for last past emitted events 
        await sc.getPastEvents("Deployed", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });
        


        //Verify the responses
        assert.equal(response[0], id, "Error: Invalid item ID")
        assert.equal(response[1], stock, "Error: Invalid item STOCK")
        assert.equal(response[2], printerId, "Error: Invalid item PRINTERID")
        assert.equal(response[3], partOwnerId, "Error: Invalid owner ID")
        assert.equal(response[4], operatorId1, "Error: Invalid PART OPERATOR")
        assert.equal(response[5], depotId, "Error: Invalid CREATIONDEPOTID")
        assert.equal(response[6], state, "Error: Invalid item STATE")
        assert.equal(response[7], lon, "Error: Invalid item LONGIDUTE")
        assert.equal(response[8], lat, "Error: Invalid item LATITUDE")
        //assert.equal(response[5], timestamp, "Error: Invalid item TIMESTAMP")
        assert.equal(response[10], true, "Error: Invalid item DEPLOYED")



    })

    it("Test: deployPart(), with invalid input", async() => {  
        let sc = await SupplyChain.deployed(); 
        
        try {
            await sc.deployPart(upc, {from:depotManager2})
        } catch {
            return 0;
        }
    })
    
    it("Test: deleteDepot(), with valid input", async() => {  
        const sc = await SupplyChain.deployed(); 

        
        await sc.deleteDepot(depotId)
        var eventEmitted = false;

        //Get the response
        const response = await sc.getDepot(depotId)

        //check for last past emitted events 
        await sc.getPastEvents("DepotDeleted", {
            fromBlock: 0,
            toBlock: 'latest'
        }, (error,events) => { console.log (events,error); })
        .then((events) => {
            eventEmitted = true;
        });

        //Verify the responses
        assert.equal(response[0], 0x0000000000000000000000000000000000000000, "Error: Invalid operator ID")
        assert.equal(response[1],  0x0000000000000000000000000000000000000000, "Error: Invalid manager ID")
    })

    
});



