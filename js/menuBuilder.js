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
      img.classList.add('selected')

      li.appendChild(img)
      list.appendChild(li)

      li.addEventListener("click", () => {
          // 1. Poistetaan 'selected' kaikilta muilta li-elementeiltä
          const allItems = list.querySelectorAll('img')
          allItems.forEach(el => el.classList.remove('selected'))

          // 2. Lisätään 'selected' klikatulle elementille
          img.classList.add('selected')

          selectModel(modelPath)
          console.log("Valittu teos:", modelPath)
      })
    }
  })
}
