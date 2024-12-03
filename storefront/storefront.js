
//score and currency updates
const scoreElement = document.getElementById('score');
const currencyElement = document.getElementById('currency');

let score = 0;
let currency = 0;

const cookieButton = document.getElementById('cookie-button');

cookieButton.addEventListener('click', () => {
  score++;
  currency++;

  scoreElement.textContent = score;
  currencyElement.textContent = currency;
});

//buyButton onClick 
const buyButtons = document.querySelectorAll('.buy-button');
        //add click event listener
        //check if currency is >= than price
            //if yes -> reduce currency by item price, activate item
            //if no, alert('You don't have enough currency to buy this item.');

//inventory
const initialInventory = [
    {
      id: 1,
      name: "Upgrade",
      price: 15,
      type: "upgrade",
      available: true
    },
    {
      id: 2,
      name: "Skin",
      price: 50,
      type: "skin",
      available: true
    },
    // Add items ++
  ];

  //database
  function initializeDatabase() {
    const request = window.indexedDB.open("cookieClickerDB", 1);
  
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore("inventory", { keyPath: "id" });
  
      for (const item of initialInventory) {
        objectStore.add(item);
      }
    };
  
    request.onsuccess = function(event) {
      loadInventory();
    };
  }

  function loadInventory() {
    const request = window.indexedDB.open("cookieClickerDB", 1);
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(["inventory"], "readonly");
      const objectStore = transaction.objectStore("inventory");
      const request = objectStore.getAll();
      request.onsuccess = function(event) {
        const inventory = event.target.result;
        updateGameUI(inventory);
      };
    };
  }