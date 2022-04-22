import e from 'express';
import moment from 'moment';
import Web3 from 'web3';

export class ValidationHelper {
  throwError: boolean;
  constructor() {
    this.throwError = false;
  }

  dateOnly(date: string | Date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
  }

  isBoolean(str: any) {
    if (str == true || str == 'true' || str == 1 || str == '1') {
      return true;
      // this should evaluate to true because myString = "true", and it does. Good!
    } else if (str == false || str == 'false' || str == 0 || str == '0') {
      return false;
    } else {
      throw new Error('Invalid Boolean Value');
    }
  }
  isEmail(email: string) {
    const re =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = re.test(email);
    if (this.throwError && !valid) {
      throw new Error('Invalid Email Format');
    }
    return valid;
  }
  isNum(data: any, fieldName: string) {
    const re = /^-?[\d.]+(?:e-?\d+)?$/;
    const valid = re.test(data);
    if (this.throwError && !valid) {
      throw new Error(`Data is not a number - ${fieldName}`);
    }
    return valid;
  }
  isNullOrEmpty(data: any, fieldName: string) {
    if (this.throwError && (data == null || data == undefined)) {
      throw new Error(`Data cannot be null or empty - ${fieldName}`);
    }
    return !data;
  }
  isPercentage(data: any, fieldName: string) {
    if (this.throwError && data > Number(100)) {
      throw new Error(
        `Data must be percentage (Cannot larger than 100) - ${fieldName}`,
      );
    }
    return !data;
  }

  containsElement(
    dataWithDelimeter: string,
    delimiter: string,
    elementValue: string,
    fieldName: string,
    isThrowError?: boolean,
  ) {
    const arr = dataWithDelimeter.split(delimiter);
    if (arr.find((x) => x == elementValue)) {
      return true;
    } else {
      if (isThrowError) {
        throw new Error(`Only allow [${fieldName}] to handle`);
      } else {
        return false;
      }
    }
  }

  checkRole(role: any, expectedRole: string, parentAgentId: any) {
    if (
      !role ||
      !role.includes('|') ||
      !this.containsElement(role, '|', expectedRole, expectedRole, false)
      // || parentAgentId
    ) {
      if (parentAgentId) {
        throw new Error(`User must be ${expectedRole} role to view this page`);
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  isWalletAddress(address: string) {
    const isAddress = Web3.utils.isAddress(address);
    if (!isAddress) {
      throw new Error(`Address (${address}) is not an Ethereum address`);
    } else {
      return true;
    }
  }

  isEnum(data: any, fieldName: string, enums: any) {
    if (!(data in enums)) {
      const entries = Object.keys(enums);
      const keys = entries.slice(entries.length / 2, entries.length);
      const values = entries.slice(0, entries.length / 2);
      const stringArr: string[] = [];
      for (let i = 0; i < keys.length; i++) {
        stringArr.push(`(${keys[i]}:${values[i]})`);
      }
      throw new Error(`${fieldName} must be ${stringArr.join(',')}`);
    } else {
      return true;
    }
  }
}
