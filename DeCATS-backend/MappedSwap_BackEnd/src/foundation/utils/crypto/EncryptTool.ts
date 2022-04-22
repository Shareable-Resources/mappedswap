import ReadlineHelper from '../ReadlineHelper';
import crypto from 'crypto';
import ecsdaHelper from '../ecsda/ecdsa';
import Web3 from 'web3';
import logger from '../ServiceLogger';
import EthCrypto from 'eth-crypto';

export enum EncryptMode {
  E = 'Encrypt',
  D = 'Decrypt',
  S = 'Sign',
  R = 'Recover',
  W = 'WalletAddress',
}

export default class EncryptTool {
  readlineHelper: ReadlineHelper;

  private privateKey: string;
  private publicKey: string;
  constructor() {
    this.readlineHelper = new ReadlineHelper();
    this.privateKey = '';
    this.publicKey = '';
  }
  async start() {
    let encryptMode: EncryptMode | any = '';
    const allowedMode = ['E', 'D', 'S', 'R', 'W'];
    //Ask For Encrypt or Decrypt
    while (!allowedMode.includes(encryptMode)) {
      // encryptMode = await this.readlineHelper.askNoMask(
      //   'What do you want to do? E=Encrypt, D=Decrypt, S=Sign, R=RecoverPubKeyFromPrivateKey, W=WalletAddressFromPublicKey : ',
      // );
      encryptMode = await this.readlineHelper.askNoMask(
        'What do you want to do? E=Encrypt, D=Decrypt, R=RecoverPubKeyFromPrivateKey, W=WalletAddressFromPublicKey : ',
      );
      encryptMode = allowedMode.includes(encryptMode.toUpperCase())
        ? encryptMode.toUpperCase()
        : '';
    }
    this.printMode(encryptMode.toUpperCase());
    switch (encryptMode.toUpperCase()) {
      case 'S':
        this.signByPrivateKey();
        break;
      case 'E':
        this.encryptByPrivateKey();
        break;
      case 'D':
        this.decryptByPrivateKey();
        break;
      case 'R':
        this.recoverPubKeyFromPrivateKey();
        break;
      case 'W':
        this.recoverWalletAddressFromPriavteKey();
        break;
    }
  }

  async signByPrivateKey() {
    //
  }

  async encryptByPublicKey() {
    //Ask For Public Key
    let yesOrNo = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.publicKey = await this.readlineHelper.askNoMask(
        'Please enter your public key: ',
      );
      console.log(`Public key : ${this.publicKey}`);
      yesOrNo = await this.readlineHelper.askNoMask(
        'Do you want to use this public key for encryption? Y=Yes, N=No: ',
      );
      if (yesOrNo.toUpperCase() == 'Y') {
        break;
      }
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const message = await this.readlineHelper.askNoMask(
        "Please enter message u want to be encrypted with this public key (enter 'exit' to stop this process): ",
      );
      if (message.toLowerCase() == 'exit') {
        break;
      }
      try {
        // const messageEncrypted = crypto.publicEncrypt(
        //   this.publicKey,
        //   Buffer.from(message),
        // );

        const messageEncrypted = await ecsdaHelper.encryptByPublicKey(
          this.publicKey,
          message,
        );

        console.log(`Encrypted Message: ${messageEncrypted}`);
        console.log(`Message now can use your private key to decrypt`);
      } catch (e) {
        console.log('Please enter right public to encrypt');
      }
    }
  }

  async encryptByPrivateKey() {
    //Ask For Public Key
    let yesOrNo = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.publicKey = await this.readlineHelper.askNoMask(
        'Please enter your private key: ',
      );
      console.log(`Public key : ${this.publicKey}`);
      yesOrNo = await this.readlineHelper.askNoMask(
        'Do you want to use this private key for encryption? Y=Yes, N=No: ',
      );
      if (yesOrNo.toUpperCase() == 'Y') {
        break;
      }
    }

    const publicKey = ecsdaHelper.getPubKey(this.publicKey);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const message = await this.readlineHelper.askNoMask(
        "Please enter message u want to be encrypted with this private key (enter 'exit' to stop this process): ",
      );
      if (message.toLowerCase() == 'exit') {
        break;
      }
      try {
        // const messageEncrypted = crypto.publicEncrypt(
        //   this.publicKey,
        //   Buffer.from(message),
        // );

        const messageEncrypted = await ecsdaHelper.encryptByPublicKey(
          publicKey,
          message,
        );

        console.log(`Encrypted Message: ${messageEncrypted}`);
        console.log(`Message now can use your private key to decrypt`);
      } catch (e) {
        console.log('Please enter right public to encrypt');
      }
    }
  }

  async decryptByPrivateKey() {
    //Ask For Private Key
    let yesOrNo = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.privateKey = await this.readlineHelper.askNoMask(
        'Please enter your private key: ',
      );
      console.log(`Private key : ${this.privateKey}`);
      yesOrNo = await this.readlineHelper.askNoMask(
        'Do you want to use this public key for encryption? Y=Yes, N=No: ',
      );
      if (yesOrNo.toUpperCase() == 'Y') {
        break;
      }
    }
    let message = '';
    while (message.toLowerCase() != 'exit') {
      message = await this.readlineHelper.askNoMask(
        "Please enter message u want to be decrypted with this private key (enter 'exit' to stop this process): ",
      );
      if (message.toLowerCase() == 'exit') {
        break;
      }
      try {
        // const message = crypto.privateDecrypt(
        //   this.privateKey,
        //   Buffer.from(messageEncrypted),
        // );

        // const decryptedMessage = await EthCrypto.decryptWithPrivateKey(
        //   this.privateKey, // privateKey
        //   EthCrypto.cipher.parse(message),
        // );

        const decryptedMessage = await ecsdaHelper.decryptByPrivateKey(
          this.privateKey,
          message,
        );

        console.log(`Decrypted Message: ${decryptedMessage}`);
        console.log(`Decrypt Success`);
      } catch (e) {
        console.log('Please enter right privateKey to decrypt');
      }
    }
  }

  // only ESCDA private key, from metamask
  async recoverPubKeyFromPrivateKey() {
    // eslint-disable-next-line prefer-const
    let message = '';
    while (message.toLowerCase() != 'exit') {
      const message = await this.readlineHelper.askNoMask(
        "Please enter elliptic private key (enter 'exit' to stop this process): ",
      );
      try {
        console.log(`Private Key: ${message}`);
        const publicKey = ecsdaHelper.getPubKey(message);
        console.log(`Public Key: ${publicKey}`);
      } catch (e) {
        console.log('Please enter right private key');
      }
    }
  }

  // only ESCDA private key, from metamask
  async recoverWalletAddressFromPubKey() {
    // eslint-disable-next-line prefer-const
    let message = '';
    while (message.toLowerCase() != 'exit') {
      const message = await this.readlineHelper.askNoMask(
        "Please enter etheruem public key (enter 'exit' to stop this process): ",
      );
      try {
        console.log(`Public Key: ${message}`);
        const walletAddress = ecsdaHelper.walletAddrFromPubKey(message);
        console.log(`Wallet Address: ${walletAddress}`);
      } catch (e) {
        console.log('Please enter right public key');
      }
    }
  }

  async recoverWalletAddressFromPriavteKey() {
    let message = '';
    while (message.toLowerCase() != 'exit') {
      message = await this.readlineHelper.askNoMask(
        "Please enter etheruem private key (enter 'exit' to stop this process): ",
      );
      try {
        console.log(`Private Key: ${message}`);
        const publicKey = ecsdaHelper.getPubKey(message);
        const walletAddress = ecsdaHelper.walletAddrFromPubKey(publicKey);
        console.log(`Wallet Address: ${walletAddress}`);
      } catch (e) {
        console.log('Please enter right public key');
      }
    }
  }

  printMode(mode: EncryptMode) {
    console.log(`EncryptMode is ${EncryptMode[mode]}`);
  }
}
