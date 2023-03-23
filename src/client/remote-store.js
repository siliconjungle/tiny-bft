import EventEmitter from 'events'
import dotenv from 'dotenv'
import ClientRoom from './client-room.js'
import OpsManager from '../tiny-merge/index.js'
import { createMessage, createOp } from '../tiny-merge/messages.js'
import { signData, toString } from '../tiny-merge/signatures.js'

dotenv.config()

class RemoteStore extends EventEmitter {
  constructor(uri) {
    super()
    this.uri = uri
    this.privateKey = process.env.PRIVATE_KEY
    this.publicKey = process.env.PUBLIC_KEY
    this.publicKeys = process.env.PUBLIC_KEYS?.split(',') ?? []
    this.opsManager = new OpsManager(this.publicKeys)
    this.clientRoom = new ClientRoom(this.uri, this.opsManager)
    this.opsManager.on('change', (values) => {
      this.emit('change', values)
    })
  }

  setValueAtIndex = async (index, value) => {
    const globalSeq = this.opsManager.getNextGlobalSeq()
    const localSeq = this.opsManager.getNextLocalSeq(this.publicKey)

    const signature2 = await signData(this.privateKey, { globalSeq, index, value })
    const signature = await signData(this.privateKey, localSeq)

    const ops = [
      createOp.proof(this.publicKey, localSeq, toString(signature)),
      createOp.set(this.publicKey, globalSeq, index, value, toString(signature2)),
    ]

    const appliedOps = await this.opsManager.applyOps(ops)

    if (appliedOps.length > 0) {
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
