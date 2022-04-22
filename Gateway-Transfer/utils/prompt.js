const readline = require('readline');
let Writable = require('stream').Writable;
const mappedswap_crypto = require("./CryptoTools");
const CryptoEth = require("./CryptoEth");

let key = null;

let mutableStdout = new Writable({
    write: function (chunk, encoding, callback) {
        if (!this.muted)
            process.stdout.write(chunk, encoding);
        callback();
    }
});

mutableStdout.muted = false;
 
async function consoleRead(question, rl, muted = false){
    return new Promise((resolve, reject) => {
        rl.question(question, async function (input) {
            if(muted){
                console.info("\r");
                mutableStdout.muted = false;
            }
            resolve(input);
        });
        mutableStdout.muted = muted;
    });
}

async function getKey(pwd) {
    if (key !== null) {
        return key;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: mutableStdout,
        terminal: true
    });

    let privateKey = null;
    while(privateKey === null) {
      try {
          const inputPrivateKey = await consoleRead('Please input encrypted private key: ', rl, true); 
          const inputPassword = await consoleRead('Please input password: ', rl, true); 
          //console.info(inputPrivateKey);
          //console.info(inputPassword);
          privateKey = mappedswap_crypto.decrypt(inputPrivateKey, inputPassword);
          const cryptoEth = new CryptoEth();
          cryptoEth.init(privateKey);
          key = cryptoEth;
      }
      catch(e) {
        console.error("err > ", e);
      }
    }
  
    rl.close();
    return key;
}

module.exports = {
    getKey
}










