// Function to update the top bar with the current score and streak
export function updateTopBar(score, streak) {
    const topScoreElement = document.getElementById("score-value");
    const topStreakElement = document.getElementById("streak-value");

    // Check if the elements exist and update their text content
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


    // Update score and streak in the top bar
    function updateTopBar(score, streak) {
        scoreElement.textContent = score;
        streakElement.textContent = streak;
    }

    // Expose the updateTopBar function
    return {
        updateTopBar,
    };
}
