// menuBuilder.js
import { loadModelData } from 'https://tyynekaisa.github.io/ARt-app/js/dataLoader.js'
import { selectModel } from 'https://tyynekaisa.github.io/ARt-app/js/artwall.js'

export function buildModelMenu() {
  const list = document.getElementById('modelList')
  
  loadModelData().then(data => {
    console.log(data)

    for (const key in data) {
      const item = data[key]

      const li = document.createElement('li')

      const modelPath = `https://tyynekaisa.github.io/ARt-app/assets/models/paintings/${item.model}`
      const imagePath = `https://tyynekaisa.github.io/ARt-app/assets/images/targetImages/${item.image}`

      li.dataset.model = item.model

      const img = document.createElement('img')
      img.src = imagePath;
      img.classList.add('menu-image')

      const checkmarkImg = document.createElement('img');
      checkmarkImg.src = 'https://tyynekaisa.github.io/ARt-app/svg/checkmark.svg'; // Polku tiedostoosi
      checkmarkImg.classList.add('checkmark-icon');

      list.appendChild(li)
      li.appendChild(img)
      li.appendChild(checkmarkImg); // Lisätään oma checkmark-tiedostosi

      li.addEventListener("click", () => {
          // 1. Poistetaan 'selected' kaikilta muilta li-elementeiltä
          const allItems = list.querySelectorAll('li')
          allItems.forEach(el => el.classList.remove('selected'))

          // 2. Lisätään 'selected' klikatulle elementille
          li.classList.add('selected')

          selectModel(modelPath)
          console.log("Valittu teos:", modelPath)
      })
    }
  })
}
