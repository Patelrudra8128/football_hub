import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, Firestore, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if critical variables exist, otherwise fall back to local storage mock
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase client:", error);
  }
}

export interface LuckyDrawUser {
  name: string;
  email: string;
  phone: string;
  favoriteTeam: string;
  address?: string;
}

export async function enrollInLuckyDraw(userData: LuckyDrawUser) {
  if (db) {
    try {
      // Check if email already enrolled in Firestore
      const q = query(
        collection(db, "lucky_draw_entries"),
        where("email", "==", userData.email.toLowerCase().trim())
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("This email is already enrolled in the lucky draw!");
      }

      const docRef = await addDoc(collection(db, "lucky_draw_entries"), {
        ...userData,
        email: userData.email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id, isMock: false };
    } catch (error) {
      console.error("Firebase Firestore Error: ", error);
      throw error;
    }
  } else {
    // Fallback Mock using LocalStorage
    console.warn("Firebase not configured. Saving entry locally as mock fallback.");
    
    // Simulate network latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const storageKey = "lucky_draw_entries";
    const entries = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
    // Check if email already enrolled locally
    const alreadyEnrolled = entries.some((e: { email: string }) => e.email.toLowerCase() === userData.email.toLowerCase());
    if (alreadyEnrolled) {
      throw new Error("This email is already enrolled in the lucky draw!");
    }

    const ticketId = "LD-" + Math.floor(100000 + Math.random() * 900000);
    const newEntry = {
      id: ticketId,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    entries.push(newEntry);
    localStorage.setItem(storageKey, JSON.stringify(entries));
    
    // Set a flag that this device is enrolled
    localStorage.setItem("lucky_draw_enrolled_ticket", ticketId);
    
    return { success: true, id: ticketId, isMock: true };
  }
}
