# SIH26041 AR Safety Backend

Node.js + Express + Firebase Admin SDK backend for the AR industrial safety training simulator.

## Run

1. Install Node.js.
2. Run `npm install`.
3. Put the Firebase Web API key in `.env` as `FIREBASE_API_KEY`.
4. Run `npm start`.

Health check:

`GET /api/health`

## API

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/content/modules` — serves `content/ar_safety_training_modules.json` (no auth; not user data)
- POST `/api/sessions` — create/upsert a training session (session-level logging_schema fields)
- PATCH `/api/sessions/:id` — record session end + final module_sequence
- POST `/api/results` — log one per-question event (per_question_event_fields from the JSON's logging_schema)
- GET `/api/results` (trainer) — all raw per-question events
- GET `/api/results/user/:userId` — that trainee's own results, grouped into per-module-attempt summaries (score/maxScore/percentage/rating + the raw events)
- GET `/api/dashboard/summary` (trainer)

`module_id`/`question_id` on `/api/results` are validated against the live content JSON (`backend/utils/content.js`) — there is no hardcoded scenario allowlist.

Protected routes use:

`Authorization: Bearer <Firebase ID token>`

## Security

`.env` contains secrets and is ignored by Git. Never commit or share it publicly.
