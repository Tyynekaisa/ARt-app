// menuBuilder.js
import { loadModelData } from './dataLoader.js';
import { selectModel } from './artwall.js';

export function buildModelMenu() {
  const list = document.getElementById('modelList');
  
  loadModelData().then(data => {
    console.log(data)

    for (const key in data) {
        const item = data[key]

        const li = document.createElement('li');

        const modelPath = `/assets/models/paintings/${item.model}`;
        const imagePath = `/assets/images/targetImages/${item.image}`;

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
