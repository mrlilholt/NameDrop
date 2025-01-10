// settings.js
export function initializeSettingsModal() {
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

    // Content
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
        <div style="margin: 20px 0;">
            <label for="dark-mode-toggle" style="display: block; font-weight: bold;">Dark Mode:</label>
            <span class="material-icons" id="dark-mode-toggle" style="cursor: pointer;">dark_mode</span>
        </div>
        <div style="margin: 20px 0;">
            <label for="sound-effects-toggle" style="display: block; font-weight: bold;">Sound Effects:</label>
            <span class="material-icons" id="sound-effects-toggle" style="cursor: pointer;">volume_up</span>
        </div>
        <div style="margin: 20px 0;">
            <label for="notifications-toggle" style="display: block; font-weight: bold;">Notifications:</label>
            <span class="material-icons" id="notifications-toggle" style="cursor: pointer;">notifications</span>
        </div>
        <div style="margin: 20px 0;">
            <button id="reset-score" style="
                display: block;
                margin: 0 auto;
                padding: 10px 20px;
                background-color: #ff0000;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Reset Score</button>
        </div>
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

    // Append to body
    document.body.appendChild(settingsModal);

    // Close modal logic
    document.getElementById("close-settings").addEventListener("click", () => {
        document.body.removeChild(settingsModal);
    });

    // Add functionality for nickname saving
    document.getElementById("nickname").addEventListener("change", (event) => {
        const nickname = event.target.value.trim();
        if (nickname) {
            alert(`Nickname saved: ${nickname}`);
            // Future: Save nickname to Firestore or local storage
        }
    });

    // Add functionality for dark mode toggle
    document.getElementById("dark-mode-toggle").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        alert("Dark mode toggled!");
    });

    // Add functionality for sound effects toggle
    document.getElementById("sound-effects-toggle").addEventListener("click", () => {
        alert("Sound effects toggled!");
    });

    // Add functionality for notifications toggle
    document.getElementById("notifications-toggle").addEventListener("click", () => {
        alert("Notifications toggled!");
    });

    // Add functionality for resetting score
    document.getElementById("reset-score").addEventListener("click", () => {
        alert("Score has been reset!");
        // Future: Reset score logic
    });
}
