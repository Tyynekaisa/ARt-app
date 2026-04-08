// menuBuilder.js
import { loadModelData } from 'https://tyynekaisa.github.io/ARt-app/js/dataLoader.js';
import { selectModel } from 'https://tyynekaisa.github.io/ARt-app/js/artwall.js';

export function buildModelMenu() {
  const list = document.getElementById('modelList');
  
  loadModelData().then(data => {
    console.log(data)

    for (const key in data) {
        const item = data[key]

        const li = document.createElement('li');

        const modelPath = `https://tyynekaisa.github.io/ARt-app/assets/models/paintings/${item.model}`;
        const imagePath = `https://tyynekaisa.github.io/ARt-app/assets/images/targetImages/${item.image}`;

        li.dataset.model = item.model;

        const img = document.createElement('img');
        img.src = imagePath;
        img.classList.add('menu-image');

        li.appendChild(img);
        list.appendChild(li);

        li.addEventListener("click", () => {
            selectModel(modelPath);
            console.log("Valittu teos:", modelPath);
        })
    }
  })
}
