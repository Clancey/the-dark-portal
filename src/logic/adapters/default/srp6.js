import crypto from 'crypto';

// SRP6 parameters for WoW
const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7');
const g = BigInt(7);

/**
 * Convert a buffer to a BigInt (little-endian)
 *
 * @param buffer
 */
function bufferToBigInt(buffer) {
  const hex = Buffer.from(buffer).reverse().toString('hex');
  return BigInt('0x' + hex);
}

/**
 * Convert a BigInt to a buffer (little-endian)
 *
 * @param num
 * @param length
 */
function bigIntToBuffer(num, length = 32) {
  let hex = num.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const buffer = Buffer.from(hex, 'hex').reverse();
  const result = Buffer.alloc(length);
  buffer.copy(result);
  return result;
}

/**
 * Modular exponentiation
 *
 * @param base
 * @param exp
 * @param mod
 */
function modPow(base, exp, mod) {
  let result = BigInt(1);
  base = base % mod;
  while (exp > 0) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp / BigInt(2);
    base = (base * base) % mod;
  }
  return result;
}

/**
 * Generate salt and verifier for a username/password
 *
 * @param {string} username
 * @param {string} password
 * @returns {{ salt: Buffer, verifier: Buffer }}
 */
function generateSaltVerifier(username, password) {
  // Generate random 32-byte salt
  const salt = crypto.randomBytes(32);

  // Compute verifier
  const verifier = computeVerifier(username, password, salt);

  return {salt, verifier};
}

/**
 * Compute verifier from username, password, and salt
 *
 * @param {string} username
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Buffer}
 */
function computeVerifier(username, password, salt) {
  // h1 = SHA1(username:password) - uppercase username
  const userPass = (username.toUpperCase() + ':' + password.toUpperCase());
  const h1 = crypto.createHash('sha1').update(userPass).digest();

  // h2 = SHA1(salt | h1)
  const h2 = crypto.createHash('sha1').update(Buffer.concat([salt, h1])).digest();

  // x = h2 as little-endian number
  const x = bufferToBigInt(h2);

  // verifier = g^x mod N
  const v = modPow(g, x, N);

  return bigIntToBuffer(v, 32);
}

/**
 * Verify a password against stored salt and verifier
 *
 * @param {string} username
 * @param {string} password
 * @param {Buffer} salt
 * @param {Buffer} storedVerifier
 * @returns {boolean}
 */
function verifyPassword(username, password, salt, storedVerifier) {
  const computedVerifier = computeVerifier(username, password, salt);
  return computedVerifier.equals(storedVerifier);
}

export {
  generateSaltVerifier,
  computeVerifier,
  verifyPassword,
};
