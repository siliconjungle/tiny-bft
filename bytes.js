export const create = (size) => new Uint8Array(size)

export const shouldSet = (value) => value >= 0 && value <= 256

export const set = (byteArray, index, value) => {
  byteArray[index] = value
}

export const get = (byteArray, index) => byteArray[index]
export const getLength = (byteArray) => byteArray.length
