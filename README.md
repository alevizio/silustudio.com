# silustudio.com

Redesign of the website of Silu, the art studio and gallery of Silvestre Jacobi and Lucila Dickinson in Manantiales, Punta del Este, Uruguay.

The site is static: SvelteKit builds every page in Spanish and in English into `build/`: four main pages and one page per work.

## Design in one paragraph

"La sala". The page is the gallery wall and the works supply the colour. Each work hangs alone with a wall label (catalog number, title, technique, size). The first job of the site is to get people to visit the gallery, so the way there (address, directions, WhatsApp) opens the home page and closes every other page.

## Pages

| Spanish          | English             | What it is                                               |
| ---------------- | ------------------- | -------------------------------------------------------- |
| `/`              | `/en/`              | Home: the gallery, three works, the artists, the visit   |
| `/obras/`        | `/en/works/`        | Works: photographed works, details, the full catalog     |
| `/estudio/`      | `/en/studio/`       | The artists' statement and biographies                   |
| `/visitar/`      | `/en/visit/`        | Address, contact, map                                    |
| `/obras/<obra>/` | `/en/works/<obra>/` | One page per work: photos, title, size, material, status |

## Where things live

- `src/lib/content/works.ts`: the 34 works of the catalog (title, technique, size, in both languages).
- `src/lib/content/site.ts`: address, phone, email, links. Opening hours go here once the artists provide them.
- `src/lib/i18n/es.ts` and `en.ts`: every piece of text on the site.
- `src/lib/assets/`: photos. `catalog/` holds the small photos of each work cropped from the artists' PDF catalog (`07-1.jpg` is the whole view of work 7). `works/<slug>/` holds the full size photos of a work. `untitled/` holds photos not yet matched to a title.
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

## Each work

Every work has its own page (`/obras/guijarro/`, `/en/works/guijarro/`) with its photos, title, size, material and, once confirmed, its status.

**Photos.** Put them in `src/lib/assets/works/<slug>/`, named in the order they should show (`01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`). The slug is the last part of the work's address and is listed in `src/lib/content/works.ts`. No code change is needed. Until a work has photos there, its page shows the small photos cropped from the catalog.

**Status.** In `src/lib/content/works.ts`, add `status: 'available'`, `'reserved'` or `'sold'` to the work. It shows as Disponible, Reservada or Vendida on the list and on the work's page. A work with no status shows none, so nothing unconfirmed is published.

## Launch day

Set `launched` to `true` in `src/lib/content/site.ts`. Until then every page carries `noindex`, so previews stay out of search results.

## Still needed from the artists

- Opening hours.
- Four photos of each work (29 works only have small catalog photos today).
- Which works are available, reserved or sold.
- Titles for the ten photos in `src/lib/assets/untitled/`.
- A review of the English technique lines and of the new short texts on the home page.
