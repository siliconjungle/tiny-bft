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

export const jsonToString = (json) => {
  if (json === undefined || json === null) {
    return ''
  }

  if (Array.isArray(json)) {
    return json.map(jsonToString).join(',')
  }

  if (typeof json === 'object') {
    return Object.keys(json)
      .sort()
      .map((key) => `${key}:${jsonToString(json[key])}`)
      .join(',')
  }

  if (typeof json === 'string') {
    return json
  }

  if (typeof json === 'number') {
    return json.toString()
  }

  if (typeof json === 'boolean') {
    return json.toString()
  }

  // unknown types should be ignored?
  // or maybe an error should be thrown
  return ''
}

export const signData = async (privateKey, data) =>
  crypto.sign('SHA256', jsonToString(data), privateKey)

export const verifySignature = async (publicKey, signature, data) =>
  crypto.verify('SHA256', jsonToString(data), publicKey, signature)

export const toString = (buffer) => buffer.toString('hex')
export const toBuffer = (string) => Buffer.from(string, 'hex')
