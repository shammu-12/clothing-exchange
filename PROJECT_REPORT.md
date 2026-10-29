# Rewear - Project Report

## 1. Project overview

Rewear is a responsive clothing exchange marketplace for people who want to pass on wearable clothing and find useful pieces from their local community. Members list items, browse available clothing, propose item-for-item swaps, discuss the exchange privately, and coordinate local hand-off or self-managed delivery. The platform does not process payments.

## 2. Problem and objectives

Many people have wearable clothes they no longer use, while resale platforms can make exchange feel transactional and difficult to price. Rewear provides a dedicated place to discover clothing, propose direct swaps, and support reuse. Its objectives are to:

- Make listing, discovering, and exchanging pre-loved clothing straightforward.
- Support neighbourhood-level discovery while protecting precise location privacy.
- Give members a private conversation for agreeing exchange details.
- Show estimated item values as discussion guidance, never as cash prices.
- Encourage sustainable fashion through a community feed.

## 3. Technology

- **Frontend:** React 19, Vite, React Router, Axios, and responsive CSS.
- **Backend:** Node.js, Express, Mongoose, MongoDB, JSON Web Tokens, bcrypt, and Multer.
- **Deployment configuration:** Render Blueprint in `render.yaml` for a static web client and API service.
- **Mobile experience:** responsive, installable Progressive Web App. Capacitor files are scaffolding; a signed native app is outside this release.

## 4. Main features

### Member accounts and listings

Members can register and sign in, edit their profile, create listings with clothing details and an image, and manage their own wardrobe. Listing values are estimated from category, condition, and brand. Visitors can browse and search available listings, filter by category, inspect item details, and find nearby clothing.

### Swap requests and completion

A member proposes one of their available listings in exchange for another available item. The request screen compares both estimated values and clarifies that the values are guidance and no money is exchanged. The listing owner can accept or decline. Acceptance reserves the items and closes competing pending requests involving them. Both participants can use a private swap chat. Either participant can confirm an exchange; both must confirm before the request is completed and the listings are marked Swapped.

### Location and delivery

Members may search by city or neighbourhood. They may also opt in to browser location for closest-first results; listing map points are rounded by the API before storage. Accepted swaps support local or remote delivery planning. Participants can enter their own courier and tracking details. The platform does not book couriers or automatically update carrier status.

### Community and administration

The community feed supports swap stories, clothing care and repair, and slow-fashion posts, with appreciation reactions and live counts based on marketplace records. Administrators can review marketplace activity, suspend or restore members, moderate listings, resolve reports or disputes, and export database-derived analytics as CSV.

## 5. Privacy and security

Passwords are hashed. Protected API routes require authentication, and server-side checks enforce listing ownership, swap participation, and administrator access. Public listing pages do not expose member email addresses. Approximate location is optional and rounded before storage. Chat and shipment details are restricted to the participants in the corresponding swap.

## 6. Key user flows

1. Register or sign in, create a profile, and list a clothing item.
2. Browse or search for clothing and review a listing's details.
3. Choose an available wardrobe item, compare estimated values, and send a swap request.
4. The listing owner accepts or declines; accepted swaps open a private chat.
5. Participants agree on the hand-off or delivery, exchange the items, and each confirms completion.
6. An administrator reviews reports and marketplace activity when needed.

## 7. Verification status

The frontend production build completed successfully. Frontend lint completed without reported issues. Backend JavaScript syntax checks completed without errors. These checks do not replace verifying key flows against a configured production database.

## 8. Deployment status and requirements

The repository includes a Render Blueprint, but this report does not claim a live deployment. Deployment requires connecting the GitHub repository in Render and configuring a cloud-reachable MongoDB URI. Render then assigns public service URLs. Durable storage for uploaded photos also requires persistent or object storage configuration.

## 9. Scope and limitations

Swaps are non-monetary. Members arrange delivery and any costs themselves. Estimated values are indicative only. The platform does not guarantee item quality, book couriers, purchase labels, or synchronize live shipment tracking. The PWA is the mobile web experience; a signed Android or iOS app is not included.

## 10. Repository and supporting documentation

- Source repository: https://github.com/shammu-12/clothing-exchange
- Product requirements and delivery notes: `PRD.md`
- Local setup and deployment prerequisites: `README.md`
- Render service configuration: `render.yaml`
