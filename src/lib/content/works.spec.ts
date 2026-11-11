import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { WORKS, catalogNumber, findWork } from './works.ts';

const CATALOG_SIZE = 34;
const ASSETS = 'src/lib/assets';
const STATUSES = ['available', 'reserved', 'sold'];

describe('WORKS', () => {
	it('lists the whole catalog in order', () => {
		expect(WORKS).toHaveLength(CATALOG_SIZE);
		expect(WORKS.map((work) => work.n)).toEqual(
			Array.from({ length: CATALOG_SIZE }, (_, index) => index + 1)
		);
	});

	it('gives every work a unique slug that is safe in a URL', () => {
		const slugs = WORKS.map((work) => work.slug);
		expect(new Set(slugs).size).toBe(CATALOG_SIZE);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it('has a title, technique and size in both languages for every work', () => {
		for (const work of WORKS) {
			expect(work.title.length).toBeGreaterThan(0);
			for (const text of [work.medium.es, work.medium.en, work.dimensions.es, work.dimensions.en]) {
				expect(text.length).toBeGreaterThan(0);
				expect(text.endsWith('.')).toBe(false);
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
	it('finds a work by its slug', () => {
		expect(findWork('duna-banada-en-peltre')?.n).toBe(7);
	});

	it('returns nothing for a slug that is not in the catalog', () => {
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
	it('has the whole view from the catalog for every work', () => {
		for (const work of WORKS) {
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
});
