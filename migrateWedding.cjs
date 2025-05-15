const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
  getDoc,
} = require("firebase/firestore");

// Get the Firebase configuration
const devFirebaseConfig = {
  apiKey: "AIzaSyA2exk9CEMRDrm1kLCT_2Va0Yyo3Og34Xk",
  authDomain: "wedding-c89a1.firebaseapp.com",
  projectId: "wedding-c89a1",
  storageBucket: "wedding-c89a1.firebasestorage.app",
  messagingSenderId: "206786649581",
  appId: "1:206786649581:web:1d3ad0e2f96d483f975be4",
  measurementId: "G-RTW3LZZ6HW",
};

// Initialize Firebase
const app = initializeApp(devFirebaseConfig);
const db = getFirestore(app);

const TARGET_WEDDING_ID = "vuzRQji2SieDGatQNz0N";
const COLLECTIONS_TO_MIGRATE = [];

/**
 * Migrates a single collection to the wedding subcollection
 */
async function migrateCollection(collectionName) {
  console.log(`Migrating collection: ${collectionName}`);

  try {
    // Source collection (top-level)
    const sourceCollectionRef = collection(db, collectionName);
    const sourceSnapshot = await getDocs(sourceCollectionRef);

    if (sourceSnapshot.empty) {
      console.log(
        `No documents found in ${collectionName} collection. Skipping.`
      );
      return;
    }

    // Target collection (under wedding)
    const targetCollectionPath = `weddings/${TARGET_WEDDING_ID}/${collectionName}`;

    console.log(
      `Found ${sourceSnapshot.size} documents to migrate in ${collectionName}`
    );

    // Use batched writes for better performance and atomicity
    // Firestore batches can contain up to 500 operations
    const MAX_BATCH_SIZE = 400;
    let batch = writeBatch(db);
    let operationCount = 0;

    for (const docSnapshot of sourceSnapshot.docs) {
      const data = docSnapshot.data();
      const targetDocRef = doc(db, targetCollectionPath, docSnapshot.id);

      // Add the document to the batch
      batch.set(targetDocRef, data);
      operationCount++;

      // If we've reached the batch limit, commit and create a new batch
      if (operationCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch of ${operationCount} documents`);
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${operationCount} documents`);
    }

    console.log(
      `Successfully migrated ${sourceSnapshot.size} documents from ${collectionName}`
    );
  } catch (error) {
    console.error(`Error migrating collection ${collectionName}:`, error);
    throw error; // Re-throw to handle in the main function
  }
}

/**
 * Migrates data from top-level collections to a wedding-specific subcollection
 */
async function migrateToWedding() {
  console.log(`Starting migration to wedding ID: ${TARGET_WEDDING_ID}`);

  try {
    // First check if the wedding document exists
    const weddingDocRef = doc(db, "weddings", TARGET_WEDDING_ID);
    const weddingDoc = await getDoc(weddingDocRef);

    if (!weddingDoc.exists()) {
      console.log(`Creating wedding document with ID: ${TARGET_WEDDING_ID}`);
      await setDoc(weddingDocRef, {
        createdAt: new Date(),
        name: "Migrated Wedding",
        date: null,
      });
    }

    // Migrate each collection
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      await migrateCollection(collectionName);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Execute the migration
console.log("Starting wedding data migration...");
migrateToWedding()
  .then(() => {
    console.log("Migration process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed with error:", error);
    process.exit(1);
  });
