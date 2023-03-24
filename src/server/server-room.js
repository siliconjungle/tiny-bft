import WebSocket from 'isomorphic-ws'
import OpsManager from '../tiny-merge/index.js'
import { createMessage } from '../tiny-merge/messages.js'
import { verifySignature } from '../tiny-merge/signatures.js'

// Automatically detects when someone disconnects.
// Should require a message to be sent to the server on connection.
// This sends through the url of the storage for that user.
class ServerRoom {
  constructor(slug, publicKeys) {
    this.publicKeys = publicKeys
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

    // send a bunch of connection messages.
    // ideally there will be a system that squashes messages together.
    this.clients.forEach((otherClient) => {
      if (otherClient.id !== client.id) {
        if (otherClient.publicKey !== undefined) {
          this.sendMessage(
            client,
            createMessage.connected(
              otherClient.uri,
              otherClient.publicKey,
              otherClient.signature
            )
          )
        }
      }
    })

    return this
  }

  handleMessage = async (client, { type, ops }) => {
    console.log('_MESSAGE_', { type, ops })
    switch (type) {
      case 'connected': {
        const { uri, publicKey, signature } = ops

        if (!this.publicKeys.includes(publicKey)) {
          client.ws.close()
          return
        }

        const isValid = await verifySignature(
          publicKey,
          signature,
          uri
        )

        if (!isValid) {
          client.ws.close()
          return
        }

        this.client.publicKey = publicKey
        this.client.uri = uri
        this.client.signature = signature

        this.broadcastMessageExcluding(
          client,
          createMessage.connected(uri, publicKey, signature)
        )
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
    if (client.publicKey !== undefined) {
      this.broadcastMessageExcluding(
        client,
        createMessage.disconnected(client.publicKey)
      )
    }

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
