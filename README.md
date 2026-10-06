Hi shaan here i am making my ultimate design portfolio 

## Run it

```bash
npm install
npm run dev       # http://localhost:5173  (add #level2 or #finale to jump ahead; dev only)
npm run build     # production build into dist/
npm run preview   # serve the production build at http://localhost:4173
```

## Deploy on Vercel

Import this repo in Vercel. `vercel.json` already sets the Vite build (`npm ci` → `npm run build` → `dist/`) and caching, so no settings need changing.
Hey guys checkout <moryasshan.vercel.app> to have an look at my portfolio 
## Where things live

- `src/content.js`: every word on the About / Projects / Experience / Blogs / Life pages
- `src/pages.js`: how those pages render and animate
- `public/`: images, music, video and the PDFs (blog + stories)
- Share a page directly with `/#about`, `/#projects`, `/#experience`, `/#blogs` or `/#life`
