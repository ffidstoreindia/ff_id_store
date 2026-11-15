FF ID STORE — FIREBASE VERSION (ANDROID-FRIENDLY)
=================================================

WHAT THIS VERSION DOES
- Responsive black/red website.
- Live shared content powered by Firebase Cloud Firestore.
- Admin sign-in using Firebase Authentication (email/password).
- Admin can update home text, WhatsApp/Instagram/Telegram links and contact number.
- Admin can publish/delete store posts (Account showcase / Top-up information / Announcements).
- Admin can add/delete gallery images using public HTTPS image URLs.
- No checkout, payment collection or storage of game credentials.

IMPORTANT SAFETY / TERMS
- Do not publish passwords, OTPs, recovery codes, payment PINs or private account details.
- Game account transfers may breach the game's terms; check current official rules before publishing such posts.
- Use only official/authorized top-up provider information/links.
- The website does not process payments and does not verify sellers or offers.

PART A — CREATE FIREBASE PROJECT (PHONE)
1. Open https://console.firebase.google.com/ in Chrome and sign in.
2. Create a project named ff-id-store (or another unique name).
3. Open Project Overview, tap the Web icon </>, register an app named FF ID STORE.
4. Firebase shows a web config object. Copy apiKey, authDomain, projectId and appId.
5. In the website files, open firebase-config.js and replace the four PASTE... values.
   Example shape:
   export const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     appId: "your-app-id"
   };
   Do not paste a service-account/private key here. Web config is designed to be public.

PART B — ENABLE AUTHENTICATION
1. Firebase Console → Build → Authentication → Get started.
2. Sign-in method → Email/Password → Enable → Save.
3. Authentication → Users → Add user.
4. Create your admin email and a strong, unique password. Do not share it.
5. Open the new user and copy its UID.

PART C — CREATE FIRESTORE + RULES
1. Firebase Console → Build → Firestore Database → Create database.
2. Choose production mode and a nearby location; the database location cannot easily be changed later.
3. Open the Rules tab.
4. Replace REPLACE_WITH_ADMIN_UID in firestore.rules with the admin UID you copied.
5. Publish the rules.
6. These rules allow public reading, but only the one admin UID can create/update/delete site content.
7. Do not use open rules such as allow read, write: if true.

PART D — HOST FREE FROM ANDROID
Option 1: GitHub Pages
1. Extract the ZIP on your Android phone.
2. Create a public GitHub repository named ff-id-store.
3. Upload index.html, style.css, app.js, firebase-config.js and (optionally) README-ANDROID.txt.
4. Also keep firestore.rules as a local reference; it is pasted into Firebase Console, not served by the site.
5. Repository Settings → Pages → Deploy from a branch → main → /(root) → Save.
6. Wait for the published URL, normally https://YOUR-USERNAME.github.io/ff-id-store/
7. In Firebase Console → Authentication → Settings → Authorized domains, add YOUR-USERNAME.github.io if it is not already present.

Option 2: Firebase Hosting
Firebase Hosting is also free within its no-cost usage limits and is designed to host static sites. It normally requires Firebase CLI, which is not convenient directly on Android. GitHub Pages is the simpler phone-only route.

PART E — USE THE ADMIN PANEL
1. Open the published website.
2. Tap ADMIN.
3. Sign in with the Firebase admin email/password created in Part B.
4. Site links tab: add WhatsApp group invite, Instagram group/profile, Telegram group, WhatsApp contact number with country code (India format starts 91), then Save site links.
5. Store posts tab: choose Account showcase, Top-up information or Announcement. Add a title and description. An official info URL is optional. Publish.
6. Gallery tab: add an HTTPS image URL and caption.
7. Changes are saved in Firestore and will appear to all visitors.

ANDROID EDITING NOTES
- Use a text/code editor app that can edit .html, .js, .css and .rules files.
- GitHub mobile website can upload files through Add file → Upload files.
- After changing Firebase config or code, upload/commit the updated files and reload the site.
- Admin content edits happen inside the website; you do not need to re-upload code for every announcement.

TROUBLESHOOTING
- "auth/unauthorized-domain": add your published host domain in Firebase Authentication → Settings → Authorized domains.
- "Missing or insufficient permissions": check the Firestore rules UID exactly matches the admin user's UID, then Publish.
- "Could not load posts": make sure Firestore Database exists and rules are published.
- "Firebase is not configured": check firebase-config.js has real web app values and no PASTE... placeholders.
- If sign-in works but editor actions fail, verify the admin UID in rules.

FILES
index.html             Website layout
style.css              Black/red responsive styling
app.js                 Firebase app + admin dashboard logic
firebase-config.js     Public Firebase web app configuration placeholders
firestore.rules        Firestore access control rules
README-ANDROID.txt     This guide
