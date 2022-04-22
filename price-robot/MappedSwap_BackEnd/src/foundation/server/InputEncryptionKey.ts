import { NextFunction, Response } from 'express';
import ReadlineHelper from '../utils/ReadlineHelper';

export let encryptionKey: string | null;
// export let encryptionIV: string | null;

export default class EncryptionDetailTool {
  readlineHelper: ReadlineHelper;

  constructor() {
    this.readlineHelper = new ReadlineHelper();
  }

  async encryptionKey() {
    encryptionKey = null;
    while (!encryptionKey) {
      encryptionKey = await this.readlineHelper.ask(
        'Please enter Encryption key: ',
      );
    }
    // while (!encryptionIV) {
    //   encryptionIV = await this.readlineHelper.ask(
    //     'Please enter Encryption IV: ',
    //   );
    // }
  }
}
