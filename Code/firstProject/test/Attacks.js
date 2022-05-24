/*
In order to perform the tests on the private blockchain network:    1. Clone the git repo: https://github.com/deanstef/quorum-network.git
                                                                    2. Run the netowrk:
                                                                    On windows: $env:PRIVATE_CONFIG="ignore"; $env:QUORUM_CONSENSUS="clique"; docker-compose up -d   
                                                                    On Linux: PRIVATE_CONFIG=ignore QUORUM_CONSENSUS=clique docker-compose up -d   
                                                                    3. Run docker exec -it  quorum-network-node1-1 geth attach /qdata/dd/geth.ipc to connect to the 1st node
                                                                    4. Run personal.newAccount("seed") and personal.unlockAccount() to use the accounts                                                                                                                              
                                                                    5. Configure the truffle-config.js and change the development port on 22000(1st node)
                                                                    6. Run: truffle test test/Attacks.js
                                                                   
                                                                    *For network attacks run: ./pumba kill name-of-container
 */
var SupplyChain = artifacts.require("SupplyChain");
var Operator = artifacts.require("Operator");
var ManagerDepot = artifacts.require("ManagerDepot");
var ManagerField = artifacts.require("ManagerField");
var Roles = artifacts.require("Roles");
var Ownership = artifacts.require("Ownership");

contract( "SupplyChain", function(accounts) {
   
     const contractOwnerId = accounts[0]
     const operatorId1 = accounts[1]
     const operatorId2 = accounts[2]
     const fieldManagerId1 = accounts[3]
     const fieldManagerId2 = accounts[4]
     const depotManagerId1 = accounts[5]
     const depotManagerId2 = accounts[6]

    // const operatorId2 = "0xae9bc6cd5145e67fbd1887a5145271fd182f0ee7"
    // const fieldManagerId2 = "0xcc71c7546429a13796cf1bf9228bff213e7ae9cc"
    // const contractOwnerId = "0xed9d02e382b34818e88b88a309c7fe71e65f419d"
    // const operatorId1 = "0xca843569e3427144cead5e4d5999a3d0ccf92b8e"
    // const fieldManagerId1 ="0x0638e1574728b6d862dd5d3a3e0942c3be47d996"
    // const depotManagerId1 = "0x0fbdc686b912d7722dc86510934589e0aaf3b55a"
    // const depotManagerId2 = "0x9186eb3d20cbd1f5f992a950d808c4495153abd5"

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
    var bad_stl = "0x7465737201020000000000000000000000000000000000000000000000000000"
    var bad_cad = "0x7465737106050000000000000000000000000000000000000000000000000000"
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

    console.log("<<<<<<<<<< Attacks on the Supply Chain >>>>>>>>>>")
    
    
    it("Attack Detected: Unauthorised addition of participants", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.addOperator(operatorId1,{from:fieldManagerId2})            
            
        } catch (err) {
            // return console.log(err.message);
            return ;
        }
    })

    it("Attack Detected: Unauthorised deletion of participants", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.addOperator(operatorId1)
            await sc.removeOperator({from: fieldManagerId2})
            
        } catch (err) {
            // return console.log(err.message);
            return ;
        }
    })

    it("Attack Detected: Unauthorised call for adding a depot", async() => {  
        const sc = await SupplyChain.deployed(); 
       // await sc.addOperator(operatorId1)
        await sc.addManagerDepot(depotManagerId1)
       
        try {
            await sc.addDepot(operatorId1,depotManagerId1,{from:operatorId1})            
            
        } catch (err) {
            // return console.log(err.message);
            return ;
        }
    })
    it("Attack Detected: Unauthorised address requesting part creation", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.requestPart(upc+1, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:operatorId1})
        } catch (err){
            // return console.log(err.message);
            return ;
        }
    })

    it("Attack Detected: Part request with the same UPC but different printer configurations", async() => {  
        const sc = await SupplyChain.deployed(); 
        await sc.requestPart(upc, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:depotManagerId1})
        try {
            await sc.requestPart(upc, layer_thickness+1, "Grid", "Horizontal", stl, cad, temp, {from:depotManagerId1})
        } catch (err){
            // return console.log(err.message);
            return ;
        }
    })

    it("Attack Detected: Part request with the same UPC but tampered CAD file", async() => {  
        const sc = await SupplyChain.deployed(); 
        await sc.requestPart(upc+1, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:depotManagerId1})
        try {
            await sc.requestPart(upc+1, layer_thickness+1, fill_pattern, orientation, stl, bad_cad, temp, {from:depotManagerId1})
        } catch (err){
            // return console.log(err.message);
            return ;
        }
    })

    it ("Attack Detected: Request for part approval by unauthorised address", async() => {
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.approvePart(upc,{from:depotManagerId1})
        } catch (err) {
            // return console.log(err.message);
            return ;
        }

    })

    it("Attack Detected: Part creation call from unauthorised caller", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.addManagerDepot(depotManagerId2)
            await sc.createdPart(upc, lon, lat, depotId, {from:operatorId2})
        } catch (err) {
            // return console.log(err.message);
            return ;
        }
    })

    it ("Attack Detected: Part information modification", async() => {
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.addDepot(depotId,operatorId1,depotManagerId1)
            var eventEmitted = false;

            //Get the response
            const response0 = await sc.getDepot(depotId)

            //check for last past emitted events 
            await sc.getPastEvents("DepotCreated", {
                fromBlock: 0,
                toBlock: 'latest'
            }, (error,events) => { console.log (events,error); })
                .then((events) => {
                eventEmitted = true;
            });

            //Verify the responses
            assert.equal(response0[0], operatorId1, "Error: Invalid operator ID")
            assert.equal(response0[1], depotManagerId1, "Error: Invalid manager ID")

            
            await sc.addOperator(operatorId2)
            await sc.approvePart(upc,{from:operatorId1})
            var eventEmitted = false;
            await sc.createdPart(upc, lon, lat, depotId, {from:operatorId1})
            
            await sc.createdPart(upc, -lon, -lat, depotId, {from:operatorId2})
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
        } catch (err) {
            // return console.log(err.message);
            return ;
        }

    })

    it("Attack Detected: Creation of unapproved part", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            
            await sc.createdPart(upc+1, lon, lat, depotId, {from:operatorId2})
        } catch (err) {
            // return console.log(err.message);
            return ;
        }
    })

    it("Attack Detected: Unauthorised information exposure on military depot information", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            await sc.addDepot(depotId+2,operatorId2,depotManagerId2)
            var eventEmitted = false;
            
           //Get the response
            const response = await sc.getDepot(depotId+2,{from:fieldManagerId2})

           //check for last past emitted events 
           await sc.getPastEvents("DepotCreated", {
               fromBlock: 0,
               toBlock: 'latest'
           }, (error,events) => { console.log (events,error); })
               .then((events) => {
               eventEmitted = true;
           });

           //Verify the responses
           assert.equal(response0[0], operatorId1, "Error: Invalid operator ID")
           assert.equal(response0[1], depotManagerId1, "Error: Invalid manager ID")
        } catch (err) {
            // return console.log(err.message);
             return ;
        }
    })

    it("Attack Detected: Unauthorised information exposure on military spare part information", async() => {  
        const sc = await SupplyChain.deployed(); 
        try {
            
            const response = await sc.getPart(upc,{from:fieldManagerId2})
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
        } catch (err) {
            // return console.log(err.message);
             return ;
        }
    })


    it ("Attack Detected: Unauthorised information exposure on military spare part specs", async() => {
        const sc = await SupplyChain.deployed();
        
        try {
        const response = await sc.getSpecs(upc, {from:fieldManagerId2})

        //check for last past emitted events 
        await sc.getPastEvents("Created", {
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

        } catch (err) {
            // return console.log(err.message);
             return ;
        }
    })

    it ("Attack Detected: STL File modification", async() => {
        const sc = await SupplyChain.deployed();
        
        await sc.requestPart(upc+13, layer_thickness, fill_pattern, orientation, bad_stl, cad, temp, {from:depotManagerId1})

        
        try {
            await sc.approvePart(upc+13,{from:operatorId1})
        } catch (err) {
           return console.log(err.message);
      return ;
        }
    })

    it ("Attack Detected: CAD File modification", async() => {
        const sc = await SupplyChain.deployed();
        
        await sc.requestPart(upc+14, layer_thickness, fill_pattern, orientation, stl, bad_cad, temp, {from:depotManagerId1})

        
        try {
            await sc.approvePart(upc+14,{from:operatorId1})
        } catch (err) {
            // return console.log(err.message);
             return ;
        }
    })

    

});