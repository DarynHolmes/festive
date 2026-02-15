# Live Deployment

## Goal

Deploy the Secretary app to Vercel so the interview panel can interact with the prototype without running it locally.

## Tasks

- [ ] Build the app (`quasar build`) and verify the output works with the production PocketBase instance on PocketHost
- [ ] Configure Vercel project for the `clients/secretary-app` subdirectory
- [ ] Set `VITE_POCKETBASE_URL` environment variable in Vercel to the PocketHost production URL
- [ ] Verify hash-based routing works on Vercel (no server-side rewrites needed)
- [ ] Seed the production PocketBase instance with the 4-lodge dataset
- [ ] Smoke-test the live site: lodge dashboard loads, dining toggle works, realtime sync works across two tabs

## Notes

- The backend is already hosted on PocketHost — this task is front-end deployment only
- Hash-based routing (`createWebHashHistory`) means no Vercel rewrite rules are needed
- PocketBase collection rules are currently open (no auth) — acceptable for the prototype
