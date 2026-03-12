# Prayful Generation – Alexandria

Bilingual Catholic Daily Gospel and Prayer PWA (English & Arabic).  
Liturgy of the Hours, daily readings, and saints according to the Roman Catholic calendar.

## Deploy on GitHub Pages

1. **Create a new repository** on GitHub (e.g. `prayful-gen`).

2. **Push this project** into the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
   - Save

4. **Site URL** (after a minute or two):
   - Project site: `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   - User site: `https://YOUR_USERNAME.github.io/` (if repo is `USERNAME.github.io`)

## Local development

To test with a local proxy (avoids CORS limits):

```bash
node local-dev-server.js
```

Then open: **http://localhost:8080**

## Data sources

- **Evangelizo** — Gospel, readings, psalms, saints
- **iBreviary** — Morning & Evening Prayer (Lauds, Vespers)
- **Universalis** — English hymn/intercessions fallback  
- **Wikipedia** — Arabic saint biographies

External APIs are reached via public CORS proxies when running on GitHub Pages.

## License

Content sources: see attribution in app.  
Code: use as you wish for personal/devotional use.
