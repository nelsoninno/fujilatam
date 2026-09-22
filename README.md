# FujiLatam website

This folder is the website. Three languages: English at the root, Spanish in
`/es/`, Portuguese in `/pt/`.

## Where things go

- `_source/photos-original/` and `_source/video-original/` are for original
  files at full resolution. Drop new photos and clips here first. Nothing in
  `_source/` is published.
- `assets/images/products/` holds the compressed .webp images the site actually
  shows. Keep the naming pattern: `what-it-is-fujilatam-fujielevatorlatam.com.webp`.
- `assets/video/` holds the hero clip.
- `assets/css/tokens.css` is the only file where colours and fonts are defined.
  Change a colour there and the whole site follows.
- `brand/brand.md` is the plain language version of the same thing.

## To ask for a change

Say what you want changed and where, for example "on the home page, the second
box under Why Fuji". If the change involves a new photo or new wording, send the
file or the text with it. Every change is made in all three languages.

## How the pages are built

The HTML in this folder is plain static HTML and can be edited directly. It was
generated from `_source/build/`, which keeps the three languages structurally
identical. If you edit the HTML by hand, note it in `CLAUDE.md` so the next
session does not regenerate over your edit.

## What is not finished

- The distributor form is a mockup. It does not send anywhere yet.
- The logo is a placeholder wordmark. Swap in the real file when it arrives.
- Contact details are not on the site yet.
- The partner country list needs confirming with Pedro.

Website made with love by everybodyknowsyou.com
