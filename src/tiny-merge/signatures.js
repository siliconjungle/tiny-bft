const { crypto } = globalThis

const arrayBufferToPem = (buffer, keyType) => {
  const base64 = bufferToBase64(buffer)
  const pem = `-----BEGIN ${keyType}-----\n${base64.match(/.{1,64}/g).join('\n')}\n-----END ${keyType}-----`
  return pem
}

const bufferToBase64 = (buffer) => {
  const uint8Array = new Uint8Array(buffer)
  const base64 = Buffer.from(uint8Array).toString('base64')
  return base64
}

const importPrivateKey = async (privateKeyPem) => {
  const privateKeyBuffer = pemToArrayBuffer(privateKeyPem, 'PRIVATE KEY')
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign']
  )
  return privateKey
}

const importPublicKey = async (publicKeyPem) => {
  const publicKeyBuffer = pemToArrayBuffer(publicKeyPem, 'PUBLIC KEY')
  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['verify']
  )
  return publicKey
}

const pemToArrayBuffer = (pem, keyType) => {
  const base64 = pem
    .replace(`-----BEGIN ${keyType}-----`, '')
    .replace(`-----END ${keyType}-----`, '')
    .replace(/\s+/g, '')
  const uint8Array = new Uint8Array(Buffer.from(base64, 'base64'))
  return uint8Array.buffer
}

export const generateKeyPair = async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  )

  const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  const publicKeyPem = arrayBufferToPem(publicKey, 'PUBLIC KEY')
  const privateKeyPem = arrayBufferToPem(privateKey, 'PRIVATE KEY')

  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
  }
}

export const signData = async (privateKeyPem, data) => {
  const privateKey = await importPrivateKey(privateKeyPem)
  const encodedData = new TextEncoder().encode(JSON.stringify(data))
  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    encodedData
  )
  return bufferToBase64(signature)
}

const base64ToBuffer = (base64) => {
  const uint8Array = new Uint8Array(Buffer.from(base64, 'base64'))
  return uint8Array.buffer
}

export const verifySignature = async (publicKeyPem, signature, data) => {
  const publicKey = await importPublicKey(publicKeyPem)
  const encodedData = new TextEncoder().encode(JSON.stringify(data))
  const signatureBuffer = base64ToBuffer(signature)
  return crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    publicKey,
    signatureBuffer,
    encodedData
  )
}
