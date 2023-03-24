import WebSocket from 'isomorphic-ws'
import OpsManager from '../tiny-merge/index.js'
import { createMessage } from '../tiny-merge/messages.js'

class ServerRoom {
  constructor(slug, publicKeys) {
    this.clients = new Map()
    this.opsManager = new OpsManager(publicKeys)
    this.slug = slug
  }

  handleConnection = (client) => {
    this.addClient(client)

    const snapshotOps = this.opsManager.getOps()

    this.sendMessage(
      client,
      createMessage.connect(snapshotOps)
    )

    return this
  }

  handleMessage = async (client, { type, ops }) => {
    console.log('_MESSAGE_', { type, ops })
    switch (type) {
      case 'patch': {
        const appliedOps = await this.opsManager.applyOps(ops)

        this.broadcastMessageExcluding(
          client,
          createMessage.patch(appliedOps)
        )

        break
      }
    }

    return this
  }

  handleClose = (client) => {
    this.removeClient(client)

    return this
  }

  addClient = (client) => {
    this.clients.set(client.id, client)

    return client
  }

  removeClient = (client) => {
    if (!this.clients.has(client.id)) {
      return
    }

    this.clients.delete(client.id)

    return client
  }

  getClientById = (id) => {
    return this.clients.get(id)
  }

  sendMessage = (client, message) => {
    client.ws.send(JSON.stringify(message))
    return this
  }

  broadcastMessage = (message) => {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }

  broadcastMessageExcluding = (client, message) => {
    this.clients.forEach((client2) => {
      if (client2.ws.readyState === WebSocket.OPEN && client2.id !== client.id) {
        client2.ws.send(JSON.stringify(message))
      }
    })
    return this
  }
}

export default ServerRoom
