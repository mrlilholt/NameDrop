// Main script.js
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";
import { initializeUploadModal } from "./upload_images.js";
import { auth, provider, signInWithPopup } from "./firebase.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const db = getFirestore();

let gameData = [];

// Fetch data from Firestore
async function fetchImageData() {
    try {
        const querySnapshot = await getDocs(collection(db, "images"));
        const imageData = [];
        querySnapshot.forEach((doc) => {
            imageData.push(doc.data());
        });
        return imageData;
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        return [];
    }
}

// Initialize game data
async function initializeGameData() {
    gameData = await fetchImageData();
    if (gameData.length === 0) {
        console.warn("No data found in Firestore. Using mock data.");
        gameData = [
            { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Alice", lastName: "Smith" },
            { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Bob", lastName: "Johnson" },
            { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Carol", lastName: "Davis" }
        ];
    }
    console.log("Game data initialized:", gameData);
    showRandomImage();
}

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("google-login");
    const gameArea = document.getElementById("game-area");
    const imageDisplay = document.getElementById("person-image");
    const nameInput = document.getElementById("name-guess");
    const submitGuessButton = document.getElementById("submit-guess");
    const toggleBar = document.getElementsByName("mode");
    const sidebar = document.createElement("div");
    const userIcon = document.createElement("div");
    const skipButton = document.createElement("button");

    let currentImage = null;
    let currentMode = "first-name";
    let score = 0;
    let streak = 0;

    // Google Sign-In
    loginButton.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            alert(`Welcome, ${user.displayName}!`);
            loginButton.style.display = "none";
            userIcon.style.display = "flex";
            userIcon.style.backgroundImage = user.photoURL ? `url(${user.photoURL})` : "none";
            userIcon.style.backgroundSize = "cover";
            userIcon.textContent = user.photoURL ? "" : user.displayName[0];
            initializeGameData();
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    });

    // Logout functionality
    document.getElementById("logout").addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("Logged out successfully");
            location.reload();
        });
    });

    // Sidebar setup
    sidebar.id = "sidebar";
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.left = "-250px";
    sidebar.style.width = "250px";
    sidebar.style.height = "100%";
    sidebar.style.backgroundColor = "#333";
    sidebar.style.color = "#fff";
    sidebar.style.padding = "20px";
    sidebar.style.transition = "left 0.3s";
    sidebar.innerHTML = `
        <h2 style="text-align: center;">Menu</h2>
        <ul style="list-style: none; padding: 0; text-align: center;">
            <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="view-profile">View Profile</li>
            <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="upload-images">Upload Images</li>
            <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="settings">Settings</li>
            <li id="logout" style="margin: 20px 0; font-size: 18px; cursor: pointer;">Logout</li>
        </ul>`;
    document.body.appendChild(sidebar);

    document.getElementById("view-profile").addEventListener("click", initializeProfileModal);
    document.getElementById("settings").addEventListener("click", initializeSettingsModal);
    document.getElementById("upload-images").addEventListener("click", initializeUploadModal);

    // Show a random image
    function showRandomImage() {
        if (gameData.length === 0) {
            console.warn("No game data available to display.");
            return;
        }

        const randomIndex = Math.floor(Math.random() * gameData.length);
        const selectedPerson = gameData[randomIndex];

        imageDisplay.src = selectedPerson.image;
        currentImage = selectedPerson;
        nameInput.value = "";
    }

    // Handle toggle change
    function updateMode() {
        currentMode = [...toggleBar].find(radio => radio.checked).value;
        if (currentMode === "full-name") {
            const lastNameInput = document.createElement("input");
            lastNameInput.id = "last-name-guess";
            lastNameInput.placeholder = "Last Name...";
            nameInput.parentNode.insertBefore(lastNameInput, nameInput.nextSibling);
        } else {
            const lastNameInput = document.getElementById("last-name-guess");
            if (lastNameInput) lastNameInput.remove();
        }
    }

    // Handle guess submission
    function handleGuess() {
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
            score += currentMode === "first-name" ? 1 : 3;
            alert("Correct!");
        } else {
            streak = 0;
            score -= 1;
            alert("Incorrect. Try again!");
        }

        scoreDisplay.innerHTML = `Score: ${score} <br> Streak: ${streak}`;
        showRandomImage();
    }

    // Handle skip
    skipButton.id = "skip-button";
    skipButton.textContent = "We need to still introduce ourselves";
    skipButton.style.marginTop = "10px";
    skipButton.style.padding = "10px 20px";
    skipButton.style.border = "none";
    skipButton.style.borderRadius = "5px";
    skipButton.style.backgroundColor = "#007bff";
    skipButton.style.color = "white";
    skipButton.style.cursor = "pointer";
    gameArea.appendChild(skipButton);

    skipButton.addEventListener("click", () => {
        alert("Skipping this person. Time to introduce yourselves later!");
        showRandomImage();
    });

    [...toggleBar].forEach(radio => radio.addEventListener("change", updateMode));
    submitGuessButton.addEventListener("click", handleGuess);

    gameArea.style.display = "none";
});
