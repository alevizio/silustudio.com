# silustudio.com

Redesign of the website of Silu, the art studio and gallery of Silvestre Jacobi and Lucila Dickinson in Manantiales, Punta del Este, Uruguay.

The site is static: SvelteKit builds eight HTML pages (four in Spanish, four in English) into `build/`.

## Design in one paragraph

"La sala". The page is the gallery wall and the works supply the colour. Each work hangs alone with a wall label (catalog number, title, technique, size). The first job of the site is to get people to visit the gallery, so the way there (address, directions, WhatsApp) opens the home page and closes every other page.

## Pages

| Spanish     | English       | What it is                                             |
| ----------- | ------------- | ------------------------------------------------------ |
| `/`         | `/en/`        | Home: the gallery, three works, the artists, the visit |
| `/obras/`   | `/en/works/`  | Works: photographed works, details, the full catalog   |
| `/estudio/` | `/en/studio/` | The artists' statement and biographies                 |
| `/visitar/` | `/en/visit/`  | Address, contact, map                                  |

## Where things live

- `src/lib/content/works.ts`: the 34 works of the catalog (title, technique, size, in both languages).
- `src/lib/content/site.ts`: address, phone, email, links. Opening hours go here once the artists provide them.
- `src/lib/i18n/es.ts` and `en.ts`: every piece of text on the site.
- `src/lib/assets/`: photos. `catalog/` holds one small photo per work, cropped from the artists' PDF catalog. `works/` holds the full size photos.
- `src/routes/layout.css`: design tokens (colours, type scale, spacing).
- `src/lib/components/` and `src/lib/pages/`: components and the four page layouts, each with its test next to it.

## Commands

```sh
npm install
npm run dev        # work on the site at http://localhost:5173
npm run build      # write the static site to build/
npm run check      # type check
npm run lint       # formatting and lint
npm run test:unit -- --run   # unit and component tests
npm run test:e2e   # builds the site, then runs every page through Playwright and axe
```

## Adding a photo of a work

1. Put the photo in `src/lib/assets/works/` as a PNG.
2. In `src/lib/content/works.ts`, set `photo` on that work to the file name without the extension.

The work then appears on the wall at the top of the Works page with its label.

## Still needed from the artists

- Opening hours.
- Original photos of the works that only have a catalog thumbnail.
- Titles for the ten photos listed in `UNTITLED_PHOTOS` (`src/lib/content/works.ts`).
- A review of the English technique lines and of the new short texts on the home page.
