const { admin, db } = require("../config/firebase");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required"
      });
    }

    const token = header.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

async function requireTrainer(req, res, next) {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        message: "User profile not found"
      });
    }

    const role = (userDoc.data().role || "").trim().toLowerCase();
    if (role !== "trainer" && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Trainer access required"
      });
    }

    req.userProfile = userDoc.data();
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not verify user role"
    });
  }
}

module.exports = { requireAuth, requireTrainer };
