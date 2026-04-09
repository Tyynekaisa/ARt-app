// artwall.js
// last edited: 9.4.2026
// Author: Kaisa Juhola
// Gemstone paintings

import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js'
import { buildModelMenu } from './menuBuilder.js';

let camera, scene, renderer
let controller
let pointer
let hitTestSourceAvailable = false
let hitTestSource = null
let localSpace = null

const loadedModels = {}
const placedModels = {}
let selectedModelPath = null

init()

export function selectModel(path) {
    selectedModelPath = path;

    if (!loadedModels[path]) {
        const loader = new GLTFLoader();
        loader.load(path, gltf => {
            loadedModels[path] = gltf.scene;
        });
    }
}


function init() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    )

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)

    // Pointer-rengas
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

    const modelMenu = document.querySelector("#modelMenu")
    const menuButton = document.querySelector("#menuBtn")
    const menuTextShow = document.querySelector(".menuTextShow")
    const menuTextHide = document.querySelector(".menuTextHide")


    menuButton.addEventListener("click", toggleMenu)

    function toggleMenu() {
        if(modelMenu.classList.contains("open")) {
            closeMenu()
        } else {
            openMenu()
        }
    }

    function openMenu() {
        console.log("Avaa")
        modelMenu.classList.add("open")
        menuTextShow.classList.add("hide")
        menuTextHide.classList.remove("hide")
    }

    function closeMenu() {
        console.log("Sulje")
        modelMenu.classList.remove("open")
        menuTextShow.classList.remove("hide")
        menuTextHide.classList.add("hide")
    }

    
    function onSelect() {
        if (!selectedModelPath || !pointer.visible) return;

        const baseModel = loadedModels[selectedModelPath];
        if (!baseModel) return;

        // Jos teos on jo lisätty → siirrä sitä
        if (placedModels[selectedModelPath]) {
            const existing = placedModels[selectedModelPath];
            existing.position.setFromMatrixPosition(pointer.matrix);
            existing.quaternion.setFromRotationMatrix(controller.matrixWorld);
            return;
        }

        // Muuten luo uusi instanssi
        const clone = baseModel.clone();
        clone.scale.set(1, 1, 1);
        clone.position.setFromMatrixPosition(pointer.matrix);
        clone.quaternion.setFromRotationMatrix(controller.matrixWorld);

        const light = new THREE.SpotLight(0xffffff, 1.2, 3, Math.PI / 6, 0.3);
        light.position.set(0, 0, 0.1);   // hieman mallin edessä
        light.target = clone;
        clone.add(light);
        clone.add(light.target);

        scene.add(clone);
        placedModels[selectedModelPath] = clone;
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
        console.log("PlacedModels before cleanup:", placedModels)
        console.log("LoadedModels before cleanup:", loadedModels)

        // Poista kaikki asetetut maalaukset
        for (const key in placedModels) {
            scene.remove(placedModels[key]);
        }
        placedModels.length = 0
        loadedModels.length = 0
        console.log("PlacedModels after cleanup:", placedModels)
        console.log("LoadedModels after cleanup:", loadedModels)

        // Piilota pointer
        if (pointer) pointer.visible = false;
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

    // renderer.xr.addEventListener("sessionstart", () => {
    //     console.log("AR-tila käynnistyi");
    //     arButton.textContent = "Poistu AR";
    // });

    renderer.xr.addEventListener("sessionend", () => {
        cleanupAR();
    });


    document.body.appendChild(arButton)

}
