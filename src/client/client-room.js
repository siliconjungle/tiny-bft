import EventEmitter from 'events'
import WebSocket from 'isomorphic-ws'
import { validateMessage } from '../tiny-merge/messages.js'

const RECONNECT_TIMEOUT = 10000

class ClientRoom extends EventEmitter {
  constructor(uri, getOpsManager) {
    super()
    this.getOpsManager = getOpsManager
    this.messages = []
    this.connection = this.createConnection(uri)
    this.uri = uri
    this.setConnected(false)
  }

  createConnection = (uri) => {
    const connection = new WebSocket(uri)
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

  setConnected = (connected) => {
    this.connected = connected

    this.emit('connected', connected)
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
  }

  handleClose = (event) => {
    this.emit('close', event)
    this.setConnected(false)
    setTimeout(() => this.createConnection(this.uri), RECONNECT_TIMEOUT)
  }

  handleError = (_) => {
    // no-op
  }

  processMessage = async (message) => {
    if (message.type === 'connect') {
      this.setConnected(true)
    }

    this.emit('message', message)
  }

  handleMessage = async (data, isBinary) => {
    if (isBinary) return

    const message = JSON.parse(data.data)

    if (!validateMessage(message)) {
      this.connection.close()
      return
    }

    switch (message.type) {
      case 'connect':
      case 'patch':
        await this.processMessage(message)
        break
    }
  }
}

export default ClientRoom
