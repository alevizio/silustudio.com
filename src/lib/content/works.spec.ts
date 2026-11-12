import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.ts';
import {
	CATALOG_WORKS,
	PDF_WORKS,
	SAMPLE_STATUSES,
	WORKS,
	catalogNumber,
	dimensionsInEnglish,
	findWork
} from './works.ts';
import { SHEET_ROWS } from './works.sheet.ts';

const CATALOG_SIZE = 34;
const ASSETS = 'src/lib/assets';
const STATUSES = ['onView', 'available', 'reserved', 'sold'];

describe('CATALOG_WORKS', () => {
	it('lists the whole catalog in order', () => {
		expect(CATALOG_WORKS).toHaveLength(CATALOG_SIZE);
		expect(CATALOG_WORKS.map((work) => work.n)).toEqual(
			Array.from({ length: CATALOG_SIZE }, (_, index) => index + 1)
		);
	});

	it('has a title, technique and size in both languages for every work', () => {
		for (const work of CATALOG_WORKS) {
			expect(work.title.length).toBeGreaterThan(0);
			for (const text of [work.medium.es, work.medium.en, work.dimensions.es, work.dimensions.en]) {
				expect(text.length).toBeGreaterThan(0);
				expect(text.endsWith('.')).toBe(false);
			}
		}
	});
});

describe('WORKS', () => {
	it('holds the catalog first, then the photographed works that are not in it', () => {
		expect(WORKS.slice(0, CATALOG_SIZE)).toEqual(CATALOG_WORKS);
		expect(WORKS.length).toBeGreaterThan(CATALOG_SIZE);
	});

	it('gives every work a unique slug that is safe in a URL', () => {
		const slugs = WORKS.map((work) => work.slug);
		expect(new Set(slugs).size).toBe(WORKS.length);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it('calls every work by its title or, until it has one, by the number of its folder', () => {
		for (const work of WORKS) {
			if (work.title === undefined) {
				expect(work.slug).toBe(`obra-${catalogNumber(work.ref)}`);
			} else {
				expect(work.title.length).toBeGreaterThan(0);
				expect(work.ref).toBeUndefined();
			}
		}
	});

	it('only uses the four known statuses', () => {
		const unknown = WORKS.filter(
			(work) => work.status !== undefined && !STATUSES.includes(work.status)
		);
		expect(unknown).toEqual([]);
	});
});

describe('SAMPLE_STATUSES', () => {
	it('only ever exists while the site is a preview, so no sample reaches the public site', () => {
		// The day the site launches this list has to be empty: a sample is not a fact.
		if (SITE.launched) expect(SAMPLE_STATUSES).toEqual({});
		else expect(Object.keys(SAMPLE_STATUSES).length).toBeGreaterThan(0);
	});

	it('names real works, and shows both a work in the gallery and a sold one', () => {
		for (const [slug, status] of Object.entries(SAMPLE_STATUSES)) {
			expect(findWork(slug)?.status, slug).toBe(status);
		}
		if (!SITE.launched) {
			expect(Object.values(SAMPLE_STATUSES)).toEqual(expect.arrayContaining(['onView', 'sold']));
		}
	});

	it('is the only place a status comes from until the artists confirm the real ones', () => {
		const withStatus = WORKS.filter((work) => work.status !== undefined).map((work) => work.slug);
		expect(withStatus.sort()).toEqual(Object.keys(SAMPLE_STATUSES).sort());
	});
});

describe('the works and the sheet', () => {
	it('shows every row the sheet marks for the site, and no other', () => {
		const onSite = SHEET_ROWS.filter((row) => row.onSite).map((row) => row.code);
		expect(WORKS.map((work) => work.slug).sort()).toEqual(onSite.sort());
	});

	it("keeps the sheet's words: title, technique in both languages and size", () => {
		for (const row of SHEET_ROWS.filter((candidate) => candidate.onSite)) {
			const work = findWork(row.code);
			expect(work?.title ?? '', row.code).toBe(row.title);
			expect(work?.medium?.es ?? '', row.code).toBe(row.medium);
			expect(work?.medium?.en ?? '', row.code).toBe(row.mediumEn || row.medium);
			expect(work?.dimensions?.es ?? '', row.code).toBe(row.dimensions);
		}
	});

	it('puts in the PDF catalog only the works the sheet marks for it', () => {
		for (const row of SHEET_ROWS) expect(PDF_WORKS.has(row.code), row.code).toBe(row.inPdf);
	});
});

describe('dimensionsInEnglish', () => {
	it('keeps the figures and swaps the words around them', () => {
		expect(dimensionsInEnglish('220 × 90 × 10 cm')).toBe('220 × 90 × 10 cm');
		expect(dimensionsInEnglish('3 piezas · 100 × 185 × 22 cm')).toBe(
			'3 pieces · 100 × 185 × 22 cm'
		);
		expect(dimensionsInEnglish('100 cm de diámetro × 9 cm de profundidad')).toBe(
			'100 cm diameter × 9 cm deep'
		);
		expect(dimensionsInEnglish('Tamaños varios')).toBe('Various sizes');
		expect(dimensionsInEnglish('Varias medidas')).toBe('Various sizes');
	});
});

describe('findWork', () => {
	it('finds a catalog work by its slug', () => {
		expect(findWork('duna-banada-en-peltre')?.title).toBe('Duna bañada en peltre');
	});

	it('finds a work that has no title yet by its folder name', () => {
		expect(findWork('obra-41')?.ref).toBe(41);
	});

	it('returns nothing for a slug that is not a work', () => {
		expect(findWork('no-existe')).toBeUndefined();
	});
});

describe('catalogNumber', () => {
	it('pads the number to two digits', () => {
		expect(catalogNumber(7)).toBe('07');
		expect(catalogNumber(34)).toBe('34');
	});
});

describe('photos on disk', () => {
	it('has the whole view from the catalog for every catalog work', () => {
		for (const work of CATALOG_WORKS) {
			expect(existsSync(`${ASSETS}/catalog/${catalogNumber(work.n)}-1.jpg`)).toBe(true);
		}
	});

	it('keeps full size photos in folders named after a work', () => {
		const folders = readdirSync(`${ASSETS}/works`, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
		expect(folders.length).toBeGreaterThan(0);
		for (const folder of folders) {
			expect(findWork(folder), `works/${folder} does not match any work`).toBeDefined();
			expect(readdirSync(`${ASSETS}/works/${folder}`).length).toBeGreaterThan(0);
		}
	});

	it('has full size photos for every work that is not in the catalog', () => {
		for (const work of WORKS.slice(CATALOG_SIZE)) {
			expect(existsSync(`${ASSETS}/works/${work.slug}/01.jpg`), work.slug).toBe(true);
		}
	});
});
