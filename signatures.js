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
  crypto.sign('SHA256', data, privateKey)

export const verifySignature = async (publicKey, signature, data) =>
  crypto.verify('SHA256', data, publicKey, signature)

// ;(async () => {
//   const keyPair = await generateKeyPair()

//   const data = 'Hello, I am an agent!'
//   const signature = await signData(keyPair.privateKey, data)
//   console.log('Signature:', signature.toString('hex'))

//   const isValid = await verifySignature(keyPair.publicKey, signature, data)
//   console.log('Is the signature valid?', isValid)
// })()
