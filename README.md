# LWSN Flight Announcer — Web (Supabase)

✅ Real login, runway-in-use, NOTAMs, **Special Announcements (yellow banner)**, flights (single/multi), and **WeatherLink AWOS (Stenkovec)** scraping.

## Quick start
1) Create a Supabase project and run `supabase/schema.sql` in SQL Editor.
2) In Supabase Auth, create your admin users, then set `is_admin=true` in `profiles` (Table Editor).
3) Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
WEATHERLINK_STENKOVEC=https://www.weatherlink.com/embeddablePage/show/b501bf3e4a2b4a2ca6a92c03465aea4c/slim
```
(Do not put SERVICE_ROLE in client env; keep it server-only if you add admin scripts.)

4) Run locally:
```
npm install
npm run dev
```

5) Deploy to Vercel: import repo and add the same env vars.
