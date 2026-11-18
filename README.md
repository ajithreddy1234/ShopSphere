# ShopSphere

[Live application](https://ajith-shopsphere.netlify.app/)

The original React product-management application, deployed with a managed PostgreSQL adapter on Netlify. Create, edit and delete products, switch colour themes, and revisit the catalogue. Each browser receives an isolated demo workspace with six illustrative sample products. The workspace cookie lasts 30 days; clearing it starts a new workspace.

## Architecture

React 19, React Router, Zustand → same-origin Netlify Function → PostgreSQL. The API retains the original `/api/products` response shape. All writes validate names, prices and image URLs, require the application's origin and workspace cookie, and scope queries to that workspace. Version checks reject stale updates. No MongoDB credentials are needed for this deployment.

The original Express/Mongoose implementation remains in `backend/` for historical/local use with `MONGO_URI`; it is not the deployed storage adapter. This project is a product CRUD workspace, not a payment-enabled online store.

## Run and deploy

Use Node 22. Install root and frontend dependencies with `npm ci` and `npm ci --prefix frontend`. Run `netlify dev` for the API and local database; `npm run dev --prefix frontend` alone serves the UI. `npm test` tests real database CRUD, workspace isolation, validation, origin checks, and version conflicts. `netlify deploy --build --prod` builds the React app, deploys the API, and applies committed SQL migrations.

`.netlify`, credentials, node_modules and build output are ignored. Product illustrations are local SVG assets.
