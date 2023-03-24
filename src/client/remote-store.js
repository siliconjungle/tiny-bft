import EventEmitter from 'events'
import dotenv from 'dotenv'
import ClientRoom from './client-room.js'
import OpsManager from '../tiny-merge/index.js'
import { createMessage, createOp } from '../tiny-merge/messages.js'
import { signData } from '../tiny-merge/signatures.js'

dotenv.config()

class RemoteStore extends EventEmitter {
  constructor(uri) {
    super()
    this.uri = uri
    this.privateKey = process.env.PRIVATE_KEY
    this.publicKey = process.env.PUBLIC_KEY
    this.publicKeys = process.env.PUBLIC_KEYS?.split(',') ?? []
    this.opsManager = new OpsManager(this.publicKeys)
    this.clientRoom = new ClientRoom(this.uri,)
    this.opsManager.on('change', (values) => {
      this.emit('change', values)
    })
    this.clientRoom.on('message', (message) => {
      console.log('_ON_MESSAGE_', message)
      if (message.type === 'connect') {
        const snapshotOps = this.opsManager.getOps()
        if (snapshotOps.length > 0) {
          this.clientRoom.addMessage(createMessage.patch(snapshotOps))
        }
      } else if (message.type === 'patch') {
        if (this.clientRoom.connected === true) {
          this.opsManager.applyOps(message.ops)
        }
      }
    })
    this.clientRoom.on('connected', (connected) => {
      this.emit('connected', connected)
    })
  }

  setValueAtIndex = async (index, value) => {
    const globalSeq = this.opsManager.getNextGlobalSeq()
    const localSeq = this.opsManager.getNextLocalSeq(this.publicKey)

    const signature2 = await signData(this.privateKey, { globalSeq, index, value })
    const signature = await signData(this.privateKey, localSeq)

    const ops = [
      createOp.proof(this.publicKey, localSeq, signature),
      createOp.set(this.publicKey, globalSeq, index, value, signature2),
    ]

    const appliedOps = await this.opsManager.applyOps(ops)

    if (appliedOps.length > 0 && this.clientRoom.connected) {
      const newMessage = createMessage.patch(ops)
      this.clientRoom.addMessage(newMessage)
    }
  }

  getValues() {
    return this.opsManager.getValues()
  }

  getValueAtIndex() {
    return this.opsManager.getValueAtIndex()
  }
}

export default RemoteStore
