// Mock dataset of images and names
const mockData = [
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Alice", lastName: "Smith" },
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Bob", lastName: "Johnson" },
    { image: "https://fonts.gstatic.com/s/i/materialicons/person/v14/24px.svg", firstName: "Carol", lastName: "Davis" }
];

// Firebase imports
import { auth, provider, signInWithPopup } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const gameArea = document.getElementById("game-area");
    const imageDisplay = document.getElementById("person-image");
    const nameInput = document.getElementById("name-guess");
    const submitGuessButton = document.getElementById("submit-guess");
    const toggleBar = document.getElementsByName("mode");
    const scoreDisplay = document.getElementById("score");
    const loginButton = document.getElementById("google-login");
    const userIcon = document.createElement("div");
    const sidebar = document.createElement("div");

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
        <li style="margin: 20px 0; font-size: 18px; cursor: pointer;" id="settings">Settings</li>
        <li id="logout" style="margin: 20px 0; font-size: 18px; cursor: pointer;">Logout</li>
    </ul>`;
    document.body.appendChild(sidebar);

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
    document.getElementById("view-profile").addEventListener("click", () => {
        const profileModal = document.createElement("div");
        profileModal.id = "profile-modal";
        profileModal.style.position = "fixed";
        profileModal.style.top = "50%";
        profileModal.style.left = "50%";
        profileModal.style.transform = "translate(-50%, -50%)";
        profileModal.style.width = "400px";
        profileModal.style.padding = "20px";
        profileModal.style.backgroundColor = "#fff";
        profileModal.style.borderRadius = "10px";
        profileModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        profileModal.style.zIndex = "1000";
        profileModal.innerHTML = `
            <h2 style="text-align: center;">Your Profile</h2>
            <div style="text-align: center; margin: 20px 0;">
                <div id="profile-picture" style="
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                    border-radius: 50%;
                    background-color: #ccc;
                    background-size: cover;
                    background-image: url(${auth.currentUser?.photoURL || ''});
                "></div>
                <p><strong>Name:</strong> ${auth.currentUser?.displayName || 'Unknown'}</p>
                <p><strong>Email:</strong> ${auth.currentUser?.email || 'Unknown'}</p>
            </div>
            <button id="close-profile" style="
                display: block;
                margin: 0 auto;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(profileModal);

        document.getElementById('close-profile').addEventListener('click', () => {
            document.body.removeChild(profileModal);
        });
    });

    // Settings functionality
    document.getElementById("settings").addEventListener("click", () => {
        const settingsModal = document.createElement("div");
        settingsModal.id = "settings-modal";
        settingsModal.style.position = "fixed";
        settingsModal.style.top = "50%";
        settingsModal.style.left = "50%";
        settingsModal.style.transform = "translate(-50%, -50%)";
        settingsModal.style.width = "400px";
        settingsModal.style.padding = "20px";
        settingsModal.style.backgroundColor = "#fff";
        settingsModal.style.borderRadius = "10px";
        settingsModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        settingsModal.style.zIndex = "1000";
        settingsModal.innerHTML = `
            <h2 style="text-align: center;">Settings</h2>
            <div style="margin: 20px 0;">
                <label for="nickname" style="display: block; font-weight: bold;">Nickname:</label>
                <input type="text" id="nickname" placeholder="Enter your nickname..." style="
                    width: calc(100% - 20px);
                    padding: 10px;
                    margin-top: 5px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                ">
            </div>
            <button id="save-settings" style="
                display: block;
                margin: 10px auto;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Save</button>
            <button id="close-settings" style="
                display: block;
                margin: 10px auto;
                padding: 10px 20px;
                background-color: #ccc;
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(settingsModal);

        // Save nickname functionality
        document.getElementById("save-settings").addEventListener("click", () => {
            const nicknameInput = document.getElementById("nickname").value.trim();
            if (nicknameInput) {
                alert(`Nickname saved: ${nicknameInput}`);
                // Future implementation: Save the nickname to Firestore or localStorage
            } else {
                alert("Please enter a valid nickname.");
            }
        });

        // Close settings modal
        document.getElementById("close-settings").addEventListener("click", () => {
            document.body.removeChild(settingsModal);
        });
    });

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

            initGame();
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
