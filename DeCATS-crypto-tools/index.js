const CryptoTools = require("./CryptoTools");
let CryptoEth = undefined;
try{
    CryptoEth = require("./CryptoEth");
}catch(e){
    console.warn('CryptoEth not installed. Pleaes run "npm install eth-crypto" if need to encrypt other content using input private key.');
}
const readline = require('readline');
var Writable = require('stream').Writable;

var mutableStdout = new Writable({
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


async function encryptWithInputPrivateKey(rl, cryptoEth) {
    let textForEncrypt = await consoleRead('Encrypt with private key(Enter empty string to exit): ', rl)
    if(textForEncrypt == ""){
        return { success: false };
    }else{
        let encryptedText = await cryptoEth.encrypt(textForEncrypt);
        let decryptedText = await cryptoEth.decrypt(encryptedText);
        if (decryptedText == textForEncrypt) {
            return { success: true, result: encryptedText };
        } else {
            console.info('Encrypt with private key error! Decrypted data not match!');
            return { success: false };
        }
    }
}

async function main1(rl) {

    let privateKey = await consoleRead('Please input content: ', rl, true);

    console.log(privateKey);
    let cryptoEth = CryptoEth ? new CryptoEth() : null;
    console.log(cryptoEth);
    console.log('asfad: ', cryptoEth.init(privateKey));
    if(cryptoEth){
        //0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07
        if (!cryptoEth.init(privateKey)) {
            console.info("Input is not a valid private key."); 
            return;
        }
        //
        console.info(`You input a private key. Corresponding address: ${cryptoEth.address}`);  
    }

    let password1 = await consoleRead('Your password: ', rl, true);
    let password2 = await consoleRead('Confirm password: ', rl, true);

    if(password1 == password2 ){
        let encrypted = CryptoTools.encrypt(privateKey, password1);
        let decrypted = CryptoTools.decrypt(encrypted, password1);
        if (decrypted == privateKey) {
            console.info(`Encrypted private key: ${encrypted}`);

            if(cryptoEth){
                let encryptedResult = await encryptWithInputPrivateKey(rl, cryptoEth);
                while (encryptedResult.success) {
                    console.info(`Encryped text: ${encryptedResult.result}`);
                    encryptedResult = await encryptWithInputPrivateKey(rl, cryptoEth);
                }
            }
        }
    }else{
        console.info("Two input passwords not matched.");
    }
}

async function main(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: mutableStdout,
        terminal: true
    });
    try{
        await main1(rl);
    }finally{
        rl.close();
        console.info("Exited.")
    }
}

main();



