# Rewear clothing exchange marketplace

## Run locally

1. In `backend`, copy `.env.example` to `.env`, set a MongoDB connection string and a long JWT secret, then run `npm start`.
2. In `frontend`, run `npm run dev`.
3. Open `http://localhost:5173`.

## Deploy on Render

1. Push this project to GitHub.
2. In Render, create a new Blueprint and select the repository. Render will use `render.yaml` to create the API and web services.
3. Create a MongoDB Atlas database, then enter its connection string as `MONGO_URI` for `rewear-api`.
4. Set `VITE_API_URL` on `rewear-web` to `https://<your-api-name>.onrender.com/api`.
5. After the frontend service is deployed, set `CLIENT_URL` on `rewear-api` to the web service URL, then redeploy the API.

Do not commit `.env` files or production secrets.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
