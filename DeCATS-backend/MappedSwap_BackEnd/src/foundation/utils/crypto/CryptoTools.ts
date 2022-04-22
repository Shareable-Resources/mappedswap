import crypto from 'crypto';
const DERIVATION_ROUNDS = 500000;
const HMAC_KEY_SIZE = 32;
const PASSWORD_KEY_SIZE = 32;

function pbkdf2(password, salt, rounds, bits) {
  return crypto.pbkdf2Sync(password, salt, rounds, bits / 8, 'sha256');
}

function deriveFromPassword(password, salt, rounds) {
  if (!password) {
    throw new Error('Failed deriving key: Password must be provided');
  }
  if (!salt) {
    throw new Error('Failed deriving key: Salt must be provided');
  }
  if (!rounds || rounds <= 0 || typeof rounds !== 'number') {
    throw new Error('Failed deriving key: Rounds must be greater than 0');
  }
  const bits = (PASSWORD_KEY_SIZE + HMAC_KEY_SIZE) * 8;
  const derivedKeyData = pbkdf2(password, salt, rounds, bits);
  const derivedKeyHex = derivedKeyData.toString('hex');
  const dkhLength = derivedKeyHex.length;
  const keyBuffer = Buffer.from(derivedKeyHex.substr(0, dkhLength / 2), 'hex');
  const output = {
    salt: salt,
    key: keyBuffer,
    rounds: rounds,
    hmac: Buffer.from(
      derivedKeyHex.substr(dkhLength / 2, dkhLength / 2),
      'hex',
    ),
  };
  return output;
}

function constantTimeCompare(val1, val2) {
  let sentinel;
  if (val1.length !== val2.length) {
    return false;
  }
  for (let i = 0; i <= val1.length - 1; i += 1) {
    sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
  }
  return sentinel === 0;
}

function generateIV() {
  return Buffer.from(crypto.randomBytes(16));
}

function generateSalt(length) {
  if (length <= 0) {
    throw new Error(
      `Failed generating salt: Invalid length supplied: ${length}`,
    );
  }
  let output = '';
  while (output.length < length) {
    output += crypto.randomBytes(3).toString('base64');
    if (output.length > length) {
      output = output.substr(0, length);
    }
  }
  return output;
}

function encryptText(text, password) {
  const salt = generateSalt(12);
  const iv = generateIV();
  const derivedKey = deriveFromPassword(password, salt, DERIVATION_ROUNDS);
  const ivHex = iv.toString('hex');
  const encryptTool = crypto.createCipheriv('aes-256-cbc', derivedKey.key, iv);
  const hmacTool = crypto.createHmac('sha256', derivedKey.hmac);
  // Perform encryption
  let encryptedContent = encryptTool.update(text, 'utf8', 'base64');
  encryptedContent += encryptTool.final('base64');
  // Generate hmac
  hmacTool.update(encryptedContent);
  hmacTool.update(ivHex);
  hmacTool.update(salt);
  const hmacHex = hmacTool.digest('hex');
  // Output encrypted components
  const components = {
    m: 'cbc',
    h: hmacHex,
    i: ivHex,
    s: salt,
    r: DERIVATION_ROUNDS,
  };
  return packageComponents(encryptedContent, components);
}

export function decryptText(encryptedString, password) {
  const encryptedComponents = unpackageComponents(encryptedString);
  const derivedKey = deriveFromPassword(
    password,
    encryptedComponents.s,
    encryptedComponents.r,
  );
  const iv = Buffer.from(encryptedComponents.i, 'hex');
  const hmacData = encryptedComponents.h;
  // Get HMAC tool
  const hmacTool = crypto.createHmac('sha256', derivedKey.hmac);
  // Generate the HMAC
  hmacTool.update(encryptedComponents.encryptedContent);
  hmacTool.update(encryptedComponents.i);
  hmacTool.update(encryptedComponents.s);
  const newHmaxHex = hmacTool.digest('hex');
  // Check hmac for tampering
  if (constantTimeCompare(hmacData, newHmaxHex) !== true) {
    throw new Error('Authentication failed while decrypting content');
  }
  // Decrypt
  const decryptTool = crypto.createDecipheriv(
    'aes-256-cbc',
    derivedKey.key,
    iv,
  );
  const decryptedText = decryptTool.update(
    encryptedComponents.encryptedContent,
    'base64',
    'utf8',
  );
  return `${decryptedText}${decryptTool.final('utf8')}`;
}

function packageComponents(encryptedContent, components) {
  return `$mappedswap$${Object.keys(components)
    .map((key) => `${key}=${components[key]}`)
    .join(',')}$${encryptedContent}`;
}

function unpackageComponents(payload) {
  const [, encryptor, componentsStr, encryptedContent] = payload.split('$');
  if (encryptor !== 'mappedswap') {
    throw new Error('Failed decrypting: unrecognised encrypted payload');
  }
  const components = componentsStr.split(',').reduce((output, item) => {
    const [key, value] = item.split('=');
    return Object.assign(output, {
      [key]: value,
    });
  }, {});
  components.r = parseInt(components.r, 10);
  components.encryptedContent = encryptedContent;
  return components;
}
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
}
function sign(privateKey, value) {
  if (typeof value == 'object') value = JSON.stringify(value);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(value);
  const signature = signer.sign(privateKey, 'base64');
  // var signature = signer.sign(privateKey, 'hex')
  return signature;
}
function verify(publicKey, value, sign) {
  if (typeof value == 'object') value = JSON.stringify(value);
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(value);
  return verifier.verify(publicKey, sign, 'base64');
}
function privateDecrypt(privateKey, enc) {
  return crypto
    .privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(enc, 'base64'),
    )
    .toString();
}
function publicEncrypt(publicKey, dec) {
  return crypto
    .publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(dec),
    )
    .toString('base64');
}

// module.exports = {
//   encrypt: encryptText,
//   decrypt: decryptText,
//   generateKeyPair: generateKeyPair,
//   sign: sign,
//   verify: verify,
//   privateDecrypt: privateDecrypt,
//   publicEncrypt: publicEncrypt,
// };
