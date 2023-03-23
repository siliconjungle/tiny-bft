import dotenv from 'dotenv'
import ClientRoom from './client-room.js'
import OpsManager from '../tiny-merge/index.js'
import { createMessage, createOp } from '../tiny-merge/messages.js'
import { signData, toString } from '../tiny-merge/signatures.js'

dotenv.config()

const privateKey = process.env.PRIVATE_KEY
const publicKey = process.env.PUBLIC_KEY
const publicKeys = process.env.PUBLIC_KEYS?.split(',') ?? []

const uri = 'ws://localhost:8080'
const slug = 'my-room'
const opsManager = new OpsManager(publicKeys)

const globalSeq = opsManager.getNextGlobalSeq()
const localSeq = opsManager.getNextLocalSeq(publicKey)
const value = 100
const index = 0

signData(privateKey, { globalSeq, index, value }).then(signature2 => {
  signData(privateKey, localSeq).then(signature => {
    const ops = [
      createOp.proof(publicKey, localSeq, toString(signature)),
      createOp.set(publicKey, globalSeq, 0, 100, toString(signature2)),
    ]
    const newMessage = createMessage.patch(ops)
    
    const clientRoom = new ClientRoom(uri, slug, opsManager)
    
    clientRoom.on('message', (message) => {
      if (message.type === 'connect') {
        console.log('connected')
        clientRoom.addMessage(newMessage)
      }
    })
    
    clientRoom.on('apply-operations-remote', (ops) => {
      console.log('apply-operations-remote', ops)
    })
  })
})