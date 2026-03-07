import dotenv from "dotenv";
import connectDB from "../app/dbConfig/dbConfig.js";
import mongoose from "mongoose";

import User from "../app/models/user.js";
import Franchise from "../app/models/franchise.js";
import Delivery from "../app/models/delivery.js";
import Vendor from "../app/models/vendor.js";
import { sendNotificationToUser } from "../app/utils/pushNotificationHelper.js";

dotenv.config();

const FIX_STRATEGIES = {
  missingFirebaseConfig: [
    "Set the FIREBASE_SERVICE_ACCOUNT environment variable with a valid service account JSON string.",
    "Regenerate a Firebase service account key from the Firebase Console if the current one is invalid.",
    "Restart the backend after updating environment variables so Firebase Admin can initialize."
  ],
  noTokens: [
    "Verify the frontend is calling the useFCM hook after a successful login for the affected user type.",
    "Confirm the browser shows a notification permission prompt and that the user clicked 'Allow'.",
    "Check that the /<userType>/fcm-token endpoint is reachable and not returning authorization errors.",
    "Ensure the database model for the user type has the fcmTokens field and it is being updated correctly."
  ],
  sendFailures: [
    "Inspect the failed FCM tokens and remove any that are invalid or expired from the database.",
    "Verify that the Firebase project configuration (projectId, senderId, API key) used on the frontend matches the backend service account.",
    "Check Firebase Cloud Messaging status and quotas in the Firebase Console.",
    "If failures are specific to one platform (web vs mobile), test tokens for that platform separately."
  ],
  dbIssues: [
    "Verify MONGO_URI is set correctly in the backend environment.",
    "Ensure the MongoDB instance is reachable from the backend environment.",
    "Check that the relevant collections (users, franchises, vendors, deliveries) contain active records."
  ]
};

const USER_TYPES = [
  { type: "user", model: User, label: "End User" },
  { type: "franchise", model: Franchise, label: "Franchise" },
  { type: "delivery", model: Delivery, label: "Delivery Partner" },
  { type: "vendor", model: Vendor, label: "Vendor" }
];

async function checkFirebaseConfig() {
  const issues = [];

  const rawEnvConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (rawEnvConfig && rawEnvConfig.trim() !== "undefined") {
    try {
      JSON.parse(rawEnvConfig);
    } catch (err) {
      issues.push(`FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${err.message}`);
    }
  } else if (serviceAccountPath) {
    // Basic existence check for the path; firebaseAdmin will do full parsing
    try {
      await fs.promises.access(serviceAccountPath);
    } catch {
      issues.push(
        `FIREBASE_SERVICE_ACCOUNT_PATH is set (${serviceAccountPath}) but file is not accessible.`
      );
    }
  } else {
    issues.push(
      "Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVICE_ACCOUNT_PATH is configured."
    );
  }

  return {
    ok: issues.length === 0,
    issues,
    fixStrategies: issues.length ? FIX_STRATEGIES.missingFirebaseConfig : []
  };
}

async function testUserTypeNotifications({ type, model, label }) {
  const result = {
    userType: type,
    label,
    status: "pending",
    tests: [],
    overallIssues: [],
    suggestedFixes: []
  };

  try {
    const withTokens = await model
      .find({ fcmTokens: { $exists: true, $ne: [] } })
      .limit(5)
      .lean();

    if (!withTokens.length) {
      const issue = `No ${label} records found with non-empty fcmTokens.`;
      result.status = "failed";
      result.tests.push({
        name: "tokenPresence",
        ok: false,
        details: issue
      });
      result.overallIssues.push(issue);
      result.suggestedFixes.push(...FIX_STRATEGIES.noTokens);
      return result;
    }

    result.tests.push({
      name: "tokenPresence",
      ok: true,
      details: `Found ${withTokens.length} ${label} record(s) with FCM tokens.`
    });

    let totalSuccess = 0;
    let totalFailures = 0;
    const perRecipient = [];

    for (const doc of withTokens) {
      const payload = {
        title: "Test Notification",
        body: `Test push notification for ${label}`,
        data: {
          type: "test",
          userType: type,
          id: String(doc._id),
          link: "/"
        }
      };

      try {
        const response = await sendNotificationToUser(doc._id, payload, type);

        if (!response) {
          totalFailures += 1;
          perRecipient.push({
            id: String(doc._id),
            ok: false,
            details: "sendNotificationToUser returned no response (check server logs for details)."
          });
          continue;
        }

        totalSuccess += response.successCount || 0;
        totalFailures += response.failureCount || 0;

        perRecipient.push({
          id: String(doc._id),
          ok: response.failureCount === 0,
          details: `Success: ${response.successCount}, Failures: ${response.failureCount}`
        });
      } catch (err) {
        totalFailures += 1;
        const errMsg = `Error sending notification to ${label} ${doc._id}: ${err.message}`;
        perRecipient.push({
          id: String(doc._id),
          ok: false,
          details: errMsg
        });
        result.overallIssues.push(errMsg);
      }
    }

    const sendOk = totalFailures === 0 && totalSuccess > 0;

    result.tests.push({
      name: "sendNotification",
      ok: sendOk,
      details: `Aggregate result for ${label}: totalSuccess=${totalSuccess}, totalFailures=${totalFailures}`
    });

    result.tests.push({
      name: "perRecipient",
      ok: perRecipient.every((r) => r.ok),
      details: perRecipient
    });

    if (!sendOk || perRecipient.some((r) => !r.ok)) {
      result.status = "failed";
      result.suggestedFixes.push(...FIX_STRATEGIES.sendFailures);
    } else {
      result.status = "passed";
    }

    return result;
  } catch (err) {
    const msg = `Unexpected error while testing ${label} notifications: ${err.message}`;
    result.status = "failed";
    result.overallIssues.push(msg);
    result.suggestedFixes.push(...FIX_STRATEGIES.dbIssues);
    return result;
  }
}

async function main() {
  console.log("=== Push Notification Health Check ===");

  const firebaseCheck = await checkFirebaseConfig();
  if (!firebaseCheck.ok) {
    console.log("Firebase configuration issues detected:");
    firebaseCheck.issues.forEach((issue) => console.log(`- ${issue}`));
    console.log("\nSuggested fixes:");
    firebaseCheck.fixStrategies.forEach((fix) => console.log(`- ${fix}`));
  } else {
    console.log("Firebase configuration looks OK.");
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.log("\nSuggested fixes:");
    FIX_STRATEGIES.dbIssues.forEach((fix) => console.log(`- ${fix}`));
    process.exit(1);
  }

  const summaries = [];

  for (const def of USER_TYPES) {
    console.log(`\n--- Testing notifications for ${def.label} (${def.type}) ---`);
    const summary = await testUserTypeNotifications(def);
    summaries.push(summary);

    console.log(`Status: ${summary.status.toUpperCase()}`);
    summary.tests.forEach((t) => {
      console.log(
        `  [${t.ok ? "OK" : "FAIL"}] ${t.name} -> ${
          typeof t.details === "string" ? t.details : JSON.stringify(t.details, null, 2)
        }`
      );
    });

    if (summary.overallIssues.length) {
      console.log("  Issues:");
      summary.overallIssues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (summary.suggestedFixes.length) {
      console.log("  Suggested fixes:");
      // De-duplicate suggestions
      [...new Set(summary.suggestedFixes)].forEach((fix) => console.log(`   - ${fix}`));
    }
  }

  const anyFailures = summaries.some((s) => s.status !== "passed");

  console.log("\n=== Overall Result ===");
  if (anyFailures) {
    console.log("Some push notification tests FAILED. Review the issues and suggested fixes above.");
  } else {
    console.log("All push notification tests PASSED for all user types.");
  }

  await mongoose.connection.close();
  process.exit(anyFailures ? 1 : 0);
}

main().catch((err) => {
  console.error("Unexpected error in push notification test script:", err);
  process.exit(1);
});

