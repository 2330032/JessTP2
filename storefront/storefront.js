const scoreElement = document.getElementById('score');
const currencyElement = document.getElementById('currency');

let score = 0;
let currency = 0;
let currencyPerClick = 1;

function initializeDatabase() {
  const request = window.indexedDB.open("cookieClickerDB", 1);

  request.onupgradeneeded = function(event) {
    const db = event.target.result;

    const gameDataStore = db.createObjectStore("gameData", { keyPath: "id" });
    gameDataStore.createIndex("type", "type", { unique: false });

    const initialGameData = [
      { id: 1, type: 'score', value: 0 },
      { id: 2, type: 'currency', value: 0 },
      { id: 3, type: 'currencyPerClick', value: 1 }
    ];

    initialGameData.forEach(item => {
      gameDataStore.add(item);
    });

    const inventoryStore = db.createObjectStore("inventory", { keyPath: "id" });

    const initialInventory = [
      { id: 1, name: "Upgrade", description: "More clicks per click!", basePrice: 15, priceMultiplier: 1.5, currentPrice: 15, type: "upgrade", available: true },
      { id: 2, name: "Green", description: "It's green now", basePrice: 50, priceMultiplier: 1.0, currentPrice: 50, type: "skin", available: true }
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

    const currencyPerClickRequest = objectStore.get(3);
    currencyPerClickRequest.onsuccess = function(event) {
      currencyPerClick = currencyPerClickRequest.result ? currencyPerClickRequest.result.value : 1;
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
  currency += currencyPerClick;

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
      <p>${item.description}</p>
      <p>Price: ${item.currentPrice}</p>      
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
    const transaction = db.transaction(["inventory", "gameData"], "readwrite");
    const inventoryStore = transaction.objectStore("inventory");
    const gameDataStore = transaction.objectStore("gameData");

    const itemRequest = inventoryStore.get(itemId);
    itemRequest.onsuccess = function(event) {
      const item = itemRequest.result;

      if (currency >= item.currentPrice && item.available) {
        currency -= item.currentPrice;

        if (item.type === 'skin') {
          item.available = false;
          item.currentPrice = 'Void'
          item.name = "Uh-oh";
          item.description = "No going back";
          changeCircleColor();
        } else if (item.type === 'upgrade') {
          currencyPerClick++;


          const currencyPerClickRequest = gameDataStore.get(3);
          currencyPerClickRequest.onsuccess = function(event) {
            const currencyPerClickData = currencyPerClickRequest.result;
            currencyPerClickData.value = currencyPerClick;
            gameDataStore.put(currencyPerClickData);
          };

          item.currentPrice = Math.ceil(item.currentPrice * item.priceMultiplier);
        }

        inventoryStore.put(item); 
        updateGameData(); 
        
        currencyElement.textContent = currency;

        loadInventory();
      } else {
        alert('You do not have enough currency to buy this item.');
      }
    };
  };
}

initializeDatabase();

function changeCircleColor() {
  const clickableCircle = document.querySelector('.clickable-circle');
  clickableCircle.style.background = 'linear-gradient(#c7f800, #078513)';
}