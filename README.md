# silustudio.com

Redesign of the website of Silu, the art studio and gallery of Silvestre Jacobi and Lucila Dickinson in Manantiales, Punta del Este, Uruguay.

The site is static: SvelteKit builds every page in Spanish and in English into `build/`: four main pages and one page per work.

## Design in one paragraph

"La sala". The page is the gallery wall and the works supply the colour. Photos are large and come first: the home page opens on a photo of the room that runs edge to edge, the works hang two to a row at their own shape on a shared baseline, and a work's page is its photos with the label beside them. The first job of the site is to get people to visit the gallery, so the way there (address, directions, WhatsApp) sits right under the opening photo and closes every other page.

The layouts follow three references found on Mobbin: KOBU (two large photos per row with a short caption), MOUTHWASH Studio (each image at its own proportions on one baseline) and the FARFETCH and Nike product pages (photos stacked on the left, the details fixed beside them).

## Pages

| Spanish          | English             | What it is                                                  |
| ---------------- | ------------------- | ----------------------------------------------------------- |
| `/`              | `/en/`              | Home: the gallery, four works, the artists, the visit       |
| `/obras/`        | `/en/works/`        | Works: the wall of works, then the catalog-only works       |
| `/estudio/`      | `/en/studio/`       | The artists' film, statement and biographies                |
| `/visitar/`      | `/en/visit/`        | Address, contact, and a map of the coast drawn for the site |
| `/obras/<obra>/` | `/en/works/<obra>/` | One page per work: photos, tag, title, size, material       |

## Where things live

- `src/lib/content/works.sheet.ts` and `works.ts`: every work. The first is written by `npm run sync` from the artists' Google Sheet, one row per work. The second gives those rows the shape the pages use. Today: the 34 works of the PDF catalog, then the photographed works that are not in it, six with a title and 44 with none yet.
- `src/lib/content/site.ts`: address, phone, email, links. Opening hours go here once the artists provide them.
- `src/lib/i18n/es.ts` and `en.ts`: every piece of text on the site.
- `src/lib/assets/`: photos. `works/<slug>/` holds the full size photos of a work, `01.jpg` being the one shown on the wall. `catalog/` holds the small photos of each work cropped from the artists' PDF catalog (`07-1.jpg` is the whole view of work 7). `untitled/` holds photos from the old site not yet matched to a work.
- `src/routes/layout.css`: design tokens (colours, type scale, spacing).
- `src/lib/components/wall-light.svelte`: the faint daylight on the wall (the shadow of a pergola and a plant). It stays on the screen while a page scrolls and moves slowly as the visitor scrolls: the pergola's shadow slides and turns, the fronds sway. It sits behind everything, so it never falls on a work. Its strength (`--opacity-wall-light`) and its motion (`--wall-light-*`) are tokens in `layout.css`.
- `src/lib/motion/reveal.ts` and the motion tokens in `layout.css` (`--motion-*`, `--ease-settle`): the quiet motion of text and photos. An element with the class `reveal` arrives softly the first time it is scrolled to (`reveal-after-1`, `reveal-after-2` make neighbours follow one another). `motion-safe:animate-arrive` does the same for what opens a page. Work photos come a hair closer under the pointer. All of it is off for visitors who ask for less motion, in print, and without scripts nothing is ever hidden.
- `src/lib/motion/page-transition.ts`, with its styles in `layout.css`: moving between pages. The header keeps its place, the old page fades away and the new one fades in. A work's photo travels: it flies from its place on the wall into its own page and back, and when the visitor walks from one work to the next the photo on screen leaves to one side while the new one comes in from the other. It uses the browser's view transitions, so a browser without them, or a visitor who asks for less motion, simply gets the new page.
- `src/lib/components/work-pager.svelte` and `work-neighbours.svelte`: the two ways from one work to another. The arrows at the top sit in the same spot on every work's page, and the left and right arrow keys do the same. The end of the page shows the works before and after with their photos. The way back from a work opens the wall at that work.
- `src/lib/components/coast-map.svelte` and `src/lib/content/coast-map.ts`: the map on the visit page. See "The map" below.
- `src/lib/components/link-button.svelte`: buttons fill with colour from the bottom under the pointer or the keyboard (`--motion-fill`), and text links draw a darker rule over their faint one.
- `src/lib/pages/studio-page.svelte` and `src/lib/components/hung-pair.svelte`: the studio page hangs the artists' statement like the wall texts of an exhibition. Each paragraph stands on its own, the first and the last set large, and the photos hang between them at uneven sizes: a large one with a small one and a short text beside it. The layout follows three "About" pages found on Mobbin (Aino Agency, Fiasco, Siena Film Foundation).
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

Every work has its own page (`/obras/guijarro/`, `/en/works/guijarro/`) with its photos, title, size, material and, once confirmed, its tag.

**Where a work shows.** A work with at least one full size photo hangs on the wall at the top of the works page, two to a row. A catalog work with only the small catalog photos hangs below it, three to a row, at the real size of its photo (about 300 pixels wide, which is all the PDF catalog gives). Adding full size photos moves it up by itself.

**Photos.** Put them in `src/lib/assets/works/<slug>/`, named in the order they should show (`01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`). The slug is the last part of the work's address and is listed in `src/lib/content/works.ts`. No code change is needed.

**Works with no title yet.** 44 photographed works are waiting for their titles. Their folders are `obra-08`, `obra-09` and so on, and the site calls them "Obra 8", "Obra 9": never as a title on the wall, only as a quiet reference on the work's own page and for screen readers. When the artists name one, in `src/lib/content/works.ts` take its number out of `UNTITLED_REFS`, add the work with its title (and technique and size if they send them), and rename its folder to the new slug.

**Tags.** In `src/lib/content/works.ts`, add `status: 'onView'`, `'sold'`, `'reserved'` or `'available'` to the work. It shows as a small tag, En la galería, Vendida, Reservada or Disponible, under the work on the wall and over its title on its own page. A work with no status shows no tag.

**The tags showing now are samples, not facts.** Five works carry a made-up tag so the artists can see how one looks: Guijarro, Supraconciencia and Reencause say "En la galería", Impronta humana and Resplandor circular say "Vendida". They live in `SAMPLE_STATUSES` in `works.ts`, and that list empties itself the moment `launched` is `true`, so a sample can never reach the public site. When the artists confirm the real ones, write each on its work and delete the list.

## The map

The visit page closes on the site's own drawing of the coast from Punta del Este to José Ignacio, with the gallery on Ruta 10. It is drawn from OpenStreetMap data (© OpenStreetMap contributors, ODbL, credited under the map), in the colours of the wall, and loads nothing from anyone else. A visitor who wants to move around the map presses "Ver mapa interactivo", and only then does Google's map load in its place.

`src/lib/content/coast-map.ts` is generated. The downloaded data, the queries and the script that draws it (`tools/build_map.py`) are kept outside this repository, in `Silu/Map data 2026-11-11`. To draw it again: run `uv run --with shapely python3 tools/build_map.py` there, copy the `coast-map.ts` it writes over the one here, and run `npm run format`. The names on the map are placed in `coast-map.svelte`.

## Updating the works from the Google Sheet

Every fact about a work (title, technique, size, tag, whether it shows on the site and in the PDF) lives in the Google Sheet "Silu Obras", which the artists keep. `npm run sync` reads it and rewrites `src/lib/content/works.sheet.ts`, the only file the site takes its works from, then says what is new, changed or gone. Nothing is published by it: look at the site, run the tests, then deploy. `npm run catalog` afterwards rebuilds the PDF from the same rows.

- **What it reads.** The sheet's tab "Para la web", which mirrors only the public columns, published as CSV (File, Share, Publish to web). Its address goes in `src/lib/content/sheet-source.ts`. The price and notes columns are not in that tab, so they never leave the sheet. `npm run sync -- --from file.csv` reads a downloaded CSV instead.
- **A slip in the sheet never reaches the site.** A code that is not lower case words joined by hyphens, a code used twice, a work with no title whose code is not `obra-NN`, a tag that is not on the list, or a missing column stops the run with the row number and the reason.
- **Photos are not in the sheet.** They go in `src/lib/assets/works/<código>/`, named in the order they should show. The command lists the works that have none.
- **New work:** a new row with its code, plus its photo folder. **Sold or in the gallery:** the "Estado" column. **Hide a work:** "En la web: No". **Name an untitled work:** fill in its title; to give it a proper address as well, change its code and rename its photo folder to match.
- `src/lib/content/works.ts` gives the rows the shape the pages use: sizes are written once in Spanish and said in English there, and the 34 works of the old PDF catalog keep their catalog numbers, which is how their small catalog photos are found.

## The PDF catalog

`npm run catalog` writes the catalog of works as a PDF, from the same data and photos the site uses, so it can never fall behind the site: a cover, one page for each work with full size photos (the large photo, title, size, material, up to two details), and a last page with the way to the gallery. It takes a few seconds and the result is about 11 MB for 69 works. `-- --lang en` writes it in English, `-- --out file.pdf` somewhere else, `-- --only guijarro,cause` just a few works. A work with no title yet is shown by its reference ("Ref. 41"), so a client can still ask about it. Tags are left out until the artists confirm real ones. The tool is `tools/catalog-pdf.ts` and its output folder, `catalog/`, is not kept in git.

## What search engines get

- **Each page** has its own title and description, the address of its twin in the other language, and a share image (`src/lib/components/seo.svelte`).
- **`/sitemap.xml`** lists every page in both languages with the works' photos (`src/routes/sitemap.xml/+server.ts`), and `robots.txt` points to it.
- **Structured data** (`src/lib/content/structured-data.ts`): the home and visit pages say Silu is an art gallery, with its address, place on the map, phone and Instagram. Each titled work's page says it is an artwork by the two artists, with its photos, technique and size. Opening hours join it once they are confirmed. Nothing says whether a work is for sale.
- **Old addresses.** `vercel.json` sends the ten addresses of the Squarespace site (`/inicio`, `/artistas`, `/contacto`, `/work` and so on) to their new pages for good, and makes every address end in a slash. It has not been through a deploy yet: check a few on the first one.

## Where the photos come from

- **Full size photos of the works:** the artists' stock folder, taken from a designer's proposal of November 2026 (208 photos in 66 sets). 16 sets are catalog works: each shares at least one photograph with the PDF catalog, so the match is certain. The other 50 sets are not in the catalog.
- **Three more full size photos** (Desde el centro del ser, Mismo origen, Dar es recibir) and the photos in `untitled/` come from the artists' old site.
- **Two works named from Instagram.** "Opuestos en tensión" and "Azul profundo" were sets 34 and 42 with no title. A post on the artists' Instagram shows the very same work as our photos and gives its title, technique and size, so they carry them now, still to be confirmed.
- **Copies from the artists' Instagram**, about 1080 pixels wide, to be replaced by the original files: the nine black and white photos of the artists at work on the studio page (`assets/studio/taller-NN.jpg`) and the ten photos of works in homes on the works page (`assets/homes/`). Their descriptions are in `es.ts` and `en.ts`, one for each photo in file name order. Recent posts credit the photographers @marufolch and @veme.productora: ask the artists whether a credit is due.
- **The photos of the gallery and of the artists** (`assets/gallery/`, `assets/studio/artistas-NN.jpg`) are the files the artists uploaded to their old Squarespace site, at the size they uploaded them. Ask its image server for them with `?format=original` and the header `Accept: image/jpeg`: without that header it hands over a re-compressed WebP, which is what the site carried until the originals replaced it. The photo that opens the home page is only 1779 pixels wide, so it is soft on large high-density screens: the camera file (`_MG_5343`) would fix that.
- **The three short films on the studio page** (`static/video/taller-N.mp4`, with a poster and a caption file each) are reels from the artists' Instagram, re-encoded at up to 720 pixels wide. The second only exists there at 360 pixels wide. They have music and no speech, so their captions are one "[Música]" line. Original files from the artists would be sharper.
- **The film on the studio page** is the artists' own, "SILU Artistas Loop", on Vimeo, which their old site also embeds. It loads from Vimeo only when a visitor presses play.

## Launch day

Set `launched` to `true` in `src/lib/content/site.ts`. Until then every page carries `noindex`, so previews stay out of search results. Then, the same day: check that the old addresses redirect, add the site to Google Search Console and hand it `/sitemap.xml`, and put the new address of each page in the gallery's Google Maps listing and Instagram bio. The same switch removes the sample tags, so the works that are really in the gallery or sold need their real `status` before that day.

## Still needed from the artists

- Opening hours.
- Titles, technique and size for the 44 photographed works that have none (`obra-08` to `obra-67`). Their Instagram captions name many works: the list read from them is kept outside this repository, in `Silu/Instagram survey 2026-11-11/works-from-captions.tsv`.
- Confirmation of four titles that come from the designer's proposal and are not in the catalog: Mar de fondo, Pables, Encuentro en un reflejo, Ser antiguo (díptico). And their technique and size.
- Confirmation of the two titles taken from Instagram, Opuestos en tensión and Azul profundo, with their technique and size.
- The camera files of the gallery photos, above all the one that opens the home page (`_MG_5343`), which is only 1779 pixels wide.
- Full size photos of the 15 catalog works that only have small catalog photos, or word that they are sold.
- Which works are in the gallery, sold, reserved or available. The five tags on the site today are samples.
- Titles for the nine photos in `src/lib/assets/untitled/`.
- A review of the English technique lines and of the new short texts on the home page.
