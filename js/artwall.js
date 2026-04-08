// artwall.js
// last edited: 6.4.2026
// Author: Kaisa Juhola
// Gemstone paintings

import { ARButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js'
import { buildModelMenu } from 'https://tyynekaisa.github.io/ARt-app/js/menuBuilder.js';

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
    const ringGeometry = new THREE.RingGeometry(0.2, 0.5, 32)
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

    menuButton.addEventListener("click", toggleMenu)

    function toggleMenu() {
        if(modelMenu.classList.contains("open")) {
            closeMenu()
        } else {
            openMenu()
        }
    }

    function openMenu() {
        modelMenu.classList.add("open")
    }

    function closeMenu() {
        modelMenu.classList.remove("open")
    }

    

    // Tallennetaan ladatut mallit


    // AR SELECT EVENT
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

        scene.add(clone);
        placedModels[selectedModelPath] = clone;
    }

    const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
    light.position.set(1, 1, 0.25)
    scene.add(light)

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

    // function render(time, frame) {
    //     if (frame) {
    //         if (!hitTestSourceAvailable) {
    //             initHitSource()
    //         }
    //         if (hitTestSourceAvailable) {
    //             const hitTestResults = frame.getHitTestResults(hitTestSource)
    //             if (hitTestResults.length > 0) {
    //                 const hit = hitTestResults[0]
    //                 const pose = hit.getPose(localSpace)
    //                 pointer.matrix.fromArray(pose.transform.matrix)
    //                 pointer.visible = true
    //             } else {
    //                 pointer.visible = false
    //             }
    //         }
    //     }
    //     renderer.render(scene, camera)
    // }

    function render(time, frame) {
    if (frame) {
        if (!hitTestSourceAvailable) {
            initHitSource();
        }
        
        if (hitTestSourceAvailable) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(localSpace);

                // Luodaan apumatriisi ja vektori pinnan suunnan tarkistamiseen
                const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
                const normal = new THREE.Vector3(0, 0, 1).applyMatrix4(matrix).normalize();

                // Tarkistetaan onko kyseessä pystypinta (seinä)
                // Jos Y-akselin suuntainen arvo on lähellä nollaa, pinta on pystyssä.
                // Kynnysarvo 0.2 sallii pienet vinoudet, mutta hylkää lattiat (Y ~ 1).
                if (Math.abs(normal.y) < 0.2) {
                    pointer.matrix.fromArray(pose.transform.matrix);
                    pointer.visible = true;
                } else {
                    // Jos pinta on vaakasuora (lattia/katto), piilotetaan pointer
                    pointer.visible = false;
                }
            } else {
                pointer.visible = false;
            }
        }
    }
    renderer.render(scene, camera);
}

    const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test']
    })

    document.body.appendChild(arButton)

}
