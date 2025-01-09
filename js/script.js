// Mock dataset of images and names
const mockData = [
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Alice", lastName: "Smith" },
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Bob", lastName: "Johnson" },
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Carol", lastName: "Davis" }
];

// Firebase imports
import { auth, provider, signInWithPopup, signOut } from "./firebase.js";

// Elements
const gameArea = document.getElementById("game-area");
const imageDisplay = document.getElementById("person-image");
const nameInput = document.getElementById("name-guess");
const submitGuessButton = document.getElementById("submit-guess");
const toggleBar = document.getElementsByName("mode");
const scoreDisplay = document.getElementById("score");
const loginButton = document.getElementById("google-login");

let currentImage = null;
let currentMode = "first-name";
let score = 0;

// Show a random image
function showRandomImage() {
    const randomIndex = Math.floor(Math.random() * mockData.length);
    currentImage = mockData[randomIndex];
    imageDisplay.src = currentImage.image;
    nameInput.value = ""; // Clear input field
}

// Handle toggle change
function updateMode() {
    currentMode = [...toggleBar].find(radio => radio.checked).value;
}

// Handle guess submission
function handleGuess() {
    const userGuess = nameInput.value.trim();
    let correctGuess = false;

    if (currentMode === "first-name" && userGuess.toLowerCase() === currentImage.firstName.toLowerCase()) {
        correctGuess = true;
    } else if (
        currentMode === "full-name" &&
        userGuess.toLowerCase() === `${currentImage.firstName.toLowerCase()} ${currentImage.lastName.toLowerCase()}`
    ) {
        correctGuess = true;
    }

    if (correctGuess) {
        score += currentMode === "first-name" ? 1 : 3; // First name: 1 point, Full name: 3 points
        alert("Correct!");
    } else {
        score -= 1; // Deduct a point for wrong guess
        alert("Incorrect. Try again!");
    }

    scoreDisplay.textContent = score;
    showRandomImage();
}

// Handle Google Sign-In
async function handleSignIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        alert(`Welcome, ${user.displayName}!`);
        initGame();
    } catch (error) {
        console.error("Error during sign-in:", error);
    }
}

// Event Listeners
[...toggleBar].forEach(radio => radio.addEventListener("change", updateMode));
submitGuessButton.addEventListener("click", handleGuess);
loginButton.addEventListener("click", handleSignIn);

// Initialize game
function initGame() {
    gameArea.style.display = "block";
    showRandomImage();
}

// For now, hide the game area until login
gameArea.style.display = "none";
