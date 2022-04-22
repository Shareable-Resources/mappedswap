import bcrypt from 'bcrypt';
import foundationConfigJSON from '../../config/FoundationConfig.json';
import { crytoDecimalPlace } from '../../general/model/dbModel/Prices';
import crypto from 'crypto';

const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];

export async function hashIt(password) {
  const saltNumber = foundationConfig.salt;

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  return hashed;
}

export async function compareIt(password, hashed) {
  const validPassword = await bcrypt.compare(password, hashed);
}

export async function makeId(length?) {
  if (!length) {
    length = 10;
  }

  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * Math.random() * charactersLength),
    );
  }
  return result;
}

export async function getPairListDecimalPlace(element: any) {
  const pairList: any = element['pairName'].split('/');

  const usdmAddress =
    foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<USDM>'].address;
  const btcmAddress =
    foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<BTCM>'].address;
  const ethmAddress =
    foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<ETHM>'].address;

  let reserve0DecimalPlace = 0;
  let reserve1DecimalPlace = 0;

  // if (pairList[0] == 'ETHM') {
  //   reserve0DecimalPlace = crytoDecimalPlace.ETHM;
  // } else if (pairList[0] == 'BTCM') {
  //   reserve0DecimalPlace = crytoDecimalPlace.BTCM;
  // } else {
  //   reserve0DecimalPlace = crytoDecimalPlace.USDM;
  // }

  // if (pairList[1] == 'ETHM') {
  //   reserve1DecimalPlace = crytoDecimalPlace.ETHM;
  // } else if (pairList[1] == 'BTCM') {
  //   reserve1DecimalPlace = crytoDecimalPlace.BTCM;
  // } else {
  //   reserve1DecimalPlace = crytoDecimalPlace.USDM;
  // }

  if (pairList.includes('USDM')) {
    if (pairList.includes('BTCM')) {
      if (usdmAddress < btcmAddress) {
        reserve0DecimalPlace = crytoDecimalPlace.USDM;
        reserve1DecimalPlace = crytoDecimalPlace.BTCM;
      } else {
        reserve1DecimalPlace = crytoDecimalPlace.USDM;
        reserve0DecimalPlace = crytoDecimalPlace.BTCM;
      }
    }

    if (pairList.includes('ETHM')) {
      if (usdmAddress < ethmAddress) {
        reserve0DecimalPlace = crytoDecimalPlace.USDM;
        reserve1DecimalPlace = crytoDecimalPlace.ETHM;
      } else {
        reserve1DecimalPlace = crytoDecimalPlace.USDM;
        reserve0DecimalPlace = crytoDecimalPlace.ETHM;
      }
    }
  }

  const decimalList = {};
  decimalList['reserve0DecimalPlace'] = reserve0DecimalPlace;
  decimalList['reserve1DecimalPlace'] = reserve1DecimalPlace;

  return decimalList;
}

export async function decrypt(base64String: string) {
  const encryptionType = 'aes-256-cbc';
  const encryptionEncoding = 'base64';
  const bufferEncryption = 'utf-8';

  const aesKey = process.argv[2];
  const aesIV = process.argv[3];

  const buff = Buffer.from(base64String, encryptionEncoding);
  const key = Buffer.from(aesKey, bufferEncryption);
  const iv = Buffer.from(aesIV, bufferEncryption);
  const decipher = crypto.createDecipheriv(encryptionType, key, iv);
  // const deciphered = decipher.update(buff) + decipher.final();
  const deciphered = Buffer.concat([decipher.update(buff), decipher.final()]);
  return JSON.parse(deciphered.toString());
}
