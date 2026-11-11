import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOG_WORKS, WORKS, catalogNumber, findWork } from './works.ts';

const CATALOG_SIZE = 34;
const ASSETS = 'src/lib/assets';
const STATUSES = ['available', 'reserved', 'sold'];

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

	it('only uses the three known statuses, and only where one was confirmed', () => {
		const unknown = WORKS.filter(
			(work) => work.status !== undefined && !STATUSES.includes(work.status)
		);
		expect(unknown).toEqual([]);
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
