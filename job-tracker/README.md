# Job Application Tracker (dynamic, Vercel)

A Next.js app that tracks job applications with a status pipeline
(Applied → Interview → Offer → Rejected) and lets you attach the
exact CV file you used for each application.

- **Data storage:** Vercel KV (stores your application entries)
- **File storage:** Vercel Blob (stores the uploaded CV files)

Both are free on Vercel's Hobby plan at this scale.

## 1. Get the code onto GitHub

```bash
cd job-tracker
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 2. Import into Vercel

1. Go to https://vercel.com/new
2. Import the GitHub repo you just created
3. Keep the default settings (Framework Preset: Next.js) and click **Deploy**

The first deploy will succeed but the app won't work yet — it needs
the KV and Blob stores connected.

## 3. Add Vercel KV (for application data)

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** → choose **KV**
3. Follow the prompts, then **Connect** it to this project
4. Vercel automatically adds the required environment variables
   (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) — no manual setup needed

## 4. Add Vercel Blob (for CV uploads)

1. Still in the **Storage** tab, click **Create Database** → choose **Blob**
2. **Connect** it to this project
3. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` for you

## 5. Redeploy

After connecting both stores, trigger a redeploy (Vercel usually
does this automatically when you connect a new storage integration;
if not, go to **Deployments** → latest deployment → **Redeploy**).

Your tracker is now live at the URL Vercel gives you
(e.g. `your-project.vercel.app`), with data persisting across
visits and devices — not just the browser you're on.

## Running locally (optional)

```bash
npm install
vercel env pull .env.local   # pulls your KV/Blob credentials locally
npm run dev
```

Then open http://localhost:3000.

## Notes

- Supported CV file types: PDF, DOC, DOCX.
- Every application, update, and delete goes through the API routes
  in `pages/api/`, which talk to Vercel KV — so anyone with the live
  URL sees and edits the same data. If you want this private to only
  you, the simplest option is to add a password gate or Vercel's
  built-in deployment protection (Project Settings → Deployment Protection).
