import WebSocket from 'ws'
import OpManager from '../tiny-merge'
import { createMessage } from '../tiny-merge/messages'

export class ServerRoom {
  constructor(slug) {
    this.clients = new Map()
    this.opManager = new OpManager()
    this.slug = slug
  }

  handleConnection = (client) => {
    this.addClient(client)

    return this
  }

  handleMessage = async (client, { type, ops }) => {
    console.log('MESSAGE', type, ops)
    switch (type) {
      case 'connect': {
        const appliedOps = await this.opsManager.applyOps(ops)
        const snapshotOps = this.opManager.getOps()

        this.sendMessage(
          client,
          createMessage.connect(snapshotOps)
        )

        this.broadcastMessageExcluding(
          client,
          createMessage.patch(appliedOps)
        )

        break
      }
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

  broadcastMessageExcluding = (message, clientId) => {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.id !== clientId) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }
}
