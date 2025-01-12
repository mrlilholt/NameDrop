// Function to initialize the top bar with default values
export function initializeTopBar() {
    const topBar = document.getElementById("top-bar");
    if (!topBar) {
        console.error("Top bar element not found!");
        return;
    }

    // Set default values for the score and streak
    const topScoreElement = document.getElementById("score-value");
    const topStreakElement = document.getElementById("streak-value");

    if (topScoreElement) topScoreElement.textContent = 0;
    if (topStreakElement) topStreakElement.textContent = 0;
}

// Function to update the top bar with the current score and streak
export function updateTopBar(score, streak) {
    const topScoreElement = document.getElementById("score-value");
    const topStreakElement = document.getElementById("streak-value");

    if (topScoreElement) {
        topScoreElement.textContent = score;
    } else {
        console.warn("Top score element not found!");
    }

    if (topStreakElement) {
        topStreakElement.textContent = streak;
    } else {
        console.warn("Top streak element not found!");
    }
}
