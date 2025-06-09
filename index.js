// backend/index.js
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// It's good practice to add a try/catch for the service account key loading
try {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-key.json')),
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("ERROR: Failed to initialize Firebase Admin SDK. Check 'firebase-key.json'.", error);
  // Optionally, exit the process if Firebase initialization is critical
  // process.exit(1);
}


const db = admin.firestore();

// Route for creating a new signup
// Changed endpoint to '/api/signups' to match common frontend convention
app.post('/api/signups', async (req, res) => { // Changed from '/signups'
  const { name, email } = req.body;

  // Basic validation: ensure name and email are provided
  if (!name || !email) {
    return res.status(400).send({ error: 'Name and email are required.' });
  }

  try {
    const docRef = await db.collection('signups').add({
      name,
      email,
      createdAt: admin.firestore.Timestamp.now()
    });
    console.log(`New signup created with ID: ${docRef.id}`); // Log success
    res.status(200).send({ id: docRef.id, message: "Signup successful!" }); // Added message for clarity
  } catch (error) {
    console.error("Error creating signup:", error); // Log the actual error
    res.status(500).send({ error: error.message });
  }
});

// Route for getting all signups
// Changed endpoint to '/api/signups' to match common frontend convention
app.get('/api/signups', async (req, res) => { // Changed from '/signups'
  try {
    const snapshot = await db.collection('signups').orderBy('createdAt', 'desc').get();
    const signups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Fetched ${signups.length} signups.`); // Log success
    res.status(200).send(signups);
  } catch (error) {
    console.error("Error fetching signups:", error); // Log the actual error
    res.status(500).send({ error: error.message });
  }
});

// This is necessary to actually start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/signups  (To create a signup)`);
  console.log(`  GET  http://localhost:${PORT}/api/signups  (To get all signups)`);
});