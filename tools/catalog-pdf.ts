/*
 * Makes the PDF catalog of the works from the same data and photos the site uses, so the
 * catalog can never fall behind the site. One work to a page, in the look of the site. The
 * pages are upright, because the catalog is opened on a phone more than anywhere else, and
 * each work's photos are hung on its page as a mosaic (catalog-layout.ts).
 *
 *   npm run catalog                         both catalogs the site offers, written to static/
 *   npm run catalog -- --lang en            only the English one
 *   npm run catalog -- --out some/file.pdf  one catalog somewhere else (Spanish unless --lang en)
 *   npm run catalog -- --only guijarro,cause  just these works (for a quick look)
 *
 * It shows every work the sheet marks "En el PDF" that has full size photos, in the order of
 * the works page. Tags
 * (sold, in the gallery) are left out until the artists confirm real ones: the ones on the
 * site today are samples, and a PDF gets passed around.
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { SITE } from '../src/lib/content/site.ts';
import { PDF_WORKS, WORKS, type Work } from '../src/lib/content/works.ts';
import { en } from '../src/lib/i18n/en.ts';
import { es } from '../src/lib/i18n/es.ts';
import { layoutWork, type Box } from './catalog-layout.ts';

type Lang = 'es' | 'en';

export interface CatalogOptions {
	lang: Lang;
	/** Where the PDF is written. */
	out: string;
	/** Slugs of the only works to show. Left out, every photographed work is shown. */
	only?: string[];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'src/lib/assets');
const FONTS = path.join(ROOT, 'node_modules');
const PHOTO = /\.(jpe?g|png|webp)$/i;

/** Longest side of a photo in the PDF, in pixels: sharp on paper, and light enough to send. */
const MAIN_PHOTO = 1700;
const DETAIL_PHOTO = 1100;
const JPEG_QUALITY = 78;
/** Detail photos shown beside the main one. */
const DETAILS_PER_WORK = 2;
/** The room an A4 page gives a work, in millimetres: inside the margins, under the logo, over the foot. */
const WORK_AREA = { width: 182, height: 247 };
/** Words in a box narrower than this are set one under another; in a wider one, side by side. */
const WIDE_WORDS = 100;
/** How many pixels over its place a block of words may measure before it counts as not fitting. */
const FIT_SLACK = 1;

const COPY = { es, en };
/** The catalog's own words, which the site does not have. */
const WORDS = {
	es: {
		file: 'catalogo-silu.pdf',
		title: 'Catálogo de obras',
		reference: 'Ref.',
		enquiries: 'Consultas por WhatsApp',
		dateLocale: 'es-UY'
	},
	en: {
		file: 'silu-catalog.pdf',
		title: 'Catalog of works',
		reference: 'Ref.',
		enquiries: 'Enquiries on WhatsApp',
		dateLocale: 'en-GB'
	}
};

const escape = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A work's full size photos, in file name order. The first is the one shown large. */
const photosOf = (work: Work): string[] => {
	const folder = path.join(ASSETS, 'works', work.slug);
	if (!existsSync(folder)) return [];
	return readdirSync(folder)
		.filter((name) => PHOTO.test(name))
		.sort()
		.map((name) => path.join(folder, name));
};

interface Prepared {
	/** The address of the copy, a file on this computer. */
	href: string;
	/** The photo's width divided by its height. */
	shape: number;
}

/** A copy of a photo small enough for the PDF. */
const prepared = async (file: string, longest: number, folder: string): Promise<Prepared> => {
	const name = `${path.basename(path.dirname(file))}-${path.parse(file).name}-${longest}.jpg`;
	const target = path.join(folder, name);
	const { width, height } = await sharp(file)
		.rotate()
		.resize({ width: longest, height: longest, fit: 'inside', withoutEnlargement: true })
		.flatten({ background: '#f6f4ef' })
		.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
		.toFile(target);
	return { href: pathToFileURL(target).href, shape: width / height };
};

/** Where a box of the layout sits on the page, as the styles that put it there. */
const placed = ({ x, y, width, height }: Box): string =>
	`left:${x.toFixed(2)}mm;top:${y.toFixed(2)}mm;width:${width.toFixed(2)}mm;height:${height.toFixed(2)}mm`;

const font = (family: string, file: string, weight: string): string =>
	`@font-face { font-family: '${family}'; src: url('${pathToFileURL(path.join(FONTS, file)).href}') format('woff2'); font-weight: ${weight}; }`;

/* The look of the site on paper: the wall, the ink, the two type families. */
const STYLES = `
${font('Lato', '@fontsource/lato/files/lato-latin-400-normal.woff2', '400')}
${font('Lato', '@fontsource/lato/files/lato-latin-700-normal.woff2', '700')}
${font('Newsreader', '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2', '200 800')}
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: 'Lato', sans-serif; color: #23211e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 210mm; height: 297mm; overflow: hidden; background: #f6f4ef; break-after: page; }
.label { font-size: 8.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: #5f5a52; }
.serif { font-family: 'Newsreader', serif; font-weight: 300; }
.foot { position: absolute; left: 14mm; right: 14mm; bottom: 8mm; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1mm 6mm; border-top: 0.25mm solid #d9d4ca; padding-top: 3mm; font-size: 7pt; }
/* The top of every page of the site: the logo on the left, and where the visitor is on the right. */
.head { position: absolute; left: 14mm; right: 14mm; top: 9mm; display: flex; justify-content: space-between; align-items: center; }
.head img { height: 13mm; }
.cover img.room { width: 210mm; height: 204mm; object-fit: cover; display: block; }
.cover .words { display: flex; justify-content: space-between; align-items: flex-end; padding: 14mm 14mm 0; }
.cover img.logo { height: 30mm; }
.cover h1 { font-size: 34pt; line-height: 1.1; text-align: right; }
.cover .who { font-size: 14pt; text-align: right; color: #5f5a52; padding-top: 3mm; }
.cover .date { text-align: right; padding-top: 4mm; }
/*
 * A work's page. Its photos and its words are put where catalog-layout.ts says, inside the
 * room the page gives a work. A photo's box has the photo's own shape, so nothing is cropped.
 */
.work .area { position: absolute; left: 14mm; top: 28mm; width: ${WORK_AREA.width}mm; height: ${WORK_AREA.height}mm; }
.work .area > * { position: absolute; }
/* The words start at the top of their place, right under or beside what is above them. */
.work .words { display: flex; flex-direction: column; }
/* Beside the main photo, they stand on the line the photo stands on, like a label on the wall. */
.work .words.standing { justify-content: flex-end; }
.work h2 { font-size: 24pt; line-height: 1.12; padding: 0 0 5mm; }
.work dl { border-top: 0.25mm solid #d9d4ca; }
.work dl div { border-bottom: 0.25mm solid #d9d4ca; padding: 3mm 0; }
.work dd { font-family: 'Newsreader', serif; font-size: 13pt; line-height: 1.4; padding-top: 1mm; }
/* Across the page, the facts sit side by side. */
.work .words.wide dl { display: grid; grid-template-columns: 1fr 2fr; column-gap: 8mm; }
.visit img { width: 210mm; height: 150mm; object-fit: cover; display: block; }
.visit .words { display: flex; flex-direction: column; gap: 7mm; padding: 16mm 14mm 0; }
.visit h2 { font-size: 30pt; line-height: 1.15; }
.visit p.serif { font-size: 15pt; line-height: 1.6; }
`;

const page = (kind: string, inner: string): string =>
	`<section class="page ${kind}">${inner}</section>`;

/**
 * Builds the catalog and writes it to `out`. Returns how many works it shows.
 */
export const buildCatalog = async ({ lang, out, only }: CatalogOptions): Promise<number> => {
	const copy = COPY[lang];
	const words = WORDS[lang];
	// A work goes in when the sheet says so ("En el PDF") and it has a photo to show.
	const works = WORKS.filter(
		(work) => PDF_WORKS.has(work.slug) && photosOf(work).length > 0
	).filter((work) => !only || only.includes(work.slug));
	const folder = mkdtempSync(path.join(tmpdir(), 'silu-catalog-'));
	const address = `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region}, ${SITE.address.country}`;
	const website = SITE.url.replace('https://', '');
	const date = new Intl.DateTimeFormat(words.dateLocale, { month: 'long', year: 'numeric' }).format(
		new Date()
	);
	const foot = `<p class="foot label"><span>${escape(`${SITE.name} · ${address}`)}</span><span>${escape(`${SITE.phone.display} · ${website}`)}</span></p>`;

	try {
		const room = await prepared(path.join(ASSETS, 'gallery/sala-01-alta.jpg'), 2400, folder);
		const front = await prepared(path.join(ASSETS, 'gallery/fachada.jpg'), 1800, folder);
		const logo = pathToFileURL(path.join(ASSETS, 'brand/silu-logo-ink.png')).href;

		const cover = page(
			'cover',
			`<img class="room" src="${room.href}" alt="">
			<div class="words">
				<img class="logo" src="${logo}" alt="${escape(SITE.name)}">
				<div>
					<h1 class="serif">${escape(words.title)}</h1>
					<p class="who serif">${escape(copy.studio.title)}</p>
					<p class="label date">${escape(date)}</p>
				</div>
			</div>`
		);

		const pages: string[] = [];
		for (const [index, work] of works.entries()) {
			const [main, ...rest] = photosOf(work);
			const photos = await Promise.all([
				prepared(main, MAIN_PHOTO, folder),
				...rest.slice(0, DETAILS_PER_WORK).map((file) => prepared(file, DETAIL_PHOTO, folder))
			]);
			const layout = layoutWork(
				photos.map((photo) => photo.shape),
				WORK_AREA
			);
			const number = `${String(index + 1).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`;
			// A work with no title yet is shown by its reference, so a client can ask about it.
			const heading =
				work.title !== undefined
					? `<h2 class="serif">${escape(work.title)}</h2>`
					: `<h2 class="serif">${escape(`${words.reference} ${work.ref}`)}</h2>`;
			const facts = [
				work.dimensions && [copy.works.detail.dimensions, work.dimensions[lang]],
				work.medium && [copy.works.detail.material, work.medium[lang]]
			]
				.filter((fact) => fact !== undefined)
				.map(
					([term, value]) =>
						`<div><dt class="label">${escape(term)}</dt><dd>${escape(value)}</dd></div>`
				)
				.join('');
			const hung = photos
				.map((photo, at) => `<img src="${photo.href}" alt="" style="${placed(layout.photos[at])}">`)
				.join('');
			// The words are beside the main photo when they start level with it and to its right.
			const wordsClass = [
				'words',
				layout.words.width >= WIDE_WORDS && 'wide',
				layout.words.y === 0 && layout.words.x > 0 && 'standing'
			]
				.filter(Boolean)
				.join(' ');
			pages.push(
				page(
					'work',
					`<p class="head"><img src="${logo}" alt="${escape(SITE.name)}"><span class="label">${number}</span></p>
					<div class="area">
						${hung}
						<div class="${wordsClass}" data-work="${escape(work.slug)}" style="${placed(layout.words)}">
							${heading}
							${facts ? `<dl>${facts}</dl>` : ''}
						</div>
					</div>
					${foot}`
				)
			);
		}

		const visit = page(
			'visit',
			`<img src="${front.href}" alt="">
			<div class="words">
				<p class="label">${escape(copy.visit.label)}</p>
				<h2 class="serif">${escape(copy.visit.title)}</h2>
				<p class="serif">${[SITE.address.street, SITE.address.locality, SITE.address.region, SITE.address.country].map(escape).join('<br>')}</p>
				<p class="serif">${escape(words.enquiries)}: ${escape(SITE.phone.display)}<br>${escape(SITE.email)}<br>${escape(SITE.instagram.handle)} · ${escape(website)}</p>
			</div>`
		);

		const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${escape(`${SITE.name} · ${words.title}`)}</title><style>${STYLES}</style></head><body>${[cover, ...pages, visit].join('')}</body></html>`;
		const source = path.join(folder, 'catalog.html');
		writeFileSync(source, html);

		mkdirSync(path.dirname(out), { recursive: true });
		const browser = await chromium.launch();
		try {
			const sheet = await browser.newPage();
			await sheet.goto(pathToFileURL(source).href, { waitUntil: 'load' });
			await sheet.evaluate(() => document.fonts.ready);
			// Words that need more room than the layout gave them would run over a photo or off
			// the page. Better no catalog than one that looks broken: say which works, and stop.
			const cramped = await sheet.evaluate(
				(slack) =>
					[...document.querySelectorAll<HTMLElement>('.work .words')].flatMap((box) => {
						const needed = [...box.children].reduce(
							(height, child) => height + child.getBoundingClientRect().height,
							0
						);
						const given = box.getBoundingClientRect().height;
						const over = Math.ceil(((needed - given) / given) * 100);
						return needed > given + slack ? [`${box.dataset.work} (${over}% too tall)`] : [];
					}),
				FIT_SLACK
			);
			if (cramped.length > 0) {
				throw new Error(`The words do not fit on the page of: ${cramped.join(', ')}`);
			}
			await sheet.pdf({ path: out, format: 'A4', printBackground: true });
		} finally {
			await browser.close();
		}
		return works.length;
	} finally {
		rmSync(folder, { recursive: true, force: true });
	}
};

if (import.meta.main) {
	const { values } = parseArgs({
		options: {
			lang: { type: 'string' },
			out: { type: 'string' },
			only: { type: 'string' }
		}
	});
	// With nothing asked for, both catalogs the site offers are made again, each in its place.
	const langs: Lang[] =
		values.lang === 'en' ? ['en'] : values.lang === 'es' ? ['es'] : ['es', 'en'];
	for (const lang of values.out ? langs.slice(0, 1) : langs) {
		const out = path.resolve(values.out ?? path.join(ROOT, 'static', WORDS[lang].file));
		const count = await buildCatalog({ lang, out, only: values.only?.split(',') });
		console.log(`${count} works written to ${out}`);
	}
}
