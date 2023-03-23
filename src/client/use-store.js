// import { useState, useEffect } from 'react'
// import RemoteStoreManager from './remote-store-manager.js'

// const useStore = (uri) => {
//   const [store, setStore] = useState(null)
//   const [values, setValues] = useState([])

//   useEffect(() => {
//     const manager = new RemoteStoreManager()

//     let store = manager.getStore(uri)

//     if (store === null) {
//       manager.createStore(uri)
//     }

//     setStore(store)
//     setValues(store.getValues())

//     const handleChange = () => {
//       setValues(store.getValues())
//     }

//     store.addListener('change', handleChange)

//     return () => {
//       store.removeListener('change', handleChange)
//     }
//   }, [uri])

//   const setValueAtIndex = (index, value) => {
//     if (store) {
//       store.setValueAtIndex(index, value)
//     }
//   }

//   return {
//     setValueAtIndex,
//     values,
//   }
// }

// export default useStore
