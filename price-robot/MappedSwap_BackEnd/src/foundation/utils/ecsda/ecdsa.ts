import Web3 from 'web3';
import elliptic from 'elliptic';
import EthCrypto from 'eth-crypto';
import { decrypt } from '../../server/CommonFunction';

const ECSDAHelper = {
  //recover wallet address from pubKey
  //pubKey
  walletAddrFromPubKey(pubKey: string) {
    const ec = new elliptic.ec('secp256k1');
    const ecKey = ec.keyFromPublic(pubKey, 'hex');
    const pubKeyHex = `0x${ecKey.getPublic(false, 'hex').slice(2)}`;
    const pubHash = Web3.utils.sha3(pubKeyHex);
    const address = Web3.utils.toChecksumAddress(`0x${pubHash?.slice(-40)}`);
    return address;
  },

  getPubKey(privateKey: string) {
    const ec = new elliptic.ec('secp256k1');
    return ec.keyFromPrivate(privateKey).getPublic('hex');
  },

  async encryptByPublicKey(publicKey: string, message: string) {
    const messageEncrypted = EthCrypto.cipher.stringify(
      await EthCrypto.encryptWithPublicKey(
        publicKey, // publicKey
        message, // message
      ),
    );

    return messageEncrypted;
  },

  async decryptByPrivateKey(privateKey: string, message: string) {
    const decryptedMessage = await EthCrypto.decryptWithPrivateKey(
      privateKey, // privateKey
      EthCrypto.cipher.parse(message),
    );

    return decryptedMessage;
  },
};

export default ECSDAHelper;
