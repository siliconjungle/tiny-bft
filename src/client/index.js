import ClientRoom from './client-room'
import OpsManager from '../tiny-merge'
import { createMessage } from '../tiny-merge/messages'

const uri = 'wss://localhost:8080'
const slug = 'my-room'
const opsManager = new OpsManager()

const clientRoom = new ClientRoom(uri, slug, opsManager)
clientRoom.sendMessage(createMessage.connect([]))
