// ---------------------------------------
// 1. Imports and Global Variables
// ---------------------------------------
// Main script.js
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";
import { initializeUploadModal } from "./upload_images.js";
import { auth, provider, signInWithPopup } from "./firebase.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";
import { saveScore, fetchScore, incrementScore, decrementScore } from "./scoring.js";

const db = getFirestore();

let gameData = []; // Global variable to store fetched data
let imageDisplay = null; // Global variable for the image display
let nameInput = null; // Global variable for name input
let gameArea = null; // Global variable for the game area
let submitGuessButton = null; // Global variable for the guess button
let userScore = 0; // Initialize score
let score = 0;
let streak = 0;
let currentMode = "first-name";
let currentScore = null;
let currentImage = null;
let scoreDisplay = null; // Declare it globally

// ---------------------------------------
// 2. Utility Functions
// ---------------------------------------
// Update the top bar with scores and user icon
function updateTopBar() {
    const topBar = document.getElementById("top-bar");
    const flameScore = document.getElementById("flame-score");
    const coinScore = document.getElementById("coin-score");
    const userIcon = document.getElementById("user-icon");

    if (flameScore) flameScore.textContent = streak;
    if (coinScore) coinScore.textContent = userScore;

    if (auth.currentUser && userIcon) {
        userIcon.style.display = "block";
        userIcon.style.backgroundImage = auth.currentUser.photoURL ? `url(${auth.currentUser.photoURL})` : "none";
        userIcon.style.backgroundSize = "cover";
        userIcon.textContent = auth.currentUser.photoURL ? "" : auth.currentUser.displayName[0];
    }
}

// Show a random image
function showRandomImage() {
    if (!gameData || gameData.length === 0) {
        console.warn("No game data available to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * gameData.length);
    const selectedPerson = gameData[randomIndex];

    // Update the image display
    imageDisplay.src = selectedPerson.image;
    currentImage = selectedPerson; // Track the current person for guesses
    nameInput.value = ""; // Clear the input field
}


// Fetch data from Firestore
async function fetchImageData() {
    const imagesCollection = collection(db, "images"); // Replace `db` with your Firestore instance
    const snapshot = await getDocs(imagesCollection);
    const data = [];
    snapshot.forEach((doc) => {
        const item = doc.data();
        data.push({
            image: item.imageUrl,
            firstName: item.firstName,
            lastName: item.lastName
        });
    });
    return data;
}

// Save score to Firestore
async function saveScoreToFirestore(userId, score) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { score });
        console.log("Score updated successfully:", score);
    } catch (error) {
        console.error("Error updating score:", error);
    }
}



// Fetch user score from Firestore
async function fetchUserScore(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            userScore = data.score || 0; // Default to 0 if no score exists
            scoreDisplay.textContent = `Score: ${userScore}`;
        } else {
            // Create user document if it doesn't exist
            await setDoc(userRef, { score: 0 });
            userScore = 0;
            scoreDisplay.textContent = `Score: ${userScore}`;
        }
    } catch (error) {
        console.error("Error fetching user score:", error);
    }
}

// ---------------------------------------
// 3. Core Game Logic
// ---------------------------------------

// Handle guess submission
async function handleGuess() {
    if (!currentImage) {
        alert("No image loaded to guess. Try again!");
        return;
    }

    const userGuess = nameInput.value.trim();
    const lastNameInput = document.getElementById("last-name-guess");
    const lastNameGuess = lastNameInput ? lastNameInput.value.trim() : "";

    let correctGuess = false;

    if (currentMode === "first-name" && userGuess.toLowerCase() === currentImage.firstName.toLowerCase()) {
        correctGuess = true;
    } else if (
        currentMode === "full-name" &&
        userGuess.toLowerCase() === currentImage.firstName.toLowerCase() &&
        lastNameGuess.toLowerCase() === currentImage.lastName.toLowerCase()
    ) {
        correctGuess = true;
    }

    if (correctGuess) {
        streak += 1;
        userScore = incrementScore(userScore, currentMode === "first-name" ? 1 : 3);
        alert("Correct!");
    } else {
        streak = 0;
        userScore = decrementScore(userScore, 1);
        alert("Incorrect. Try again!");
    }

    try {
        // Save the updated score to Firestore
        await saveScore(auth.currentUser.uid, userScore);
        updateTopBar();
    } catch (error) {
        console.error("Error saving score:", error);
    }

    // Load the next image
    showRandomImage();
}

// Initialize game data
async function initializeGameData() {
    try {
        gameData = await fetchImageData();
        if (gameData.length === 0) {
            console.warn("No data found in Firestore. Using mock data.");
            gameData = [
                { image: "https://via.placeholder.com/150", firstName: "Mock", lastName: "Data" }
            ];
        }
        console.log("Game data initialized:", gameData);
        showRandomImage(); // Display the first random image
    } catch (error) {
        console.error("Error fetching image data:", error);
    }
}
// ---------------------------------------
// 4. DOM Setup and Event Listeners
// ---------------------------------------

// Firebase imports
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    scoreDisplay = document.getElementById("score");
    if (!scoreDisplay) {
        console.error('Could not find the "score" element in the DOM.');
    }

    imageDisplay = document.getElementById("person-image"); // Assign imageDisplay
    nameInput = document.getElementById("name-guess"); // Assign nameInput
    gameArea = document.getElementById("game-area");
    submitGuessButton = document.getElementById("submit-guess");

    const toggleBar = document.getElementsByName("mode");
    const loginButton = document.getElementById("google-login");
    const userIcon = document.getElementById("user-icon");
    const sidebar = document.getElementById("sidebar");

    // Setup sidebar toggle
    userIcon.addEventListener("click", () => {
        sidebar.style.left = sidebar.style.left === "-250px" ? "0" : "-250px";
    });

    // Handle Google Sign-In
    async function handleSignIn() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            alert(`Welcome, ${user.displayName}!`);

            // Fetch user score
            await fetchUserScore(user.uid);

            // Update user icon and top bar
            updateTopBar();

            // Hide login button
            loginButton.style.display = "none";

            // Initialize game data and start the game
            await initializeGameData(); // Fetch data and show the first image
            gameArea.style.display = "block"; // Make the game area visible
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    }

    // Initialize game
    function initGame() {
        gameArea.style.display = "block";
        showRandomImage();
    }

    // Event Listeners
    [...toggleBar].forEach(radio => radio.addEventListener("change", updateMode));
    submitGuessButton.addEventListener("click", handleGuess);
    loginButton.addEventListener("click", handleSignIn);

    // Hide game area until login
    gameArea.style.display = "none";
});

