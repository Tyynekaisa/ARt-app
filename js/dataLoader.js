// dataLoader.js

let modelData = null;
let dataPromise = null;

export function loadModelData() {
  // Jos data on jo ladattu, palautetaan se heti
  if (modelData) return Promise.resolve(modelData);

  // Jos lataus on jo käynnissä, palautetaan sama promise
  if (dataPromise) return dataPromise;

  // Muuten aloitetaan lataus
  dataPromise = fetch('../data/gemstones.json')
    .then(res => res.json())
    .then(json => {
      modelData = json;
      return modelData;
    })
    .catch(err => {
      console.error("JSON-latausvirhe:", err);
      throw err;
    });

  return dataPromise;
}
