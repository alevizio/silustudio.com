/*
 * Makes the PDF catalog of the works from the same data and photos the site uses, so the
 * catalog can never fall behind the site. One work to a page, in the look of the site.
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
const DETAIL_PHOTO = 700;
const JPEG_QUALITY = 78;
/** Detail photos shown beside the main one. */
const DETAILS_PER_WORK = 2;

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

/** A copy of a photo small enough for the PDF, as the address of a file on this computer. */
const prepared = async (file: string, longest: number, folder: string): Promise<string> => {
	const name = `${path.basename(path.dirname(file))}-${path.parse(file).name}-${longest}.jpg`;
	const target = path.join(folder, name);
	await sharp(file)
		.rotate()
		.resize({ width: longest, height: longest, fit: 'inside', withoutEnlargement: true })
		.flatten({ background: '#f6f4ef' })
		.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
		.toFile(target);
	return pathToFileURL(target).href;
};

const font = (family: string, file: string, weight: string): string =>
	`@font-face { font-family: '${family}'; src: url('${pathToFileURL(path.join(FONTS, file)).href}') format('woff2'); font-weight: ${weight}; }`;

/* The look of the site on paper: the wall, the ink, the two type families. */
const STYLES = `
${font('Lato', '@fontsource/lato/files/lato-latin-400-normal.woff2', '400')}
${font('Lato', '@fontsource/lato/files/lato-latin-700-normal.woff2', '700')}
${font('Newsreader', '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2', '200 800')}
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: 'Lato', sans-serif; color: #23211e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 297mm; height: 210mm; overflow: hidden; background: #f6f4ef; break-after: page; }
.label { font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: #5f5a52; }
.serif { font-family: 'Newsreader', serif; font-weight: 300; }
.foot { position: absolute; left: 16mm; right: 16mm; bottom: 8mm; display: flex; justify-content: space-between; border-top: 0.25mm solid #d9d4ca; padding-top: 3mm; }
.cover img.room { width: 297mm; height: 132mm; object-fit: cover; display: block; }
.cover .words { display: flex; justify-content: space-between; align-items: flex-end; padding: 12mm 16mm 0; }
.cover img.logo { height: 26mm; }
.cover h1 { font-size: 34pt; line-height: 1.1; text-align: right; }
.cover .who { font-size: 13pt; text-align: right; color: #5f5a52; padding-top: 3mm; }
.cover .date { text-align: right; padding-top: 4mm; }
.work { display: grid; grid-template-columns: 1fr 68mm; gap: 12mm; padding: 14mm 16mm 22mm; }
.work .photo { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; }
.work .photo img { max-width: 100%; max-height: 174mm; object-fit: contain; }
.work .side { display: flex; flex-direction: column; justify-content: space-between; min-height: 0; }
.work h2 { font-size: 22pt; line-height: 1.15; padding: 4mm 0 6mm; }
.work dl { border-top: 0.25mm solid #d9d4ca; }
.work dl div { border-bottom: 0.25mm solid #d9d4ca; padding: 3.5mm 0; }
.work dd { font-family: 'Newsreader', serif; font-size: 11.5pt; line-height: 1.45; padding-top: 1mm; }
.work .details { display: flex; gap: 3mm; }
/* A detail keeps its own shape, like every photo of a work: never cropped. */
.work .details img { height: 34mm; width: auto; max-width: 32.5mm; object-fit: contain; }
.visit { display: grid; grid-template-columns: 1fr 1fr; }
.visit img { width: 100%; height: 210mm; object-fit: cover; }
.visit .words { display: flex; flex-direction: column; justify-content: center; gap: 7mm; padding: 0 18mm; }
.visit h2 { font-size: 28pt; line-height: 1.15; }
.visit p.serif { font-size: 14pt; line-height: 1.6; }
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
	const foot = (number: string): string =>
		`<p class="foot label"><span>${escape(`${SITE.name} · ${address}`)}</span><span>${escape(`${SITE.phone.display} · ${website} · ${number}`)}</span></p>`;

	try {
		const room = await prepared(path.join(ASSETS, 'gallery/sala-01.jpg'), 2400, folder);
		const front = await prepared(path.join(ASSETS, 'gallery/fachada.jpg'), 1800, folder);
		const logo = pathToFileURL(path.join(ASSETS, 'brand/silu-logo-ink.png')).href;

		const cover = page(
			'cover',
			`<img class="room" src="${room}" alt="">
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
			const photo = await prepared(main, MAIN_PHOTO, folder);
			const details = await Promise.all(
				rest.slice(0, DETAILS_PER_WORK).map((file) => prepared(file, DETAIL_PHOTO, folder))
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
			pages.push(
				page(
					'work',
					`<div class="photo"><img src="${photo}" alt=""></div>
					<div class="side">
						<div>
							<p class="label">${number}</p>
							${heading}
							${facts ? `<dl>${facts}</dl>` : ''}
						</div>
						<div class="details">${details.map((detail) => `<img src="${detail}" alt="">`).join('')}</div>
					</div>
					${foot(number)}`
				)
			);
		}

		const visit = page(
			'visit',
			`<img src="${front}" alt="">
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
			await sheet.pdf({ path: out, format: 'A4', landscape: true, printBackground: true });
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
