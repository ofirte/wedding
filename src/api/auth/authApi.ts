import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

// User interface
export interface WeddingUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  weddingId?: string;
}

// Sign-up new user
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<WeddingUser> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update user profile with displayName if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create a user document without wedding ID
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
    });

    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (
  email: string,
  password: string
): Promise<WeddingUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user data including weddingId
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data() as WeddingUser;

    return userData;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<WeddingUser> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user data with wedding ID
export const getCurrentUserData = async (): Promise<WeddingUser | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.data() as WeddingUser;
  } catch (error) {
    console.error("Error getting current user data:", error);
    throw error;
  }
};

// Create a new wedding for a user
export const createWedding = async (
  userId: string,
  weddingName: string,
  brideName?: string,
  groomName?: string,
  weddingDate?: Date
): Promise<string> => {
  try {
    // Create a wedding document
    const weddingRef = await addDoc(collection(db, "weddings"), {
      name: weddingName,
      date: weddingDate || null,
      createdAt: new Date(),
      userIds: [userId],
      brideName: brideName || "",
      groomName: groomName || "",
    });

    // Update user document with weddingId
    await setDoc(
      doc(db, "users", userId),
      { weddingId: weddingRef.id },
      { merge: true }
    );

    return weddingRef.id;
  } catch (error) {
    console.error("Error creating wedding:", error);
    throw error;
  }
};

// Helper to get wedding ID for current user
export const getCurrentUserWeddingId = async (): Promise<string | null> => {
  try {
    const userData = await getCurrentUserData();
    return userData?.weddingId || null;
  } catch (error) {
    console.error("Error getting wedding ID:", error);
    throw error;
  }
};

// Authentication state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
