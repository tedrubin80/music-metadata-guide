# Music Distribution ID & Metadata Guide

An interactive, single-page reference for the identifiers and metadata standards used in professional music distribution — ISRC codes, UPC/EAN barcodes, DDEX, and catalog/royalty workflows.

**[View the guide](https://tedrubin80.github.io/music-metadata-guide/)**

## What's inside

- **Overview** — how ISRC and UPC/EAN relate to each other
- **ISRC codes** — structure, when to assign, how to obtain (national agency, US ISRC Agency, distributors), catalog best practices
- **UPC/EAN barcodes** — structure, when a new code is needed, how to obtain one (GS1 direct, third-party resellers, via distributors)
- **Metadata & operations** — core fields per track/release, DDEX standards (ERN, MEAD), catalog and royalty pipeline validation
- **Interactive tools**
  - ISRC format checker
  - UPC/EAN checksum validator (GTIN-12/EAN-13)
  - Downloadable catalog tracking CSV template
- Full sourced bibliography (footnoted throughout, linked at the bottom)

## Tech

Plain HTML/CSS/JavaScript — no build step, no dependencies. Fonts loaded from Fontshare and Google Fonts via CDN.

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## License

Content compiled for reference purposes; see inline citations for original sources.
