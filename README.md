# silustudio.com

Redesign of the website of Silu, the art studio and gallery of Silvestre Jacobi and Lucila Dickinson in Manantiales, Punta del Este, Uruguay.

The site is static: SvelteKit builds every page in Spanish and in English into `build/`: four main pages and one page per work.

## Design in one paragraph

"La sala". The page is the gallery wall and the works supply the colour. Photos are large and come first: the home page opens on a photo of the room that runs edge to edge, the works hang two to a row at their own shape on a shared baseline, and a work's page is its photos with the label beside them. The first job of the site is to get people to visit the gallery, so the way there (address, directions, WhatsApp) sits right under the opening photo and closes every other page.

The layouts follow three references found on Mobbin: KOBU (two large photos per row with a short caption), MOUTHWASH Studio (each image at its own proportions on one baseline) and the FARFETCH and Nike product pages (photos stacked on the left, the details fixed beside them).

## Pages

| Spanish          | English             | What it is                                               |
| ---------------- | ------------------- | -------------------------------------------------------- |
| `/`              | `/en/`              | Home: the gallery, four works, the artists, the visit    |
| `/obras/`        | `/en/works/`        | Works: the wall of works, then the catalog-only works    |
| `/estudio/`      | `/en/studio/`       | The artists' film, statement and biographies             |
| `/visitar/`      | `/en/visit/`        | Address, contact, map                                    |
| `/obras/<obra>/` | `/en/works/<obra>/` | One page per work: photos, title, size, material, status |

## Where things live

- `src/lib/content/works.ts`: every work. The 34 of the PDF catalog (title, technique, size, in both languages), then the photographed works that are not in the catalog: four with a title, 46 with none yet.
- `src/lib/content/site.ts`: address, phone, email, links. Opening hours go here once the artists provide them.
- `src/lib/i18n/es.ts` and `en.ts`: every piece of text on the site.
- `src/lib/assets/`: photos. `works/<slug>/` holds the full size photos of a work, `01.jpg` being the one shown on the wall. `catalog/` holds the small photos of each work cropped from the artists' PDF catalog (`07-1.jpg` is the whole view of work 7). `untitled/` holds photos from the old site not yet matched to a work.
- `src/routes/layout.css`: design tokens (colours, type scale, spacing).
- `src/lib/components/wall-light.svelte`: the faint daylight on the wall (the shadow of a pergola and a plant). It stays on the screen while a page scrolls and moves slowly as the visitor scrolls: the pergola's shadow slides and turns, the fronds sway. It sits behind everything, so it never falls on a work. Its strength (`--opacity-wall-light`) and its motion (`--wall-light-*`) are tokens in `layout.css`.
- `src/lib/components/` and `src/lib/pages/`: components and the five page layouts, each with its test next to it.

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

**Where a work shows.** A work with at least one full size photo hangs on the wall at the top of the works page, two to a row. A catalog work with only the small catalog photos hangs below it, three to a row, at the real size of its photo (about 300 pixels wide, which is all the PDF catalog gives). Adding full size photos moves it up by itself.

**Photos.** Put them in `src/lib/assets/works/<slug>/`, named in the order they should show (`01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`). The slug is the last part of the work's address and is listed in `src/lib/content/works.ts`. No code change is needed.

**Works with no title yet.** 46 photographed works are waiting for their titles. Their folders are `obra-08`, `obra-09` and so on, and the site calls them "Obra 8", "Obra 9": never as a title on the wall, only as a quiet reference on the work's own page and for screen readers. When the artists name one, in `src/lib/content/works.ts` take its number out of `UNTITLED_REFS`, add the work with its title (and technique and size if they send them), and rename its folder to the new slug.

**Status.** In `src/lib/content/works.ts`, add `status: 'available'`, `'reserved'` or `'sold'` to the work. It shows as Disponible, Reservada or Vendida on the wall, in the list and on the work's page. A work with no status shows none, so nothing unconfirmed is published.

## Where the photos come from

- **Full size photos of the works:** the artists' stock folder, taken from a designer's proposal of November 2026 (208 photos in 66 sets). 16 sets are catalog works: each shares at least one photograph with the PDF catalog, so the match is certain. The other 50 sets are not in the catalog.
- **Three more full size photos** (Desde el centro del ser, Mismo origen, Dar es recibir) and the photos in `untitled/` come from the artists' old site.
- **The film on the studio page** is the artists' own, "SILU Artistas Loop", on Vimeo, which their old site also embeds. It loads from Vimeo only when a visitor presses play.

## Launch day

Set `launched` to `true` in `src/lib/content/site.ts`. Until then every page carries `noindex`, so previews stay out of search results.

## Still needed from the artists

- Opening hours.
- Titles, technique and size for the 46 photographed works that have none (`obra-08` to `obra-67`).
- Confirmation of four titles that come from the designer's proposal and are not in the catalog: Mar de fondo, Pables, Encuentro en un reflejo, Ser antiguo (díptico). And their technique and size.
- Which work photo set 34 is. The proposal calls it "Dar es recibir", but it shows a different work from the catalog's "Dar es recibir" (two equal panels, 165 × 80 cm), so it is shown with no title.
- Full size photos of the 15 catalog works that only have small catalog photos, or word that they are sold.
- Which works are available, reserved or sold.
- Titles for the nine photos in `src/lib/assets/untitled/`.
- A review of the English technique lines and of the new short texts on the home page.
