import RemoteStore from './remote-store.js'

class RemoteStoreManager {
  constructor() {
    this.stores = {}
  }

  createStore(uri) {
    if (this.stores[uri]) {
      throw new Error(`A store with key '${uri}' already exists.`)
    }

    this.stores[uri] = new RemoteStore(uri)
  }

  getStore(uri) {
    return this.stores[uri] ?? null
  }
}

export default RemoteStoreManager
