<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0168debb-a120-44f2-ad0c-aba2b445b7ed

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Firebase note:
- Keep `firebase-applet-config.json` in the client app.
- Do not place Firebase service account JSON in `src/` or commit it to this repo.
- If you need admin access, keep the service account on a server or in secret storage only.

## Mobile App Structure

This project is set up to ship to both Android and iOS through Capacitor.

1. Build the web app:
   `npm run build:web`
2. Sync the native projects:
   `npm run cap:sync`
3. Open the native projects:
   `npm run cap:open:android`
   `npm run cap:open:ios`

Notes:
- The native folders are generated under `android/` and `ios/`.
- Mobile Google sign-in now uses the Capacitor Firebase Authentication plugin on iOS/Android and the Firebase JS SDK popup flow on web.
- Native Google sign-in still requires the platform Firebase config files and provider setup from Firebase Console:
  - `ios/App/GoogleService-Info.plist`
  - `android/app/google-services.json`
  - SHA-1 fingerprint on Android
  - URL scheme from `REVERSED_CLIENT_ID` on iOS

## MVP Structure

- `src/screens/`
  - screen-level flows for login, home, logs, analysis, goals, progress, and drink search
- `src/components/`
  - reusable layout, card, search, filter, and empty-state blocks
- `src/types/`
  - domain models for drinks, logs, goals, and navigation state
- `src/data/`
  - predefined drink master seed data
- `src/state/`
  - local MVP state management for logs and goals
- Navigation flow:
  - login -> home dashboard -> add log -> log list -> analysis -> goal setting -> progress -> drink search
