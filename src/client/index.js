import RemoteStoreManager from './remote-store-manager.js'

const manager = new RemoteStoreManager()

const uri = 'ws://localhost:8080/silicon-jungle'

manager.createStore(uri)
const store = manager.getStore(uri)

const handleConnected = (connected) => {
  console.log('connected', connected)
}

const handleChange = (values) => {
  console.log('change', values)
}

const handleMerging = (merging) => {
  console.log('merging', merging)

  console.log('local', store.getValues())

  if (merging === true) {
    console.log('remote', store.getRemoteValues())

    store.merge(false)
  }
}

store.on('connected', handleConnected)
store.on('change', handleChange)
store.on('merging', handleMerging)

store.setValueAtIndex(0, 255)
// store.setValueAtIndex(1, 255)
// store.setValueAtIndex(2, 255)
