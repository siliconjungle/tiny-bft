import EventEmitter from 'events'
import Client from './client'
import { createMessage } from '../tiny-merge/messages'

export class ClientRoom extends EventEmitter {
  constructor(uri, slug, opsManager) {
    super()
    this.client = new Client({ uri: uri + '/' + slug })
    this.client.addListener('open', this.handleOpen)
    this.client.addListener('close', this.handleClose)
    this.client.addListener('error', this.handleError)
    this.client.addListener('message', this.handleMessage)
    this.opsManager = opsManager
  }

  sendMessage(message) {
    this.client.addMessage(message)
  }

  handleOpen() {
    const ops = this.opsManager.getOps()
    this.client.addMessage(createMessage.connect(ops))
  }

  handleClose() {}
  handleError() {}
  handlePatch() {}

  handleOps = (ops) => {
    this.emit('apply-operations-remote', ops)
  }

  handleMessage = async (message) => {
    switch (message.type) {
      case 'connect': {
        const filteredOps = await this.opsManager.applyOps(message.ops)

        if (filteredOps.length > 0) {
          this.handleOps(filteredOps)
        }

        break
      }
      case 'patch': {
        const filteredOps = await this.opsManager.applyOps(message.ops)

        if (filteredOps.length > 0) {
          this.handleOps(filteredOps)
        }

        break
      }
    }
  }
}
