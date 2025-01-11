// upload_images.js
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const db = getFirestore();

export function initializeUploadModal() {
    const uploadModal = document.createElement("div");
    uploadModal.id = "upload-modal";
    uploadModal.style.position = "fixed";
    uploadModal.style.top = "50%";
    uploadModal.style.left = "50%";
    uploadModal.style.transform = "translate(-50%, -50%)";
    uploadModal.style.width = "400px";
    uploadModal.style.padding = "20px";
    uploadModal.style.backgroundColor = "#fff";
    uploadModal.style.borderRadius = "10px";
    uploadModal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    uploadModal.style.zIndex = "1000";

    uploadModal.innerHTML = `
        <h2 style="text-align: center;">Upload an Image</h2>
        <form id="upload-form">
            <label for="file-input">Select an Image:</label>
            <input type="file" id="file-input" accept="image/*" required />
            <br />
            <label for="first-name">First Name:</label>
            <input type="text" id="first-name" required />
            <br />
            <label for="last-name">Last Name:</label>
            <input type="text" id="last-name" required />
            <br />
            <button type="submit" style="
                display: block;
                margin: 10px auto;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Upload</button>
        </form>
        <button id="close-upload" style="
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

    document.body.appendChild(uploadModal);

    // Close modal
    document.getElementById("close-upload").addEventListener("click", () => {
        document.body.removeChild(uploadModal);
    });

    // Handle image upload
    document.getElementById("upload-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("file-input");
        const firstNameInput = document.getElementById("first-name");
        const lastNameInput = document.getElementById("last-name");

        const file = fileInput.files[0];
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();

        if (!file || !firstName || !lastName) {
            alert("Please fill out all fields and select an image.");
            return;
        }

        try {
            // Upload image to Cloudinary
            const imageUrl = await uploadImageToCloudinary(file);

            // Save metadata to Firestore
            await saveMetadataToFirestore(imageUrl, firstName, lastName);

            alert("Image and metadata saved successfully!");
        } catch (error) {
            console.error("Error uploading image or saving metadata:", error);
            alert("Failed to upload image or save metadata.");
        }
    });
}

// Cloudinary Upload API
async function uploadImageToCloudinary(file) {
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/mrlilholt/image/upload";
    const uploadPreset = "NameDrop";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Cloudinary upload failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.secure_url; // Cloudinary URL
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw new Error("Image upload failed");
    }
}

// Save metadata to Firestore
async function saveMetadataToFirestore(imageUrl, firstName, lastName) {
    try {
        const id = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`;
        const docRef = doc(db, "images", id);
        await setDoc(docRef, { imageUrl, firstName, lastName });
        console.log("Metadata saved successfully:", id);
    } catch (error) {
        console.error("Error saving metadata to Firestore:", error);
        throw new Error("Failed to save metadata");
    }
}
