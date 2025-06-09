// backend/index.js
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
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
app.post('/api/signups', async (req, res) => { // Endpoint is /api/signups
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send({ error: 'Name and email are required.' });
  }

  try {
    const docRef = await db.collection('signups').add({
      name,
      email,
      createdAt: admin.firestore.Timestamp.now()
    });
    console.log(`New signup created with ID: ${docRef.id}`);
    res.status(200).send({ id: docRef.id, message: "Signup successful!" });
  } catch (error) {
    console.error("Error creating signup:", error);
    res.status(500).send({ error: error.message });
  }
});

// Route for getting all signups
app.get('/api/signups', async (req, res) => { // Endpoint is /api/signups
  try {
    const snapshot = await db.collection('signups').orderBy('createdAt', 'desc').get();
    const signups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Fetched ${signups.length} signups.`);
    res.status(200).send(signups);
  } catch (error) {
    console.error("Error fetching signups:", error);
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