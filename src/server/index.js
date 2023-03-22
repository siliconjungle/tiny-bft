import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import ServerRoom from './server-room.js'
import { validateMessage } from '../tiny-merge/messages.js'

dotenv.config()

const DEFAULT_PORT = 8080
const port = process.env.PORT || DEFAULT_PORT
const publicKeys = process.env.PUBLIC_KEYS?.split(',') ?? []

const app = express()

app.use(cors())

app.get('/', async (_, res) => {
  res.json([])
})

const server = app.listen(port, () => console.log(`Listening on ${port}`))

const rooms = new Map()
const sockets = new Map()

const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  console.log('_CONNECTION_')

  if (typeof req.url !== 'string') {
    ws.close()
    return
  }

  // Remove the leading slash
  const url = req.url.slice(1)

  // Must be alphanumeric or contain - or _
  const regex = /^[a-zA-Z0-9-_]+$/
  if (!regex.test(url)) {
    ws.close()
    return
  }

  const client = { ws, id: nanoid(), slug: url, alive: true, data: {} }
  sockets.set(ws, client)

  const currentRoom = getRoomBySlug(url)
  currentRoom.handleConnection(client)

  ws.on('message', (data, isBinary) => {
    if (isBinary) return

    const message = JSON.parse(data.toString())
    if (!validateMessage(message)) {
      ws.close()
      return
    }
  
    currentRoom.handleMessage(client, message)
  })

  ws.on('close', () => {
    currentRoom.handleClose(client)
    if (currentRoom.clients.size === 0) {
      rooms.delete(client.slug)
    }
  })
})

const getRoomBySlug = (slug) => {
  const existingRoom = rooms.get(slug)
  if (existingRoom) return existingRoom

  const room = new ServerRoom(slug, publicKeys)
  rooms.set(slug, room)
  return room
}
