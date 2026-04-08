// main.js
// last edited: 8.4.2026
// Author: Kaisa Juhola
// Gemstones

import { CSS3DObject } from '../libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js'
import { loadGLTF } from '../libs/loader.js'

const THREE = window.MINDAR.IMAGE.THREE;

startAR()

async function startAR() {

    const gemstones = await fetch("https://tyynekaisa.github.io/ARt-app/data/gemstones.json").then(res => res.json())

    const mindARThreeJs = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: "../assets/targets/gemstone_targets.mind",
        maxTrack: 3
    })

    const { renderer, cssRenderer, cssScene, scene, camera } = mindARThreeJs
    
    const container = new CSS3DObject(document.querySelector("#ar-container"))
    const anchor = mindARThreeJs.addCSSAnchor(0)
    anchor.group.scale.set(0.3, 0.3, 0.3)
    anchor.group.add(container)

    // Taustatekstuuri 3D-mallille
    const textureLoader = new THREE.TextureLoader()
    const envMap = textureLoader.load('../assets/textures/photostudio.jpg')
    envMap.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = envMap;
    scene.backgroundBlurriness = 0.5; 


    const models = []
    for (const key in gemstones) {
        const item = gemstones[key]

        // 3D-mallit
        const model = await loadGLTF(`../assets/models/gemstones/${item.model}`)

        model.scene.traverse((node) => {
            if (node.isMesh) {
                const mat = node.material
                node.material = new THREE.MeshPhongMaterial({
                    color: mat.color,
                    map: mat.map,
                    reflectivity: 1,
                    shininess: 100,
                    opacity: 0.8,
                    envMap: envMap
                })
            }
        })

        model.scene.scale.set(0.2, 0.2, 0.2)
        model.scene.position.set(0, 0, 0)

        models.push(model.scene)

        const anchorWebGL = mindARThreeJs.addAnchor(item.target)
        anchorWebGL.group.add(model.scene)

        const light1 = new THREE.SpotLight(0xffffff, 5);
        light1.position.set(2, 2, 2);
        light1.penumbra = 0.5;
        anchorWebGL.group.add(light1);
        light1.target = model.scene;

        const light2 = new THREE.SpotLight(0xffffff, 5);
        light2.position.set(-2, 2, -2);
        anchorWebGL.group.add(light2);
        light2.target = model.scene;

        const light3 = new THREE.DirectionalLight(0xffffff, 2);
        light3.position.set(0, -2, 2);
        anchorWebGL.group.add(light3);

        // 1. Luodaan kopio HTML-pohjasta jokaiselle kohteelle
        const template = document.querySelector("#ar-container");
        const element = template.cloneNode(true); // Kopioidaan elementti ja sen lapset
        element.id = ""; // Poistetaan ID, jotta ei tule duplikaatteja
        element.classList.add("ar-content-hidden")
        document.body.appendChild(element);

        // 2. Täytetään tiedot juuri TÄHÄN elementtiin (etsitään kopion sisältä)
        
        const title = element.querySelector("#artName")
        title.innerHTML = `<h1>${item.title}</h1>`;

        const technical = element.querySelector("#content-technical")
        technical.innerHTML = 
            `<h2>Teoksen tiedot</h2>
            <hr>
            <table>
                <tr>
                    <th><b>Teoksen nimi:</b></th>
                    <td>${item.title}</td>
                </tr>
                <tr>
                    <th><b>Tekijä:</b></th>
                    <td>${item.technical.artist}</td>
                </tr>
                <tr>
                    <th><b>Tekniikka:</b></th>
                    <td>${item.technical.medium}</td>
                </tr>
                <tr>
                    <th><b>Aihe:</b></th>
                    <td>${item.technical.gemstone}</td>
                </tr>
                <tr>
                    <th><b>Koko:</b></th>
                    <td>${item.technical.size.height} cm (K), ${item.technical.size.width} cm (L)</td>
                </tr>
                <tr>
                    <th><b>Vuosi:</b></th>
                    <td>${item.technical.year}</td>
                </tr>
                <tr>
                    <th><b>Hinta:</b></th>
                    <td>${item.technical.price} €</td>
                </tr>
            </table>
            `;
        
        const gemstone = element.querySelector("#content-gemstone")
        gemstone.innerHTML = 
            `<h2>${item.technical.gemstone}</h2>
            ${item.gemstone.stone}
            <hr>
            <p><b>Väri:</b> ${item.gemstone.color}
            <p><b>Hionta:</b> ${item.gemstone.cut}`;

        const actress = element.querySelector("#content-actress")
        actress.innerHTML = 
            `<h2>${item.actress.name}</h2>
            <h3>${item.actress.years}</h3>
            <p><b>Elokuvia:</b> ${item.actress.movies}</p>
            <hr>
            ${item.actress.biography}`;

        // 3. Luodaan CSS3DObject tästä nimenomaisesta kopiosta
        const cssObject = new CSS3DObject(element);
        const cssAnchor = mindARThreeJs.addCSSAnchor(item.target);
        cssAnchor.group.scale.set(0.3, 0.3, 0.3);
        cssAnchor.group.add(cssObject);

        const close = element.querySelector("#content-close")
        const artBtn = element.querySelector("#arArtBtn")
        const gemBtn = element.querySelector("#arGemBtn")
        const actressBtn = element.querySelector("#arActressBtn")

        artBtn.addEventListener("click", () => {
            console.log("Taideteos painettu")
            close.classList.add("visible")
            technical.classList.add("visible")
            gemstone.classList.remove("visible")
            actress.classList.remove("visible")

        })

        gemBtn.addEventListener("click", () => {
            console.log("Jalokivi painettu")
            close.classList.add("visible")
            technical.classList.remove("visible")
            gemstone.classList.add("visible")
            actress.classList.remove("visible")
        })

        actressBtn.addEventListener("click", () => {
            console.log("Näyttelijä painettu")
            close.classList.add("visible")
            technical.classList.remove("visible")
            gemstone.classList.remove("visible")
            actress.classList.add("visible")
        })

        close.addEventListener("click", () => {
            technical.classList.remove("visible")
            gemstone.classList.remove("visible")
            actress.classList.remove("visible")
            close.classList.remove("visible")
        })

        cssAnchor.onTargetFound = () => {
            setTimeout(() => {
                title.classList.add("visible")
            }, 100) 
            
            setTimeout(() => {
                artBtn.classList.add("visible")
            }, 300)     

            setTimeout(() => {
                gemBtn.classList.add("visible")
            }, 600)     

            setTimeout(() => {
                actressBtn.classList.add("visible")
            },900)     
        }
        
    }

    await mindARThreeJs.start()
    renderer.setAnimationLoop(render)

    function render() {
        models.forEach(m => {
            m.rotation.y += 0.01;
            m.rotation.z += 0.01;
        });
            
        renderer.render(scene, camera);
        cssRenderer.render(cssScene, camera);
    }

    // UI:
    const galleryBtn = document.querySelector("#galleryButton")
    const homeBtn = document.querySelector("#homeButton")
    const cameraBtn = document.querySelector("#cameraButton")

    galleryBtn.addEventListener("click", () => {
        console.log("Galleria painettu")
    })

    homeBtn.addEventListener("click", () => {
        console.log("Koti painettu")
    })

    cameraBtn.addEventListener("click", () => {
        console.log("Kamera painettu")
    })

}


