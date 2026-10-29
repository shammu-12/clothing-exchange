# Rewear — Clothing Exchange & Swap Marketplace

## Product summary

Rewear is a responsive web marketplace where people give good clothing a second life by listing it, discovering available pieces, and arranging direct swaps. The product prioritizes local exchange, clear item details, thoughtful conversations, privacy, and reuse. Money is not exchanged through the platform.

## Context and problem

Fast fashion has increased clothing consumption, textile waste, and environmental impact. Many people have wearable clothes they no longer use but find it difficult to sell, donate, or find a suitable exchange. Traditional commerce platforms are built around buying and selling; Rewear provides a dedicated place to list reusable pieces, find potential matches, and coordinate swaps.

## Goals

- Make it straightforward to offer, discover, and exchange pre-loved clothing.
- Let members assess a listing using its category, brand, size, condition, photos, description, and location.
- Support a transparent swap process: request, accept or decline, discuss details, and record completion.
- Encourage local exchange and keep members' contact details private by default.
- Give administrators tools to monitor platform health and remove inappropriate listings.

## Users

- **Member:** creates a profile, lists clothing, browses and filters pieces, requests a swap, chats with the other member, and tracks the exchange.
- **Administrator:** reviews platform activity and listing status, and moderates listings.

## Scope

### Phase 1 — included

- Responsive web experience for desktop, tablet, and mobile.
- Account registration and login using signed authentication tokens and hashed passwords.
- Member profile with name and location.
- Clothing listing creation with item details, image URL or photo upload, and a suggested swap value.
- Listing browsing, item detail, keyword search, category filter, and location filter.
- Swap request creation, incoming and sent request lists, accept or decline, and status history.
- Private, swap-specific messaging between the two participants.
- Accepted swaps can be arranged as local hand-offs or remote delivery. Each participant can record their courier, tracking reference/link, and manually updated parcel status.
- Public sustainable-fashion community feed with swap stories, care and repair tips, slow-fashion discussions, reactions, and live marketplace impact counts.
- Dashboard with real listing and exchange counts.
- Administrator overview, member suspension/restoration, swap activity review, listing moderation, dispute/report resolution, and downloadable CSV analytics.
- Render deployment configuration for a separately configured API and static web client.

### Phase 1 — excluded

- Payment processing or cash balancing.
- AI-driven recommendations or automated condition verification.
- Augmented-reality try-on.
- Native iOS or Android application.
- Carrier API booking, label purchase, payment, and automatic live tracking updates (the first release stores participant-entered tracking details and links).
- Public contact details or exact/continuous location tracking. Members may opt in to a rounded neighbourhood-level map point for distance matching.

## Functional requirements

### Accounts and profile

1. A visitor can register with a name, valid email address, and password of at least eight characters.
2. The system rejects missing, invalid, or duplicate account details and returns useful validation feedback.
3. A member can sign in, view and update their name and location, and sign out.
4. Protected pages and API operations require a valid access token. Administrator APIs also require the administrator role.

### Listings and discovery

1. A signed-in member can create a listing with title, description, audience/category, clothing type, size, condition, location, brand, colour, and an image URL or uploaded image.
2. The server assigns an estimated swap value from the item category, condition, and whether a brand is provided. It is an indicative conversation aid, not a cash price or guaranteed appraisal.
3. A member can view and edit their own listings or remove one they own. Members cannot edit or remove another member's listing.
4. Visitors can browse available listings and open a detailed item page.
5. Visitors can search listings by title, brand, type, or description and filter by category. The nearby view supports a member-entered neighbourhood or city, or opt-in browser geolocation with a 5–100 km radius and closest-first results.
6. A listing owner may explicitly attach an approximate location to a listing. The server rounds coordinates to two decimal places (roughly neighbourhood scale); only listings with an approximate point appear in radius matches. Browser location access is requested only after the member selects the location action.
7. Members cannot request their own item or request an item that is no longer available.

### Community and remote delivery

1. A member can publish a community post in Swap story, Care & repair, or Slow fashion. Visitors can browse and filter the feed; signed-in members can appreciate a post.
2. A member can remove their own community post; administrators can remove any post.
3. The community page reports live member, rehomed-piece, and completed-swap counts from marketplace data.
4. After a swap is accepted, either participant can choose Local or Remote delivery. For remote delivery, each participant can save their own courier, tracking number, optional HTTPS tracking link, and parcel status.
5. Courier details are shared only with the two swap participants. Booking a courier, buying labels, and automatic status synchronization require a future carrier API connection.

### Swaps and messaging

1. An authenticated member selects one of their own available clothing listings to offer for another member's available item. The request includes an optional note.
2. The request screen compares the two estimated values and makes clear that the estimate is a guide and no money is exchanged.
3. The listing owner can accept or decline a pending request. Acceptance reserves both items and closes other pending requests that involve either item.
4. Both participants can view the conversation associated with their swap and send messages. Other members cannot read or send messages in it.
5. Participants can agree on item condition, hand-off or delivery, and timing in the conversation. The platform does not book a courier or process payment.
6. Either participant can confirm an accepted exchange as completed. Both participants must confirm; then both listings change to Swapped and only completed exchanges count as successful swaps.
7. Members can view incoming and sent requests with both items, their current status, estimated value comparison, and a link to the associated chat.

### Dashboard and administration

1. A member dashboard shows their own listing count, completed swaps, pending conversations, and the estimated combined value of their listings.
2. An administrator can view member, available-listing, pending-request, and completed-swap counts.
3. An administrator can set a listing to Available, Reserved, Swapped, or Removed. Removed listings are excluded from the available marketplace.

## High-level user flows

### Browse and request a swap

Discover → search or filter → open item details → sign in → choose one available piece from your wardrobe → review the value comparison → send an optional note and request → see the two proposed items under Sent requests → chat with the owner.

### Join the sustainable fashion community

Open Community → browse swap stories, care and repair ideas, and slow-fashion discussions → sign in to share a post or appreciate a member's post.

### Offer clothing

Register or sign in → list an item → provide its details and photo → publish → view it in My wardrobe → edit or remove it later.

### Complete an exchange

Owner reviews Incoming requests → accepts or declines → participants open the swap chat → agree on the exchange → owner marks the swap complete → listing is recorded as Swapped.

### Administer the marketplace

Administrator signs in → review platform overview → inspect clothing listings → set a listing status or remove it.

## Data requirements

- **Member:** name, email, hashed password, role, active/suspended account status, location, optional profile image, timestamps.
- **Clothing listing:** title, description, category, type, size, condition, brand, colour, neighbourhood label, optional rounded GeoJSON location point, image path/URL, estimated value, status, owner, timestamps.
- **Swap request:** requested listing, offered listing, requester, owner, note, status, timestamps.
- **Message:** swap request, sender, body, timestamp.
- **Shipment:** swap request, sending participant, courier, tracking number/link, participant-updated parcel status.
- **Community post:** member, topic, body, appreciation reactions, timestamps.
- **Report/dispute:** reporter, listing/swap/community target, reason, details, open/resolved/dismissed state, resolution note, resolving administrator, timestamps.

Passwords must never be stored in plain text. Listing ownership and swap participation must be checked on the server for every protected operation.

## Non-functional requirements

- **Security:** hash passwords; validate required fields; sign and verify expiring authentication tokens; enforce role, ownership, and conversation-participant checks server-side; do not expose passwords in profile responses.
- **Privacy:** display neighbourhood-level location only when supplied; do not publish email or direct contact details in public listing pages.
- **Responsive design:** usable at narrow phone widths through desktop widths; controls remain labelled and keyboard accessible.
- **Performance:** load listing results and images efficiently; show loading, empty, and recoverable error states.
- **Reliability:** persist member, listing, request, and message data in MongoDB; preserve swap status transitions and listing availability.
- **Maintainability:** separate React pages, API services, Express routes/controllers, and Mongoose models.

## Suggested technology and current implementation

- Frontend: React 19, Vite, React Router, Axios, responsive CSS.
- Backend: Node.js, Express, Mongoose, MongoDB, bcrypt, JSON Web Tokens, Multer image uploads.
- Deployment: Render static site for the frontend and Render web service for the API, with MongoDB configured separately.

## Success measures

- Number of active members.
- Number of available clothing listings.
- Number of completed swaps.
- Number of active users and pending requests.
- Request-to-completion conversion rate (to be calculated from event data before presenting as a KPI).
- Member engagement and listing availability over time (requires analytics instrumentation for reliable measurement).

The current dashboard exposes live member/listing/request totals and completed swaps from the application database. Engagement and conversion rates are future analytics work; they should not be inferred from page views or accepted requests alone.

## Assumptions and constraints

- Members accurately describe and photograph their clothing.
- Members arrange the exchange in good faith and confirm completion honestly.
- Swaps are non-monetary; the displayed estimate is guidance only.
- Members arrange local hand-off or delivery themselves. Delivery cost and item quality are not guaranteed by Rewear.
- Location matching is text-based neighbourhood/city filtering, not GPS distance calculation.
- Database availability, object/image storage, and live deployment URLs depend on separately configured services and credentials.

## Future enhancements

- Improved dispute handling and completion recovery for interrupted exchanges.
- Courier integrations and shipment status.
- Matching suggestions, richer sustainability-impact measurement, and community groups.
- Native mobile app, virtual try-on, and condition verification.
- Proper event analytics and conversion dashboards.

## Delivery checklist

- [x] Interconnected marketplace, detail, request, chat, dashboard, profile, wardrobe, and administrator screens.
- [x] Real API-backed browsing, listings, one-to-one swap offers, value comparison, messaging, dashboard metrics, and moderation.
- [x] Responsive presentation and loading, empty, and error states.
- [x] Production frontend bundle, frontend lint, and backend syntax verified for the current submission revision.
- [ ] Public deployment URL: connect a GitHub repository in the owner's Render account and provide a cloud-reachable MongoDB URI. The current local database only listens on this computer. Render's Blueprint is configured to wire the client and API hostnames; uploaded-photo persistence needs a configured persistent or object store.

## Submission requirements from the project brief

The screenshots supplied with the project brief are the evaluation requirements. Treat this checklist as authoritative alongside the detailed functional requirements above. A checked item must be demonstrated by the running application or verified deployment; a written plan alone does not count as implementation.

### Problem, objectives, and scope

- Address unused wearable clothing, the lack of a dedicated swap marketplace, complicated resale pricing, and limited sustainable-fashion options.
- Make direct, non-monetary clothing swaps the main exchange model; encourage reuse and support neighbourhood-level discovery.
- Primary objectives: provide a dedicated exchange marketplace, direct swaps without purchase transactions, sustainable reuse, and location-based matching. The brief repeats location-based matching; keep it as one objective in the implementation.
- Secondary objectives: let members discuss an exchange, estimate indicative item values, filter by category and location, and build a sustainable-fashion community.
- Phase 1 screens: login/register, clothing listings, item details, swap requests, chat, member dashboard, and admin panel. Keep these screens connected through working navigation and data-backed flows.
- Out of Phase 1: online purchase/payment, AI-generated fashion advice, augmented-reality try-on, and a separate native mobile application. The responsive website may be installable as a PWA; do not describe that as a native app.
- Remote courier booking and automatic carrier tracking are not part of the first release. Participants may arrange delivery themselves and record tracking details.

### Functional coverage

- User module: register/login, profile, create listings with photos/details, browse listings, send swap offers, and review swap history.
- Listing module: upload an image, describe type/size/brand/condition, show an estimated swap value and availability, and edit/remove owned listings.
- Swap module: send requests, review incoming requests, accept/reject, and track status.
- Negotiation chat: private member-to-member discussion of item details, exchange terms, and confirmation.
- Value guidance: estimate from category, condition, and brand; compare both items; label the estimate as guidance, never a cash price or required balancing payment.
- Location matching: browse by city/neighbourhood and opt-in approximate distance; do not expose exact or continuous user location.
- Admin module: review members and platform activity, suspend/restore accounts, moderate listings, resolve/dismiss member-submitted reports and swap disputes, and download database-derived analytics as CSV.

### Quality, stack, and flows

- Non-functional expectations: secure authentication and protected data, responsive layout, fast search/listing access, safe data persistence, scalable deployment, clear validation, and privacy protection.
- Suggested stack in the brief: HTML5, CSS3, JavaScript, React, Bootstrap/Tailwind; Node.js/Express; MongoDB or PostgreSQL; optional cloud storage; AWS, Render, or Vercel. The implementation uses React/Vite with custom CSS, Express/Mongoose/MongoDB, and a Render blueprint.
- Member flow: register/sign in → create profile → list clothing → browse/filter → choose a piece to offer → compare guidance values → send request → chat → arrange local exchange or self-managed shipping.
- Admin flow: sign in as administrator → review live totals → inspect listings, members, swaps, and reports → moderate listings or resolve disputes → download a CSV analytics report.

### Data, KPIs, and impact

- Store member name/email/hashed password/role/location; listing ID/type/brand/size/condition/value/location; swap requests and statuses; private chat history; and shipment details where participants choose remote delivery.
- KPIs requested: listing count, completed swaps, user engagement, request conversion, and active users. Current data supports member count, available listing count, pending request count, completed swap count, and a basic completed-request ratio. Engagement/activity rates require event instrumentation and must not be invented.
- Intended impact: less textile waste, sustainable fashion habits, affordable access to clothing, community exchange, and lower impact from fast fashion. These are goals, not quantified claims without measured data.
- Assumptions: members are willing to exchange clothes and provide accurate item details; courier services can be arranged by participants. Constraints: item quality depends on the member, swap fairness is negotiated, and shipping costs may affect participation.
- Future ideas: AI-based recommendations, native mobile app, item-condition verification, better sustainability measurement, community groups, and delivery-provider integration.

### Deliverables and final evaluation gate

- Required deliverables: interconnected marketplace screens, listing/browsing, functioning swap and chat flows, location matching, admin moderation, complete PRD, and a live deployed application URL.
- Use realistic listings sourced from the database. Do not present hard-coded sample users, metrics, swap history, or placeholder marketplace listings as real activity. Empty states are appropriate when the database has no records.
- Validate input and enforce authentication, ownership, participant, and administrator permissions on the server.
- Run the available production build and lint checks before submission; verify key user flows against a configured database. Do not mark the project fully tested until those checks have actually passed.
- A live URL is mandatory for final evaluation. It is still outstanding until a public deployment and cloud-reachable database are configured and verified.
