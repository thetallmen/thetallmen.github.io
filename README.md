# THE TALL MEN — website V1

Static site. No build step, no backend, no paid services. Plain HTML, CSS and JavaScript modules.

## Edit content: admin panel at `/admin`

The team edits everything from **`/admin`** (Sveltia CMS, free) by logging in with their GitHub username and password.
Setup steps and the day-to-day guide (in Arabic) are in **[ADMIN-GUIDE.md](ADMIN-GUIDE.md)**.

Content lives in four JSON files, which the panel edits and the site reads at runtime (`assets/js/config.js`):

| File | What |
| --- | --- |
| `content/agency.json` | name, logo, contact details, social links, address, menu |
| `content/copy.json` | every headline and paragraph |
| `content/services.json` | capabilities + process steps |
| `content/work.json` | portfolio projects + featured film |

Empty fields (contact details, client, year…) are not rendered. Uploads go to `assets/uploads/`.
Admin config: `admin/config.yml` (edit `repo`, `base_url`, `site_url` once).

**Logo:** upload it in the admin under Agency & contact → Logo. It replaces the typographic wordmark. Replace `assets/favicon.svg` too.

**Domain:** replace `https://www.example.com/` in `index.html`, `robots.txt` and `sitemap.xml`.

## Media

`assets/media/` holds web copies of the original files:

| File | Source | Notes |
| --- | --- | --- |
| `project-01.mp4` | `1.mp4` (1440×2560, 9:16, 4 s) | H.264 1080×1920. The silent audio track was dropped. |
| `film-01.mp4` | `v2 2-10.mp4` (1080×1920, 9:16, 32 s) | H.264 720×1280 + AAC 128k, faststart |
| `*-poster.jpg` | real frames from each video | |

Nothing was cropped, retimed or overlaid. Re-encode new videos the same way (ffmpeg):

```
ffmpeg -i input.mp4 -vf scale=720:-2 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart output.mp4
```

## Preview locally

```
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Then open http://localhost:5178. Any static server works. ES modules don't load from `file://`.

## Deploy

- **Cloudflare Pages:** connect the repo (or drag the folder). Build command: none. Output directory: `/`.
- **GitHub Pages:** push the folder to a repo and enable Pages on the branch root.

## Structure

```
index.html                 page shell, SEO / OG meta
assets/css/main.css        all styles (tokens at the top)
assets/js/config.js        all content
assets/js/main.js          renders sections, starts behaviour
assets/js/motion.js        reveals, parallax, process line, magnetic buttons
assets/js/components/      Header, Hero, SectionTitle, ProjectItem, VideoPlayer,
                           Capabilities (+ Philosophy, Process), About (+ Location),
                           CTA, Footer, CustomCursor, Loader, Wordmark
```

## Arabic / RTL later

Set `locale.lang = 'ar'` and `locale.dir = 'rtl'` in a translated config. Layout uses logical CSS properties, so it mirrors. Add an Arabic display face to `--font-display`.

Live site: https://thetallmen.netlify.app — Admin: https://thetallmen.netlify.app/admin
