import { getFirestore, doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const db = getFirestore();

// Save score to Firestore
export async function saveScore(userId, score) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { score });
        console.log("Score updated successfully:", score);
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

// Fetch score from Firestore
export async function fetchScore(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.score || 0; // Default to 0 if no score exists
        } else {
            // If user document doesn't exist, create it with a score of 0
            await setDoc(userRef, { score: 0 });
            return 0;
        }
    } catch (error) {
        console.error("Error fetching score:", error);
        return 0; // Return default score on error
    }
}

// Increment score
export function incrementScore(currentScore, incrementBy) {
    return currentScore + incrementBy;
}

// Decrement score
export function decrementScore(currentScore, decrementBy) {
    return Math.max(0, currentScore - decrementBy); // Ensure score doesn't go below 0
}
