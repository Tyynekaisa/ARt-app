// dataLoader.js

let modelData = null
let dataPromise = null

export function loadModelData() {

  if (modelData) return Promise.resolve(modelData)

  if (dataPromise) return dataPromise

  dataPromise = fetch('https://tyynekaisa.github.io/ARt-app/data/gemstones.json')
    .then(res => res.json())
    .then(json => {
      modelData = json
      return modelData
    })
    .catch(err => {
      console.error("JSON-latausvirhe:", err)
      throw err
    })

  return dataPromise
}
