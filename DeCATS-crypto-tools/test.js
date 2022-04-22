const mappedswap_crypto = require("./CryptoTools");

let encrypted = mappedswap_crypto.encrypt("private_key", "password");
console.info(encrypted);
console.info(mappedswap_crypto.decrypt(encrypted, "password"));