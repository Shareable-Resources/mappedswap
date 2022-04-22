import moment from 'moment';

export class ValidationHelper {
  throwError: boolean;
  constructor() {
    this.throwError = false;
  }

  dateOnly(date: string | Date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
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
    if (this.throwError && !data) {
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
}
