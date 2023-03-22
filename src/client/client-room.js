import EventEmitter from 'events'
import WebSocket from 'isomorphic-ws'
import { createMessage } from '../tiny-merge/messages.js'

const RECONNECT_TIMEOUT = 10000

class ClientRoom extends EventEmitter {
  constructor(uri, slug, opsManager) {
    super()
    this.opsManager = opsManager
    this.messages = []
    this.connection = this.createConnection(uri + '/' + slug)
  }

  createConnection = (url) => {
    const connection = new WebSocket(url)
    connection.onmessage = this.handleMessage
    connection.onopen = this.handleOpen
    connection.onclose = this.handleClose
    connection.onerror = this.handleError
    this.messages = []

    return connection
  }

  addMessage = (message) => {
    this.messages.push(message)
    this.sendMessages()
  }

  sendMessages = () => {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.messages.forEach((message) => {
        this.connection.send(JSON.stringify(message))
      })
      this.messages = []
    }
  }

  handleOpen = (event) => {
    this.emit('open', event)
    const ops = this.opsManager.getOps()
    this.addMessage(createMessage.connect(ops))
    this.sendMessages()
  }

  handleClose = (event) => {
    this.emit('close', event)
    setTimeout(() => this.createConnection(this.uri), RECONNECT_TIMEOUT)
  }

  handleError = (error) => {
    this.emit('error', error)
  }

  handleOps = (ops) => {
    this.emit('apply-operations-remote', ops)
  }

  processMessage = async (message) => {
    const filteredOps = await this.opsManager.applyOps(message.ops)

    if (filteredOps.length > 0) {
      this.handleOps(filteredOps)
    }
  }

  handleMessage = async (event) => {
    const message = JSON.parse(event.data)
    this.emit('message', message)

    console.log('_MESSAGE_', message)

    switch (message.type) {
      case 'connect':
      case 'patch':
        await this.processMessage(message)
        break
    }
  }
}

export default ClientRoom