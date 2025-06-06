/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.autoReview = functions.firestore
  .document("projects/{projectId}")
  .onCreate(async (snap, context) => {
    const project = snap.data();
    const code = project.code;
    const suggestions = [];

    if (code.includes("var ")) {
      suggestions.push("Evită folosirea lui 'var'.");
    }
    if (code.includes("==") && !code.includes("===")) {
      suggestions.push("Folosește '===' în loc de '=='.");
    }

    await admin.firestore().collection("reviews").add({
      projectId: context.params.projectId,
      generatedBy: "auto",
      content: suggestions,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });
