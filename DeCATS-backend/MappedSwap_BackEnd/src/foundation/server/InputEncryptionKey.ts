import { NextFunction, Response } from 'express';
import { decryptText } from '../utils/crypto/CryptoTools';
import ReadlineHelper from '../utils/ReadlineHelper';

export let encryptionKey: string | null;
export enum EncryMsg {
  failKey = '[Fail Encryption] Incorrect key, Enter again',
  failInitDb = '[Fail Encryption] Login Failed, Enter again',
}

// export let encryptionIV: string | null;

export default class EncryptionDetailTool {
  readlineHelper: ReadlineHelper;

  constructor() {
    this.readlineHelper = new ReadlineHelper();
  }

  async encryptionKey_bk() {
    encryptionKey = null;
    while (!encryptionKey) {
      encryptionKey = await this.readlineHelper.ask(
        'Please enter Encryption key: ',
      );
    }
  }

  async encryptionKey() {
    encryptionKey = null;
    let encryptedPrivateKey: any = null;
    let password: any = null;

    while (!encryptedPrivateKey) {
      encryptedPrivateKey = await this.readlineHelper.ask(
        'Please enter Encrypted Private key: ',
      );
    }
    while (!password) {
      password = await this.readlineHelper.ask('Please enter your Password: ');
    }

    encryptionKey = decryptText(encryptedPrivateKey, password);

    // console.log('encryptionKey: ' + encryptionKey);
  }
}
