import { useEffect, useRef, useState } from "react";
import { db } from "../api/firebaseConfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import initialData from "../initialData.json";

const ScriptInitial = () => {
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return; // Prevent second execution
    hasRun.current = true; // Mark as executed
    // Prevent duplicate execution
    console.log("Runnign!!!!!");
    const loadInitialData = async () => {
      const inviteesCollection = collection(db, "invitee");
      // Check if there are any existing invitees
      const snapshot = await getDocs(inviteesCollection);
      if (!snapshot.empty) {
        console.log("Data already exists, skipping initialization.");
        localStorage.setItem("dataInitialized", "true"); // Mark as initialized
        return;
      }

      console.log("Uploading initial data...");
      for (const invitee of initialData) {
        const inviteeRef = doc(inviteesCollection);
        await setDoc(inviteeRef, invitee);
      }

      console.log("Initial data uploaded successfully!");
      localStorage.setItem("dataInitialized", "true"); // Store the flag
    };

    loadInitialData();
  }, []);

  return null;
};

export default ScriptInitial;
