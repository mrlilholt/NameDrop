// upload_images.js
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const db = getFirestore();

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

// Handle image upload
async function handleImageUpload(event) {
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
        const imageUrl = await uploadImageToCloudinary(file);
        await saveMetadataToFirestore(imageUrl, firstName, lastName);
        alert("Image and metadata saved successfully!");
    } catch (error) {
        console.error("Error during upload and save process:", error);
        alert("Failed to upload image or save metadata.");
    }
}

// Attach event listener to form
const uploadForm = document.getElementById("upload-form");
if (uploadForm) {
    uploadForm.addEventListener("submit", handleImageUpload);
}
