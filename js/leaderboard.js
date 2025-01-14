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

// Real-time listener for the leaderboard
const leaderboardRef = collection(db, "leaderboard");
const leaderboardQuery = query(leaderboardRef, orderBy("score", "desc"), limit(100));

onSnapshot(leaderboardQuery, (snapshot) => {
    const leaderboardData = [];
    snapshot.forEach((doc) => {
        leaderboardData.push({ id: doc.id, ...doc.data() });
    });
    updateLeaderboard(leaderboardData);
}, (error) => {
    console.error("Error fetching leaderboard data:", error);
});

function updateLeaderboard(data) {
    const topThreeContainer = document.getElementById("top-three");
    const leaderboardList = document.getElementById("leaderboard-list");

    // Clear existing content
    topThreeContainer.innerHTML = "";
    leaderboardList.innerHTML = "";

    // Display top three users
    data.slice(0, 3).forEach((user, index) => {
        const position = ["🥇", "🥈", "🥉"][index];
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

// Initialize leaderboard
document.addEventListener("DOMContentLoaded", initializeLeaderboard);
function initializeLeaderboard() {
    console.log("Leaderboard initialized");
}
