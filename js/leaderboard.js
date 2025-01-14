// Example leaderboard data
const leaderboardData = [
    { name: "Name 1", score: 900, icon: "path-to-first-user-icon" },
    { name: "Name 2", score: 850, icon: "path-to-second-user-icon" },
    { name: "Name 3", score: 820, icon: "path-to-third-user-icon" },
    // Add more users as needed
];

// Populate Top 3 Leaders
function populateTopLeaders() {
    const topLeaders = leaderboardData.slice(0, 3);
    const [first, second, third] = topLeaders;

    document.getElementById("first-place").innerHTML = `
        <img src="${first.icon}" alt="First Place" class="leader-icon">
        <p class="leader-name">${first.name}</p>
        <p class="leader-score">Score: ${first.score}</p>
    `;
    document.getElementById("second-place").innerHTML = `
        <img src="${second.icon}" alt="Second Place" class="leader-icon">
        <p class="leader-name">${second.name}</p>
        <p class="leader-score">Score: ${second.score}</p>
    `;
    document.getElementById("third-place").innerHTML = `
        <img src="${third.icon}" alt="Third Place" class="leader-icon">
        <p class="leader-name">${third.name}</p>
        <p class="leader-score">Score: ${third.score}</p>
    `;
}

// Populate Top 100 Scores
function populateTop100() {
    const top100List = document.getElementById("score-list");
    leaderboardData.forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.className = "score-item";
        listItem.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <img src="${entry.icon}" alt="${entry.name}" class="list-icon">
            <span class="name">${entry.name}</span>
            <span class="score">${entry.score}</span>
        `;
        top100List.appendChild(listItem);
    });
}

// Initialize Leaderboard
function initializeLeaderboard() {
    populateTopLeaders();
    populateTop100();
}

// Run the initialization
initializeLeaderboard();
