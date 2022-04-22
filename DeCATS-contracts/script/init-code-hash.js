const RaijinSwapPair = require("../build/contracts/RaijinSwapPair.json");
const solidity = require("@ethersproject/solidity");

let initCodeHash = solidity.keccak256(["bytes"], [RaijinSwapPair.bytecode]).slice(2);
console.log(initCodeHash);
