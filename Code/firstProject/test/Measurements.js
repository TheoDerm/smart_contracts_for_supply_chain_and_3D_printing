/*
In order to perform the tests on the private blockchain network:    1. Clone the git repo: https://github.com/deanstef/quorum-network.git
                                                                    2. Run the netowrk: 
                                                                    On windows: $env:PRIVATE_CONFIG="ignore"; $env:QUORUM_CONSENSUS="clique"; docker-compose up -d   
                                                                    On Linux: PRIVATE_CONFIG=ignore QUORUM_CONSENSUS=clique docker-compose up -d                                                                                                                       
                                                                    3. Configure the truffle-config.js and change the development port on 22000(1st node)
                                                                    4. Run: truffle test test/Measurements.js
                                                                    System breaks at >16.800 transactions
                                                                     
*/
var SupplyChain = artifacts.require("SupplyChain");
var Operator = artifacts.require("Operator");
var ManagerDepot = artifacts.require("ManagerDepot");
var ManagerField = artifacts.require("ManagerField");
var Roles = artifacts.require("Roles");
var Ownership = artifacts.require("Ownership");

contract( "SupplyChain", function(accounts) {
    // const contractOwnerId = "0xed9d02e382b34818e88b88a309c7fe71e65f419d"
    // const operatorId1 = "0xca843569e3427144cead5e4d5999a3d0ccf92b8e"
    // const fieldManagerId1 ="0x0638e1574728b6d862dd5d3a3e0942c3be47d996"
    // const depotManagerId1 = "0x0fbdc686b912d7722dc86510934589e0aaf3b55a"
    // const depotManagerId2 = "0x9186eb3d20cbd1f5f992a950d808c4495153abd5"

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
    var printerId = 10
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

   // var printerId = "0x4779bc9df805ba44aa374937de2c10e5b0bfa0e6e05f0f966b9a38c837fc1d31"
    var printerId = "0xb8eea7b8a0cd1174711ac4905ba8226e082a61a8fef654f34736f6404d9dd28a"

    //  Test function: createdPart /
    it ("Benchmark of the Blockchain: ", async() => {

        const sc = await SupplyChain.deployed();

        sc.addOperator(operatorId1)
        sc.addManagerDepot(depotManagerId1)
        sc.addManagerDepot(depotManagerId2)
        sc.addManagerField(fieldManagerId1)

        sc.addDepot(depotId,operatorId1,depotManagerId1)
        

        var start = new Date().getTime();
        var counter = 10;
        
        console.log("Start time: " + start)
        console.log("Number of parts: " + counter)
        
        var done = 0;
        for(i=0; i < counter; ++i) {
            sc.requestPart(upc+i, layer_thickness, fill_pattern, orientation, stl, cad, temp, {from:depotManagerId1})
            sc.approvePart(upc+i,{from:operatorId1})

            sc.createdPart(upc+i, lon+i, lat+i, depotId, {from:operatorId1})
            sc.shipPartToDepot(upc+i, depotManagerId2, {from:depotManagerId1})
            sc.shipPartToField(upc+i, fieldManagerId1, {from:depotManagerId2})
            sc.deployPart(upc+i, {from:fieldManagerId1})
            done++;
        }

        if(done>=counter) {
            var end = new Date().getTime();
            var late = end - start;
            var count = 6;
            console.log("Number of transactions: " + count*counter)
            console.log("Latency: " + late + "ms")
            console.log("Tps: " + count*counter*1000 /late )
        }
    })
});