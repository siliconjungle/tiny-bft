import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import { ServerRoom } from './server-room'

const DEFAULT_PORT = 8080
const port = process.env.PORT || DEFAULT_PORT

const app = express()

app.use(cors())

app.get('/', async (_, res) => {
  res.json([])
})

app.listen(port, () => console.log(`Listening on ${port}`))

const rooms = new Map()
const sockets = new Map()

const wss = new WebSocketServer({ server: app })

wss.on('connection', (ws, req) => {
  const url = (req.url ?? '/test').substring(1)
  const client = { ws, id: nanoid(), slug: url, alive: true, data: {} }
  sockets.set(ws, client)

  const currentRoom = getRoomBySlug(req.url)
  currentRoom.handleConnection(client)

  ws.on('message', (data, isBinary) => {
    if (isBinary) return

    const message = JSON.parse(data.toString())
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

  const room = new ServerRoom(slug)
  rooms.set(slug, room)
  return room
}
