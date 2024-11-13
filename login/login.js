

const users = [];

// Signup logic
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;


    const userExists = users.some(user => user.username === newUsername);
    if (userExists) {
        alert('Username already exists. Please choose another one.');
    } else {
 
        users.push({ username: newUsername, password: newPassword });
        alert('User registered successfully!');
        this.reset(); 
    }
});

// Login logic
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;


    const user = users.find(user => user.username === username);
    if (!user) {
        alert('Username does not exist. Please sign up first.');
        this.reset(); 
        return; 
    }


    if (user.password === password) {
        alert('Login successful!');
        this.reset();
    } else {
        alert('Invalid password. Please try again.');
        this.reset();
    }
});


function flipForm() {
    const formBox = document.getElementById("formBox");
    formBox.classList.toggle("flipped");
    
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();

}
