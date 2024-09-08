const crypto = require('crypto');
const { TUYA_PASSWORD_IV, TUYA_PASSWORD_KEY } = require('./constants');

function unpaddedRSA(keyExponent, keyN, plaintext) {
    const keylength = Math.ceil(keyN.toString(2).length / 8);
    const inputNr = BigInt('0x' + plaintext.toString('hex'));
    const cryptedNr = inputNr ** BigInt(keyExponent) % BigInt(keyN);
    const result = cryptedNr.toString(16).padStart(keylength * 2, '0');
    return Buffer.from(result, 'hex');
}

function shuffledMD5(value) {
    const hash = crypto.createHash('md5').update(value, 'utf-8').digest('hex');
    return hash.slice(8, 16) + hash.slice(0, 8) + hash.slice(24, 32) + hash.slice(16, 24);
}

function createPasswordInnerCipher() {
    const cipher = crypto.createCipheriv('aes-128-cbc', TUYA_PASSWORD_KEY, TUYA_PASSWORD_IV);
    return cipher;
}

module.exports = {
    unpaddedRSA,
    shuffledMD5,
    createPasswordInnerCipher
};
