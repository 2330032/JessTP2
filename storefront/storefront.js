const scoreElement = document.getElementById('score');
const currencyElement = document.getElementById('currency');

let score = 0;
let currency = 0;

function initializeDatabase() {
  const request = window.indexedDB.open("cookieClickerDB", 1);

  request.onupgradeneeded = function(event) {
    const db = event.target.result;

    const gameDataStore = db.createObjectStore("gameData", { keyPath: "id" });
    gameDataStore.createIndex("type", "type", { unique: false });

    const initialGameData = [
      { id: 1, type: 'score', value: 0 },
      { id: 2, type: 'currency', value: 0 }
    ];

    initialGameData.forEach(item => {
      gameDataStore.add(item);
    });

    const inventoryStore = db.createObjectStore("inventory", { keyPath: "id" });

    const initialInventory = [
      { id: 1, name: "Upgrade 1", price: 15, type: "upgrade", available: true },
      { id: 2, name: "Skin 1", price: 50, type: "skin", available: true }
    ];

    initialInventory.forEach(item => {
      inventoryStore.add(item);
    });
  };

  request.onsuccess = function(event) {
    loadGameData();
    loadInventory();
  };
}

function loadGameData() {
  const request = window.indexedDB.open("cookieClickerDB", 1);
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(["gameData"], "readonly");
    const objectStore = transaction.objectStore("gameData");

    const scoreRequest = objectStore.get(1);
    scoreRequest.onsuccess = function(event) {
      score = scoreRequest.result ? scoreRequest.result.value : 0;
      scoreElement.textContent = score;
    };

    const currencyRequest = objectStore.get(2);
    currencyRequest.onsuccess = function(event) {
      currency = currencyRequest.result ? currencyRequest.result.value : 0;
      currencyElement.textContent = currency;
    };
  };
}

function updateGameData() {
  const request = window.indexedDB.open("cookieClickerDB", 1);
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(["gameData"], "readwrite");
    const objectStore = transaction.objectStore("gameData");

    const scoreRequest = objectStore.get(1);
    scoreRequest.onsuccess = function(event) {
      const scoreItem = scoreRequest.result;
      scoreItem.value = score;
      objectStore.put(scoreItem);
    };

    const currencyRequest = objectStore.get(2);
    currencyRequest.onsuccess = function(event) {
      const currencyItem = currencyRequest.result;
      currencyItem.value = currency;
      objectStore.put(currencyItem);
    };
  };
}

const clickableCircle = document.querySelector('.clickable-circle');
clickableCircle.addEventListener('click', () => {
  score++;
  currency++;

  scoreElement.textContent = score;
  currencyElement.textContent = currency;

  updateGameData();
});


function loadInventory() {
  const request = window.indexedDB.open("cookieClickerDB", 1);
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(["inventory"], "readonly");
    const objectStore = transaction.objectStore("inventory");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
      const inventory = event.target.result;
      console.log('Inventory loaded:', inventory);
      updateInventoryUI(inventory);
    };
  };
}

function updateInventoryUI(inventory) {
  const upgradeColumn = document.querySelector('.purchase-column:first-of-type');
  const skinColumn = document.querySelector('.purchase-column:last-of-type');
  
  upgradeColumn.innerHTML = '<h2>Upgrades</h2>';
  skinColumn.innerHTML = '<h2>Skins</h2>';

  inventory.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('purchase-item');
    itemDiv.innerHTML = `
      <img src="${item.type === 'upgrade' ? 'upgrade1.png' : 'skin1.png'}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>Description of ${item.name}</p>
      <p>Price: ${item.price} Currency</p>
      <button class="buy-button" data-id="${item.id}" ${item.available ? '' : 'disabled'}>Buy</button>
    `;
    
    if (item.type === 'upgrade') {
      upgradeColumn.appendChild(itemDiv);
    } else if (item.type === 'skin') {
      skinColumn.appendChild(itemDiv);
    }
  });

  const buyButtons = document.querySelectorAll('.buy-button');
  buyButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const itemId = parseInt(event.target.dataset.id);
      handlePurchase(itemId);
    });
  });
}

function handlePurchase(itemId) {
  const request = window.indexedDB.open("cookieClickerDB", 1);
  request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(["inventory"], "readwrite");
    const objectStore = transaction.objectStore("inventory");
    const request = objectStore.get(itemId);

    request.onsuccess = function(event) {
      const item = event.target.result;

      if (currency >= item.price && item.available) {
        currency -= item.price;
        item.available = false;

        objectStore.put(item);
        updateGameData(); 
        loadInventory(); 
        currencyElement.textContent = currency;
      } else {
        alert('You do not have enough currency to buy this item.');
      }
    };
  };
}

initializeDatabase();