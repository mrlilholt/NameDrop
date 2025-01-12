// ---------------------------------------
// 1. Imports and Global Variables
// ---------------------------------------
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";
import { initializeUploadModal } from "./upload_images.js";
import { auth, provider, signInWithPopup } from "./firebase.js";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";
import { saveScore, fetchScore, incrementScore, decrementScore } from "./scoring.js";

const db = getFirestore();

let gameData = [];
let currentImage = null;
let nameInput = null;
let gameArea = null;
let submitGuessButton = null;
let userScore = 0;
let streak = 0;
let currentMode = "first-name";
let scoreDisplay = null;
let imageDisplay = null; // Ensures imageDisplay is declared globally

// ---------------------------------------
// 2. Utility Functions
// ---------------------------------------

// Show a random image
function showRandomImage() {
    if (!gameData || gameData.length === 0) {
        console.warn("No game data available to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * gameData.length);
    const selectedPerson = gameData[randomIndex];

    imageDisplay.src = selectedPerson.image; // Update the image
    currentImage = selectedPerson;
    nameInput.value = ""; // Clear the input field
}

// Fetch data from Firestore
async function fetchImageData() {
    const imagesCollection = collection(db, "images");
    const snapshot = await getDocs(imagesCollection);
    const data = [];
    snapshot.forEach((doc) => {
        const item = doc.data();
        data.push({
            image: item.imageUrl,
            firstName: item.firstName,
            lastName: item.lastName,
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
            userScore = data.score || 0;
            scoreDisplay.textContent = `Score: ${userScore}`;
        } else {
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
        await saveScoreToFirestore(auth.currentUser.uid, userScore);
        scoreDisplay.innerHTML = `Score: ${userScore} <br> Streak: ${streak}`;
    } catch (error) {
        console.error("Error saving score:", error);
    }

    showRandomImage();
}

// Initialize game data
async function initializeGameData() {
    try {
        gameData = await fetchImageData();
        if (gameData.length === 0) {
            console.warn("No data found in Firestore. Using mock data.");
            gameData = [{ image: "https://via.placeholder.com/150", firstName: "Mock", lastName: "Data" }];
        }
        console.log("Game data initialized:", gameData);
        showRandomImage();
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
}

// ---------------------------------------
// 4. DOM Setup and Event Listeners
// ---------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    scoreDisplay = document.getElementById("score");
    imageDisplay = document.getElementById("person-image");
    nameInput = document.getElementById("name-guess");
    gameArea = document.getElementById("game-area");
    submitGuessButton = document.getElementById("submit-guess");

    const loginButton = document.getElementById("google-login");

    // Login event
    loginButton.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Fetch user score and initialize game data
            await fetchUserScore(user.uid);
            await initializeGameData();

            // Make game area visible
            gameArea.style.display = "block";
        } catch (error) {
            console.error("Error during login:", error);
        }
    });

    // Guess submission event
    submitGuessButton.addEventListener("click", handleGuess);
});
