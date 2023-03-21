import crypto from 'crypto'

export const generateKeyPair = () => new Promise((resolve, reject) => {
  crypto.generateKeyPair('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  }, (err, publicKey, privateKey) => {
    if (err) {
      reject(err)
      return
    }
    resolve({ publicKey, privateKey })
  })
})

export const signData = async (privateKey, data) =>
  crypto.sign('SHA256', JSON.stringify(data), privateKey)

export const verifySignature = async (publicKey, signature, data) =>
  crypto.verify('SHA256', JSON.stringify(data), publicKey, signature)

export const toString = (buffer) => buffer.toString('hex')
export const toBuffer = (string) => Buffer.from(string, 'hex')
