import RemoteStoreManager from './remote-store-manager.js'

const manager = new RemoteStoreManager()

const uri = 'ws://localhost:8080/silicon-jungle'

manager.createStore(uri)
const store = manager.getStore(uri)

const handleChange = (values) => {
  console.log(values)
}

store.addListener('change', handleChange)

store.setValueAtIndex(0, 255)
store.setValueAtIndex(1, 255)
store.setValueAtIndex(2, 255)
