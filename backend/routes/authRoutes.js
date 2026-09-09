const express = require("express");
const { admin, db } = require("../config/firebase");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, organization, role } = req.body;

    if (!email || !password || !name || !organization) {
      return res.status(400).json({
        success: false,
        message: "email, password, name and organization are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const userRole = role || "trainee";

    if (!["trainee", "trainer"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: userRole,
      organization,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: userRecord.uid,
        email,
        name,
        role: userRole
      }
    });
  } catch (error) {
    console.error(error);

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (!process.env.FIREBASE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "FIREBASE_API_KEY is not configured"
      });
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const userDoc = await db.collection("users").doc(data.localId).get();
    const profile = userDoc.exists ? userDoc.data() : {};

    res.json({
      success: true,
      message: "Login successful",
      user: {
        uid: data.localId,
        email: data.email,
        name: profile.name || "",
        role: profile.role || "trainee"
      },
      token: data.idToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

module.exports = router;
