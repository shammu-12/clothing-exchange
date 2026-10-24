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
- Administrator overview and listing moderation, including removing an unavailable or inappropriate listing.
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
6. The listing owner can mark an accepted exchange as completed. Both listings then change to Swapped; only completed exchanges count as successful swaps.
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

- **Member:** name, email, hashed password, role, location, optional profile image, timestamps.
- **Clothing listing:** title, description, category, type, size, condition, brand, colour, neighbourhood label, optional rounded GeoJSON location point, image path/URL, estimated value, status, owner, timestamps.
- **Swap request:** requested listing, offered listing, requester, owner, note, status, timestamps.
- **Message:** swap request, sender, body, timestamp.
- **Shipment:** swap request, sending participant, courier, tracking number/link, participant-updated parcel status.
- **Community post:** member, topic, body, appreciation reactions, timestamps.

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

- Two-sided completion confirmation and dispute handling.
- Courier integrations and shipment status.
- Matching suggestions, richer sustainability-impact measurement, and community groups.
- Native mobile app, virtual try-on, and condition verification.
- Proper event analytics and conversion dashboards.

## Delivery checklist

- [x] Interconnected marketplace, detail, request, chat, dashboard, profile, wardrobe, and administrator screens.
- [x] Real API-backed browsing, listings, one-to-one swap offers, value comparison, messaging, dashboard metrics, and moderation.
- [x] Responsive presentation and loading, empty, and error states.
- [x] Production frontend bundle builds successfully.
- [x] Backend JavaScript syntax verified and local MongoDB connection confirmed.
- [ ] Public deployment URL: connect a GitHub repository in the owner's Render account and provide a cloud-reachable MongoDB URI. The current local database only listens on this computer. Render's Blueprint is configured to wire the client and API hostnames; uploaded-photo persistence needs a configured persistent or object store.
