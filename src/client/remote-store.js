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
    this.setOpsManager(new OpsManager(this.publicKeys))
    this.remoteOpsManager = null
    this.setMerging(false)

    this.clientRoom = new ClientRoom(this.uri)
    this.clientRoom.on('message', (message) => {
      console.log('_ON_MESSAGE_', message)
      if (message.type === 'connect') {
        this.remoteOpsManager = new OpsManager(this.publicKeys)
        this.remoteOpsManager.applyOps(message.ops)

        const diff = this.remoteOpsManager.getDiff(this.opsManager.getValues())
        if (diff.length > 0) {
          this.setMerging(true)
        } else {
          this.setMerging(false)
        }
      } else if (message.type === 'patch') {
        if (this.clientRoom.connected === true) {
          if (this.merging === true) {
            if (this.remoteOpsManager !== null) {
              this.remoteOpsManager.applyOps(message.ops)
            }
          } else {
            this.opsManager.applyOps(message.ops)
          }
        }
      }
    })
    this.clientRoom.on('connected', (connected) => {
      this.emit('connected', connected)
    })
  }

  setMerging = (merging) => {
    if (this.merging !== merging) {
      this.merging = merging
      this.emit('merging', merging)
    }
  }

  setOpsManager = (opsManager) => {
    if (this.opsManager !== undefined) {
      this.opsManager.removeAllListeners()
    }

    this.opsManager = opsManager

    if (this.opsManager !== null) {
      this.opsManager.on('change', (values) => {
        this.emit('change', values)
      })
    }
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

  getRemoteValues() {
    return this.remoteOpsManager.getValues()
  }

  getValueAtIndex() {
    return this.opsManager.getValueAtIndex()
  }

  merge = (local = true) => {
    if (this.merging) {
      if (local) {
        const diff = this.remoteOpsManager.getDiff(this.opsManager.getValues())

        this.setOpsManager(this.remoteOpsManager)
        this.remoteOpsManager = null

        this.setMerging(false)

        for (const [index, value] of diff) {
          this.setValueAtIndex(index, value)
        }
      } else {
        this.setOpsManager(this.remoteOpsManager)
        this.remoteOpsManager = null
        this.setMerging(false)
      }
    }
  }
}

export default RemoteStore
