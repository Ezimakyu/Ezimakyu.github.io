# Personal Portfolio

A fast, static portfolio site for GitHub Pages.

## Edit your info

- **Name / tagline / about text**: open `index.html` and edit the marked `HERO` and `ABOUT` sections.
- **Contact links**: edit the `CONTACT` section in `index.html`.
- **Projects**: edit `projects.json`. To add a new project, copy an existing object and update:
  - `name`, `slug` (unique URL slug), `status`, `year`, `tagline`, `summary`, `details`, `tech`, `repo`
  - `thumbnail`: path to an image or GIF in the repo (e.g. `assets/iterviz.png`)
  - `thumbnailVideo`: optional path to a video file (e.g. `assets/demo.mp4`)
- **Styling / colors**: edit `css/styles.css`, especially the `:root` variables at the top.

## Thumbnails

Place images/GIFs/videos under `assets/` (create the folder if needed) and reference them in `projects.json`. The placeholders will disappear automatically once a thumbnail path is set.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Push to the `main` branch of this repo. GitHub Pages will serve `index.html`.
