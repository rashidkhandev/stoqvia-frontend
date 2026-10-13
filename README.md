# STOQVIA Frontend

Vite + React SPA for STOQVIA Retail, Point of Sale (POS), Inventory & Khata management.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` (optional for local, defaults to `http://localhost:5001/api`):
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

---

## Deploying to Vercel (Step-by-Step)

1. **Push your code to GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** > **Project**.
3. Import your GitHub repository.
4. In the Project Configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `stoqvia-frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://<your-backend-app>.onrender.com/api` (your live Render backend URL)
6. Click **Deploy**.
7. Once deployed, Vercel will give your live domain (e.g. `https://stoqvia-frontend.vercel.app`).
8. `vercel.json` is already included to ensure client-side routing (`/pos`, `/products`, `/dashboard`, etc.) works without 404 errors on page refresh.
