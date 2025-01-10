// userinfo.js
export function initializeProfileModal() {
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

    // Content
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
            "></div>
            <p id="profile-name"><strong>Name:</strong> Loading...</p>
            <p id="profile-email"><strong>Email:</strong> Loading...</p>
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

    // Append to body
    document.body.appendChild(profileModal);

    // Close modal logic
    document.getElementById("close-profile").addEventListener("click", () => {
        document.body.removeChild(profileModal);
    });

    // Fetch and display user info if available (this assumes auth is globally accessible)
    if (window.auth && window.auth.currentUser) {
        const user = window.auth.currentUser;
        const profilePicture = document.getElementById("profile-picture");
        const profileName = document.getElementById("profile-name");
        const profileEmail = document.getElementById("profile-email");

        if (user.photoURL) {
            profilePicture.style.backgroundImage = `url(${user.photoURL})`;
        }
        profileName.innerHTML = `<strong>Name:</strong> ${user.displayName || "Unknown"}`;
        profileEmail.innerHTML = `<strong>Email:</strong> ${user.email || "Unknown"}`;
    }
}
