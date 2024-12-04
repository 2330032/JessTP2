let db;
const request = indexedDB.open("UserDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    const store = db.createObjectStore("Users", { keyPath: "username" });
    store.createIndex("username", "username", { unique: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database initialized successfully");
};

request.onerror = function(event) {
    console.error("Error initializing database:", event.target.errorCode);
};

// Signup logic
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    const transaction = db.transaction(["Users"], "readwrite");
    const store = transaction.objectStore("Users");

    const getRequest = store.get(newUsername);
    getRequest.onsuccess = function() {
        if (getRequest.result) {
            alert('Username already exists. Please choose another one.');
        } else {
            const addRequest = store.add({ username: newUsername, password: newPassword });
            addRequest.onsuccess = function() {
                alert('User registered successfully!');
                document.getElementById('signupForm').reset();
            };
            addRequest.onerror = function() {
                console.error("Error adding user:", addRequest.error);
            };
        }
    };
    getRequest.onerror = function() {
        console.error("Error checking user existence:", getRequest.error);
    };
});

// Login logic
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const transaction = db.transaction(["Users"], "readonly");
    const store = transaction.objectStore("Users");

    const getRequest = store.get(username);
    getRequest.onsuccess = function() {
        const user = getRequest.result;
        if (!user) {
            alert('Username does not exist. Please sign up first.');
        } else if (user.password === password) {
            alert('Login successful!');
        } else {
            alert('Invalid password. Please try again.');
        }
        document.getElementById('loginForm').reset();

        window.location.href = "../storefront/storefront.html";
    };
    getRequest.onerror = function() {
        console.error("Error checking user existence:", getRequest.error);
    };
});

// Flip forms
function flipForm() {
    const formBox = document.getElementById("formBox");
    document.getElementById('loginForm').classList.toggle("flipped");
    document.getElementById('signupForm').classList.toggle("flipped");

    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
}
