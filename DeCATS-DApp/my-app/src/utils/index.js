import BigNumber from "bignumber.js";
import jwt from "jsonwebtoken";
import {floorPrecised} from "../web3";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAvailableFunding(userMode, userEquity, maxFunding, userLeverage) {
  if (userEquity && userEquity > 0) {
    if (userMode === "1") {
      return maxFunding;
    } else if (userMode === "0") {
      return Math.min(maxFunding, (parseFloat(userLeverage) / 1000) * parseFloat(userEquity));
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

export function bigNumberAbsoluteValue(number) {
  return BigNumber(number).absoluteValue();
}

export function bigNumberSum() {
  let output = BigNumber("0");
  for (var i = 0; i < arguments.length; ++i) {
    output = output.plus(BigNumber(arguments[i]));
  }
  return output.toFixed();
}

export function bigNumberMinus(number1, number2) {
  let bigNumber1 = BigNumber(number1);
  let output = bigNumber1.minus(number2);
  return output.toFixed();
}

export function bigNumberDivided(number1, number2) {
  let bigNumber1 = BigNumber(number1);
  let output = bigNumber1.dividedBy(number2);
  return output.toFixed();
}

export function bigNumberTimes(number1, number2) {
  let bigNumber1 = BigNumber(number1);
  let output = bigNumber1.times(number2);
  return output.toFixed();
}

export function bigNumberToFixed(number, decimal, isRoundDown = true) {
  const _inputBigNumber = BigNumber(number);
  if (decimal < 0) {
    if (isRoundDown) {
      return _inputBigNumber.toFixed(null, 3);
    } else {
      return _inputBigNumber.toFixed();
    }
  } else {
    if (isRoundDown) {
      return _inputBigNumber.toFixed(decimal, 3);
    } else {
      return _inputBigNumber.toFixed(decimal);
    }
  }
}

export function bigNumberCompare(number1, number2) {
  let result = 0;
  let bigNumber1 = BigNumber(number1);
  if (bigNumber1.isGreaterThan(number2)) {
    result = 1;
  } else if (bigNumber1.isLessThan(number2)) {
    result = -1;
  }
  return result;
}

export function bigNumbverDivideDecimals(number, decimals) {
  let output = 0;
  try {
    const _inputBigNumber = BigNumber(number);
    output = _inputBigNumber.dividedBy(Math.pow(10, decimals)).toNumber();
  } catch (err) {
    // amountDivideDecimals error
  }
  return output;
}

export function bigNumbverMultipleDecimals(number, decimals) {
  let output = 0;
  try {
    const _inputBigNumber = BigNumber(number);
    output = _inputBigNumber.times(Math.pow(10, decimals)).toNumber();
  } catch (err) {}
  return output;
}

export function thousandsMillionsFormatter(num) {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K"; // convert to K for number from > 1000 < 1 million
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(1) + "M"; // convert to M for number from > 1 million
  } else if (num < 999) {
    return floorPrecised(num, 2); // if value < 1000, nothing to do
  }
}

export function isMobile() {
  const {innerWidth: width} = window;
  if (width < 960) {
    return true;
  } else {
    return false;
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "deepClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === "object") {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

export function shortenHash(walletAddress) {
  return walletAddress.substring(0, 5) + "...." + walletAddress.substring(walletAddress.length - 4);
}

export function isNumber(data) {
  try {
    if (isNaN(data)) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log("isNumber error:", error);
  }
  return false;
}

export function countDecimals(value) {
  if (value % 1 != 0) return value.toString().split(".")[1].length;
  return 0;
}

export function isTokenValid(token, bufferLoginTimeInSec = 0) {
  let _isValidToken = false;
  let _bufferLoginTimeInMilliSec = 0;
  try {
    if (bufferLoginTimeInSec) {
      _bufferLoginTimeInMilliSec = bufferLoginTimeInSec * 1000;
    }
    const _tokenDecodeObj = jwt.decode(token);
    console.log("login _tokenDecodeObj:", _tokenDecodeObj);
    if (_tokenDecodeObj.exp && _tokenDecodeObj.exp * 1000 - _bufferLoginTimeInMilliSec > Date.now()) {
      // console.log("login Date.now():", Date.now());
      // console.log("login tokenDecodeObj.exp * 1000:", _tokenDecodeObj.exp * 1000);
      _isValidToken = true;
    }
  } catch (error) {
    console.log("isTokenValid error:", error);
  }
  return _isValidToken;
}

export function getErrorMsgKey(errorObj, defaultMsgKey = "networkError") {
  let _errMsgKey = defaultMsgKey
  if (errorObj && errorObj.code) {
    if (errorObj.code === -32602) {
      _errMsgKey = "metamaskAddressNotCorrect"
    }
  }
  return _errMsgKey;
}
