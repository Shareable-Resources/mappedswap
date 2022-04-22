const EthCrypto = require('eth-crypto');

class CryptoEth{

    privateKey;
    publicKey;
    address;

    init(privateKey){
        this.privateKey = privateKey;
        try{
            this.publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
            this.address = EthCrypto.publicKey.toAddress(this.publicKey);
            return true;
        }catch(e){
            return false;
        }
    }

    get privateKey() {
        return this.privateKey;
    }

    get publicKey() {
        return this.publicKey;
    }

    get address(){
        return this.address;
    }

    async encrypt(content){
        return this.encryptWithPublicKey(content);
    }
    
    async encryptWithPublicKey(content){
        let encrypted = await EthCrypto.encryptWithPublicKey(this.publicKey, content);
        return EthCrypto.cipher.stringify(encrypted);
    }
    
    async decrypt(encryptedText){
        let encrypted = EthCrypto.cipher.parse(encryptedText);
        return await EthCrypto.decryptWithPrivateKey(this.privateKey, encrypted);
    }
};

module.exports = CryptoEth;
