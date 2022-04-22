const fs = require("fs");
const prettier = require("prettier");

const src = "./build/contracts/";
const dst = "./build/abi/";

fs.mkdirSync(dst, { recursive: true });

let files = fs.readdirSync(src);

files.forEach(file => {
    let abi = JSON.parse(fs.readFileSync(src + file, { encoding: "utf8", flag: "r" })).abi;
    if (abi.length == 0) {
        return;
    }

    fs.writeFileSync(dst + file, prettier.format(JSON.stringify(abi), { parser: "json", printWidth: 120 }), { encoding: "utf8", flag: "w" });
});
