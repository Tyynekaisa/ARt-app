// artwall.js

import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js'
import { buildModelMenu } from 'https://tyynekaisa.github.io/ARt-app/js/menuBuilder.js'

let camera, scene, renderer
let controller
let pointer
let hitTestSourceAvailable = false
let hitTestSource = null
let localSpace = null

let loadedModels = {}
let placedModels = {}
let selectedModelPath = null

function init() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  })

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true
  container.appendChild(renderer.domElement)
  
  // Pointer
  const ringGeometry = new THREE.RingGeometry(0.2, 0.3, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  pointer = new THREE.Mesh(ringGeometry, ringMaterial)
  pointer.matrixAutoUpdate = false
  pointer.visible = false
  scene.add(pointer)
  
  controller = renderer.xr.getController(0)
  controller.addEventListener('select', onSelect)
  scene.add(controller)
  
  document.addEventListener('DOMContentLoaded', () => {
    buildModelMenu()
  })

  // Model-menu
  const modelMenu = document.querySelector('#modelMenu')
  const menuButton = document.querySelector('#menuBtn')
  const menuTextShow = document.querySelector('.menuTextShow')
  const menuTextHide = document.querySelector('.menuTextHide')
  
  menuButton.addEventListener('click', toggleMenu)
  
  function toggleMenu() {
    if(modelMenu.classList.contains('open')) {
      closeMenu()
    } else {
      openMenu()
    }
  }
  
  function openMenu() {
    modelMenu.classList.add('open')
    menuTextShow.classList.add('hide')
    menuTextHide.classList.remove('hide')
  }
  
  function closeMenu() {
    modelMenu.classList.remove('open')
    menuTextShow.classList.remove('hide')
    menuTextHide.classList.add('hide')
  }
  
  function onSelect() {
    if (!selectedModelPath || !pointer.visible) return
  
    const baseModel = loadedModels[selectedModelPath]
    if (!baseModel) return
  
    if (placedModels[selectedModelPath]) {
      const existing = placedModels[selectedModelPath]
      existing.position.setFromMatrixPosition(pointer.matrix)
      existing.quaternion.setFromRotationMatrix(controller.matrixWorld)
      return
    }
  
    const clone = baseModel.clone()
    clone.scale.set(1, 1, 1)
    clone.position.setFromMatrixPosition(pointer.matrix)
    clone.quaternion.setFromRotationMatrix(controller.matrixWorld)

    const light = new THREE.SpotLight(0xffffff, 1.2, 3, Math.PI / 6, 0.3)
    light.position.set(0, 0, 1)
    light.target = clone
    clone.add(light)
    clone.add(light.target)

    const frameLight = new THREE.PointLight(0xffffff, 1.0, 1)
    frameLight.position.set(0, 0, 1)
    clone.add(frameLight)

    scene.add(clone)
    placedModels[selectedModelPath] = clone
  }
  
  renderer.setAnimationLoop(render)
  
  async function initHitSource() {
    const session = renderer.xr.getSession()
    const viewerSpace = await session.requestReferenceSpace('viewer')
    localSpace = await session.requestReferenceSpace('local')
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace })
    hitTestSourceAvailable = true

    session.addEventListener('end', () => {
      hitTestSourceAvailable = false
      hitTestSource = null
    })
  }
  
  function cleanupAR() {
    for (const key in placedModels) {
        scene.remove(placedModels[key])
    }
    placedModels = {}
    if (pointer) pointer.visible = false
  }
  
  function render(time, frame) {
    if (frame) {
      if (!hitTestSourceAvailable) {
        initHitSource()
      }
      if (hitTestSourceAvailable) {
        const hitTestResults = frame.getHitTestResults(hitTestSource)
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0]
          const pose = hit.getPose(localSpace)
          pointer.matrix.fromArray(pose.transform.matrix)
          pointer.visible = true
        } else {
          pointer.visible = false
        }
      }
    }
    renderer.render(scene, camera)
  }
  
  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test']
  })
  
  // renderer.xr.addEventListener('sessionstart', () => {
  //     console.log('AR-tila käynnistyy')
  // })
  
  renderer.xr.addEventListener('sessionend', () => {
    cleanupAR()
  })
  
  document.body.appendChild(arButton)
}

init()
