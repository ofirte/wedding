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
import { auth } from "../firebaseConfig";
import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";

export const authApi = createGeneralCollectionAPI<WeddingUser>("users");
// User interface
export interface WeddingUser {
  id?: string;
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: Date;
  photoURL?: string;
  weddingId?: string;
  weddingIds?: string[];
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
    await authApi.createWithId(user.uid, {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || undefined,
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
    const userData = await authApi.fetchById(user.uid);

    return userData as WeddingUser;
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
    const userData = await authApi.fetchById(user.uid);

    if (!userData) {
      await authApi.create({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
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

    const userData = await authApi.fetchById(user.uid);
    return userData;
  } catch (error) {
    console.error("Error getting current user data:", error);
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
