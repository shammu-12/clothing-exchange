# Rewear — Clothing Exchange & Swap Marketplace

Rewear helps people list, discover, and swap pre-loved clothing. The repository contains a React/Vite client and an Express/MongoDB API.

## Local development

1. Install Node.js and make sure MongoDB is running locally or provide a MongoDB connection URI.
2. In `backend/.env`, set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and optionally `PORT`. A template is in `backend/.env.example`.
3. In a terminal, start the API:

   ```powershell
   cd backend
   npm install
   npm start
   ```

4. In another terminal, start the client:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open the local address printed by Vite (by default `http://localhost:5173`). The development server proxies `/api` to the API on port `5000`.

To use a separately hosted API, set `VITE_API_URL` in the frontend environment to the API's `/api` base URL. Do not commit `.env` files or share their values.

## Main routes

- `/browse` — discover available clothing and filter by category.
- `/nearby` — search available clothing by a city or neighbourhood, or opt in to approximate browser location for closest-first results within a 5–100 km radius. Only listings with their own approximate map point appear in radius matches; listings without one remain searchable by city or neighbourhood.
- `/community` — share and browse swap stories, repair and care tips, slow-fashion ideas, and live community impact counts.
- `/clothing/:id` — item information and swap request.
- `/register` and `/login` — account access.
- `/dashboard` — member overview.
- `/add-clothing`, `/my-listings`, `/edit-listing/:id` — listing management.
- `/swap-requests` and `/chat/:swapId` — proposed item-for-item exchanges, value comparisons, and conversations.
- Accepted swap chats include local/remote delivery planning. Participants can share their own courier and tracking details; carrier booking and automatic tracking updates require a configured provider API.
- `/profile` — profile settings.
- `/admin` — administrator overview, member suspension/restoration, swap activity, listing moderation, dispute resolution, and downloadable CSV analytics. Members can report listings, community posts, or a swap from its private chat.

For distance matching, members can attach an approximate map point while creating or editing a listing. Browser geolocation is requested only after a member chooses the location action; the API rounds coordinates to two decimal places before storing them.

## Production build

Run `npm run build` from `frontend`. Render service definitions are in `render.yaml`; configure the API/database secrets and the deployed API URL in the Render dashboard before deployment.

The client is configured as an installable Progressive Web App. Production builds register a service worker and cache the app shell and static assets for offline opening; live listings, account actions, chat, and other API features still need an internet connection. On supported browsers, use **Install app** when it appears, or the browser's **Add to Home Screen** option.

## Native app scaffolding (outside Phase 1)

Capacitor project files are present as future-work scaffolding. A signed native Android or iOS app is not a Phase 1 deliverable; the responsive web app/PWA is the mobile experience for this submission.

iOS signing and building require macOS with Xcode.

## Public deployment prerequisites

- Connect this folder to a GitHub repository so Render can build the Blueprint in `render.yaml`.
- Use a MongoDB database that is reachable from Render. The local `.env` database at `127.0.0.1` is only reachable on this computer and cannot serve the hosted API.
- Enter the production `MONGO_URI` in the Render environment; never commit or paste database credentials into source files.
- Render's Blueprint wires the web and API hostnames for the client API base URL and CORS. The public site URL is assigned by Render after the services deploy.
- For durable uploaded photos in production, configure persistent or object storage. Image URLs can be used without that storage setup.

See [PRD.md](PRD.md) for product requirements, scope, user flows, data, and delivery notes.

## Smart matches and mobile

The browse page can rank available pieces against a signed-in member's listed wardrobe using size, category, type, colour, estimated value, and available distance. Matching happens in the browser using marketplace data already loaded for browsing; no wardrobe details are sent to a third-party AI service. This is a transparent local matching feature, not a generative AI service. The installable PWA provides the mobile-friendly app experience; it is not a separate native Android/iOS package.

Swaps are non-monetary. Members arrange any delivery and costs between themselves; the platform does not collect payments or book couriers.
