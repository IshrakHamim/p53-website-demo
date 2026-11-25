# P53 — Website Demo

Demo storefront for **P53**, a Bangladeshi brand of premium scrubs, OT dresses and white coats.

**Live demo:** https://ishrakhamim.github.io/p53-website-demo/

## Highlights
- **360° Fit Studio.** Every product is generated as a 3D garment (three.js) that shoppers can drag and spin horizontally. There are no top or bottom views, so it works like a turntable product shot. It includes Front/Side/Back snaps, inertia, auto-spin and a live angle dial.
- **Consistent catalogue.** The source photos were inconsistent (posters, models, one flat-lay), so every product now gets the same set of images: a 3D still, a generated *folded set + cap* flat-lay, Front/Side/Back renders, and then the original campaign photos.
- **Live name embroidery.** Type a name on embroidery-enabled products and it appears on the 3D model and the folded-set image.
- **Immersive hero.** A minimal three.js double helix (a nod to the p53 gene and the logo's dot-and-line motif) that reacts to the mouse and unwinds on scroll.
- Women / Men / Unisex categories, Three-Quarter, Summer Lite, White Coats and Caps, a mega-menu, filters (gender, category, collection, colour, size), search, a demo bag, and a size guide transcribed from the client's charts.

## Placeholders (to confirm with client)
- **Prices:** shown as "Price TBA". They could not be read from the Facebook page.
- **Checkout, accounts, contact form, delivery/returns:** "coming soon".
- **Size charts:** the supplied images are cropped. Row labels are best guesses and missing sizes are marked TBC.
- **White Coat & Surgical Cap:** no product photography yet, so they are shown with 3D and generated images only.

## Structure
```
docs/            ← GitHub Pages root (static, no build step)
  index.html
  css/style.css
  js/app.js       router + pages
  js/data.js      product catalogue, size charts
  js/garment.js   procedural 3D garment builder
  js/viewer.js    360° viewer + still renderer
  js/flatlay.js   generated folded-set SVGs
  js/hero.js      hero helix animation
  img/            logo, product photos, size charts
assets/          original client assets
```

Run locally: `cd docs && python3 -m http.server` then open http://localhost:8000.
