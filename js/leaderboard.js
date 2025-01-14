import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyDiHaU6ajRkeo-YFiErXsZ7pu3LuvtBGZ0",
    authDomain: "namedrop-16d4b.firebaseapp.com",
    projectId: "namedrop-16d4b",
    storageBucket: "namedrop-16d4b.appspot.com",
    messagingSenderId: "373402334408",
    appId: "1:373402334408:web:1f1c36d48863eed50f21fd",
    measurementId: "G-5DN86C549G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Get leaderboard collection and order by score (descending)
const leaderboardRef = collection(db, "leaderboard"); // Assuming "leaderboard" is the Firestore collection name
const leaderboardQuery = query(leaderboardRef, orderBy("score", "desc"), limit(100));

// Real-time listener for the leaderboard
onSnapshot(leaderboardQuery, (snapshot) => {
    const leaderboardData = [];
    snapshot.forEach((doc) => {
        leaderboardData.push({ id: doc.id, ...doc.data() });
    });
    updateLeaderboard(leaderboardData);
});

// Example leaderboard data
const leaderboardData = [
    { name: "Name 1", score: 900, icon: "path-to-first-user-icon" },
    { name: "Name 2", score: 850, icon: "path-to-second-user-icon" },
    { name: "Name 3", score: 820, icon: "path-to-third-user-icon" },
    // Add more users as needed
];
// Function to update the leaderboard UI
function updateLeaderboard(data) {
    const topThreeContainer = document.getElementById("top-three");
    const leaderboardList = document.getElementById("leaderboard-list");

    // Clear existing content
    topThreeContainer.innerHTML = "";
    leaderboardList.innerHTML = "";

    // Display top three users
    data.slice(0, 3).forEach((user, index) => {
        const position = ["🥇", "🥈", "🥉"][index]; // Emoji for top three positions
        topThreeContainer.innerHTML += `
            <div class="top-user">
                <img src="${user.icon || 'default-icon-url.png'}" alt="${user.name}" class="user-icon" />
                <div class="user-info">
                    <span class="user-name">${user.name || 'Anonymous'}</span>
                    <span class="user-score">${position} ${user.score}</span>
                </div>
            </div>
        `;
    });

    // Display remaining users (4th to 100th)
    data.slice(3).forEach((user, index) => {
        leaderboardList.innerHTML += `
            <li>
                <span>${index + 4}. ${user.name || 'Anonymous'}</span>
                <span>${user.score}</span>
            </li>
        `;
    });
}

// Initialize Leaderboard
function initializeLeaderboard() {
    populateTopLeaders();
    populateTop100();
}

// Run the initialization
initializeLeaderboard();
