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
let menuButton = null; // Global variable for the menu button
let sidebar = null; // Global variable for the sidebar


// ---------------------------------------
// 2. Utility Functions
// ---------------------------------------
function setupTopBar() {
    const topBar = document.getElementById("top-bar");
    if (!topBar) {
        console.error("Top bar element not found. Make sure it exists in the HTML.");
        return;
    }

    // Clear the topBar before adding elements to avoid duplicates
    topBar.innerHTML = "";

    // Add logo section
    const logoSection = document.createElement("div");
    logoSection.id = "logo-section";
    logoSection.innerHTML = `<img src="./assets/NameDrop.png" alt="Logo" style="height: 60px;">`;
    topBar.appendChild(logoSection);

    // Add text section
    const textSection = document.createElement("div");
    textSection.id = "text-section";
    textSection.innerHTML = `
        <div id="scores-container" style="display: flex; align-items: center; gap: 20px;">
            <div id="flame-score" class="score-section">
                <img src="./assets/streak-icon.png" alt="Streak">
                <span>0</span>
            </div>
            <h2>Matching Names to Faces</h2>
            <div id="coin-score" class="score-section">
                <img src="./assets/score-icon.png" alt="Score">
                <span>0</span>
            </div>
        </div>`;
    topBar.appendChild(textSection);

    // Add user info section
    const userInfoSection = document.createElement("div");
    userInfoSection.id = "user-info-section";
    userInfoSection.innerHTML = `
        <button id="menu-button">☰</button>
        <div id="user-icon" style="width: 40px; height: 40px; display: none;"></div>`;
    topBar.appendChild(userInfoSection);

    // Assign global variables
    menuButton = document.getElementById("menu-button");
    sidebar = document.getElementById("sidebar");
}



// Update the top bar with scores and user icon
function updateTopBar() {
    const flameScore = document.querySelector("#flame-score span");
    const coinScore = document.querySelector("#coin-score span");
    const userIcon = document.getElementById("user-icon");

    // Update score and streak values
    if (flameScore) flameScore.textContent = streak;
    if (coinScore) coinScore.textContent = userScore;

    // Update user icon dynamically
    if (auth.currentUser && userIcon) {
        userIcon.style.display = "block"; // Ensure it is visible
        if (auth.currentUser.photoURL) {
            userIcon.style.backgroundImage = `url(${auth.currentUser.photoURL})`;
            userIcon.style.backgroundColor = "transparent"; // Remove grey fallback
            userIcon.textContent = ""; // No text needed if photo is present
        } else {
            userIcon.style.backgroundImage = "none";
            userIcon.style.backgroundColor = "#ccc"; // Default grey
            userIcon.textContent = auth.currentUser.displayName ? auth.currentUser.displayName[0] : "?"; // Initials fallback
        }
    } else if (userIcon) {
        userIcon.style.display = "none"; // Hide icon if no user is logged in
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

            // Update the top bar score display
            const topScoreDisplay = document.querySelector("#coin-score span");
            if (topScoreDisplay) topScoreDisplay.textContent = userScore;

            // Update the bottom score display
            const bottomScoreDisplay = document.querySelector("#score");
            if (bottomScoreDisplay) bottomScoreDisplay.textContent = userScore;
        } else {
            // Create user document if it doesn't exist
            await setDoc(userRef, { score: 0 });
            userScore = 0;

            // Update the top bar score display
            const topScoreDisplay = document.querySelector("#coin-score span");
            if (topScoreDisplay) topScoreDisplay.textContent = userScore;

            // Update the bottom score display
            const bottomScoreDisplay = document.querySelector("#score");
            if (bottomScoreDisplay) bottomScoreDisplay.textContent = userScore;
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

    const firstNameInput = document.getElementById("first-name-input");
    const lastNameInput = document.getElementById("last-name-input");

    if (!firstNameInput) {
        console.error("First name input field not found.");
        return;
    }

    const userGuess = firstNameInput.value.trim();
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

    // Update the top bar score display
    const topScoreDisplay = document.querySelector("#coin-score span");
    if (topScoreDisplay) topScoreDisplay.textContent = userScore;

    // Update the bottom score display
    const bottomScoreDisplay = document.querySelector("#score");
    if (bottomScoreDisplay) bottomScoreDisplay.textContent = userScore;

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

        // Validate data structure
        gameData.forEach((item, index) => {
            if (!item.image || !item.firstName || !item.lastName) {
                console.warn(`Missing fields in gameData[${index}]:`, item);
            }
        });

        showRandomImage(); // Display the first random image
    } catch (error) {
        console.error("Error fetching image data:", error);
    }
}

// ---------------------------------------
// 4. DOM Setup and Event Listeners
// ---------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const scoreDisplay = document.getElementById("score");
    const imageDisplay = document.getElementById("person-image");
    const firstNameInput = document.getElementById("first-input");
    const lastNameInput = document.getElementById("last-input");
    const gameArea = document.getElementById("game-area");
    const submitGuessButton = document.getElementById("submit-button");
    const toggleSwitch = document.getElementById("name-toggle"); // Toggle switch for first/last mode

      // Hide main content initially
      mainContent.style.display = "none";

    // Initialize top bar (handles user-icon creation)
    setupTopBar();

    const loginButton = document.getElementById("google-login");
    const userIcon = document.getElementById("user-icon"); // Reference the existing user icon

    // Sidebar Menu
    let sidebar = document.createElement("div");
    sidebar.id = "sidebar";
    sidebar.style = `
        position: fixed;
        top: 0;
        left: -250px;
        width: 250px;
        height: 100%;
        background-color: #333;
        color: #fff;
        padding: 20px;
        transition: left 0.3s;
    `;
    sidebar.innerHTML = `
    <h2 style="text-align: center;">Menu</h2>
    <ul style="list-style: none; padding: 0; text-align: center;">
        <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="view-profile">View Profile</li>
        <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="upload-images">Upload Images</li>
        <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="settings">Settings</li>
        <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="leaderboard">Leaderboard</li>
        <li id="logout" style="margin: 20px 0; font-size: 18px; cursor: pointer;">Logout</li>
    </ul>`;
    document.body.appendChild(sidebar);

    // First/last name toggle logic
    toggleSwitch.addEventListener("change", () => {
        if (toggleSwitch.checked) {
            lastNameInput.style.display = "block"; // Show last name input
        } else {
            lastNameInput.style.display = "none"; // Hide last name input
            lastNameInput.value = ""; // Clear value when switching back
        }
    });

    // Sidebar toggle functionality
    document.getElementById("menu-button").addEventListener("click", () => {
        sidebar.style.left = sidebar.style.left === "-250px" ? "0" : "-250px";
    });

    // Event listeners for sidebar
    document.getElementById("view-profile").addEventListener("click", initializeProfileModal);
    document.getElementById("settings").addEventListener("click", initializeSettingsModal);
    document.getElementById("upload-images").addEventListener("click", initializeUploadModal);
    document.getElementById("leaderboard").addEventListener("click", () => {
        window.location.href = "leaderboard.html"; // Redirect to leaderboard page
    });

    // Toggle sidebar visibility
    userIcon.addEventListener("click", () => {
        sidebar.style.left = sidebar.style.left === "-250px" ? "0" : "-250px";
    });

    // Logout functionality
    document.getElementById("logout").addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("Logged out successfully");
            location.reload();
        });
    });
    // Firebase Auth State Listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is logged in, show the main content
            loginContainer.style.display = "none";
            mainContent.style.display = "block";

            // Initialize game data and UI
            await fetchUserScore(user.uid);
            await initializeGameData();
            updateTopBar();
        } else {
            // No user logged in, show the login container
            loginContainer.style.display = "flex";
            mainContent.style.display = "none";
        }
    });
    
// Google login functionality
loginButton.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Fetch user data or initialize if new
        await fetchUserScore(user.uid);

        // Update UI for the logged-in user
        loginContainer.style.display = "none"; // Hide login container
        mainContent.style.display = "block"; // Show main content
        userIcon.style.display = "flex"; // Show user icon
        userIcon.style.backgroundImage = user.photoURL ? `url(${user.photoURL})` : "none";
        userIcon.style.backgroundSize = "cover";
        userIcon.textContent = user.photoURL ? "" : user.displayName[0]; // Show initial if no photo

        console.log("Login successful:", user);
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
    }
});

    // Guess submission event
    submitGuessButton.addEventListener("click", () => {
        const firstName = firstNameInput.value.trim();
        const lastName = toggleSwitch.checked ? lastNameInput.value.trim() : "";

        if (!firstName || (toggleSwitch.checked && !lastName)) {
            alert("Please fill in the required fields!");
            return;
        }

        handleGuess(firstName, lastName);
    });

    // Hide game area until login
    gameArea.style.display = "none";
});
