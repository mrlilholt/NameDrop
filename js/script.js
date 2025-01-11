// Main script.js
import { initializeProfileModal } from "./userinfo.js";
import { initializeSettingsModal } from "./settings.js";
import { initializeUploadModal } from "./upload_images.js";
import { auth, provider, signInWithPopup } from "./firebase.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const db = getFirestore();

let gameData = []; // Global variable to store the fetched data

//Initialize game data
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



function fetchImageDataRealtime() {
    console.log("Setting up Firestore real-time listener...");
    const imagesCollection = collection(db, "images");

    onSnapshot(imagesCollection, (snapshot) => {
        gameData = []; // Clear existing data to avoid duplicates
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Fetched document:", doc.id, data);

            // Validate and push only complete data
            if (data.imageUrl && data.firstName && data.lastName) {
                gameData.push({
                    image: data.imageUrl,
                    firstName: data.firstName,
                    lastName: data.lastName,
                });
            } else {
                console.warn("Document skipped due to missing fields:", doc.id, data);
            }
        });

        console.log("Updated game data:", gameData);

        if (gameData.length > 0) {
            console.log("Displaying random image...");
            showRandomImage();
        } else {
            console.warn("No valid game data found in Firestore.");
        }
    }, (error) => {
        console.error("Error setting up Firestore real-time listener:", error);
    });
}

// Firebase imports

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const gameArea = document.getElementById("game-area");
    const imageDisplay = document.getElementById("person-image"); // Should match your HTML ID
    const nameInput = document.getElementById("name-guess"); // Ensure this ID matches your input
    const submitGuessButton = document.getElementById("submit-guess");
    const toggleBar = document.getElementsByName("mode");
    const scoreDisplay = document.getElementById("score");
    const loginButton = document.getElementById("google-login");
    const userIcon = document.createElement("div");
    const sidebar = document.createElement("div");
    const skipButton = document.createElement("button");

    let currentImage = null;
    let currentMode = "first-name";
    let score = 0;
    let streak = 0;

    // Setup user icon
    userIcon.id = "user-icon";
    userIcon.style.display = "none";
    userIcon.style.position = "absolute";
    userIcon.style.top = "10px";
    userIcon.style.right = "10px";
    userIcon.style.width = "40px";
    userIcon.style.height = "40px";
    userIcon.style.borderRadius = "50%";
    userIcon.style.backgroundColor = "#ccc";
    userIcon.style.display = "flex";
    userIcon.style.justifyContent = "center";
    userIcon.style.alignItems = "center";
    userIcon.style.cursor = "pointer";
    document.body.appendChild(userIcon);

    // Setup sidebar
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
    document.getElementById("upload-images").addEventListener("click", initializeUploadModal); // Correctly initialize the upload modal


    // Toggle sidebar
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

    // View Profile functionality
    document.getElementById("view-profile").addEventListener("click", initializeProfileModal);

    // Settings functionality
    document.getElementById("settings").addEventListener("click", initializeSettingsModal);

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
            score += currentMode === "first-name" ? 1 : 3; // First name: 1 point, Full name: 3 points
            alert("Correct!");
        } else {
            streak = 0;
            score -= 1; // Deduct a point for wrong guess
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

     // Handle Google Sign-In
     async function handleSignIn() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            alert(`Welcome, ${user.displayName}!`);

            // Update user icon
            userIcon.style.display = "flex";
            userIcon.style.backgroundImage = user.photoURL ? `url(${user.photoURL})` : "none";
            userIcon.style.backgroundSize = "cover";
            userIcon.textContent = user.photoURL ? "" : user.displayName[0];

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
