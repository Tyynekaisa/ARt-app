// selectModel.js

import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js'

export function selectModel(path) {
  selectedModelPath = path

  if (!loadedModels[path]) {
    const loader = new GLTFLoader()
    loader.load(path, gltf => {
        loadedModels[path] = gltf.scene
    })
  }
}