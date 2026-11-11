import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PHOTOGRAPHED_WORKS, UNTITLED_PHOTOS, WORKS } from './works.ts';

const CATALOG_SIZE = 34;
const SITE_PHOTOS = 15;
const pad = (n: number): string => String(n).padStart(2, '0');

describe('WORKS', () => {
	it('lists the whole catalog in order', () => {
		expect(WORKS).toHaveLength(CATALOG_SIZE);
		expect(WORKS.map((work) => work.n)).toEqual(
			Array.from({ length: CATALOG_SIZE }, (_, index) => index + 1)
		);
	});

	it('gives every work a unique anchor that is safe in a URL', () => {
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

	it('has a catalog thumbnail on disk for every work', () => {
		for (const work of WORKS) {
			expect(existsSync(`src/lib/assets/catalog/${pad(work.n)}.jpg`)).toBe(true);
		}
	});
});

describe('work photos', () => {
	it('points every matched photo at a file that exists', () => {
		expect(PHOTOGRAPHED_WORKS.length).toBeGreaterThan(0);
		for (const work of PHOTOGRAPHED_WORKS) {
			expect(existsSync(`src/lib/assets/works/${work.photo}.png`)).toBe(true);
		}
	});

	it('uses each of the site photos exactly once, titled or untitled', () => {
		const titled = PHOTOGRAPHED_WORKS.map((work) => work.photo);
		const all = [...titled, ...UNTITLED_PHOTOS];
		expect(all).toHaveLength(SITE_PHOTOS);
		expect(new Set(all).size).toBe(SITE_PHOTOS);
		for (const key of UNTITLED_PHOTOS) {
			expect(existsSync(`src/lib/assets/works/${key}.png`)).toBe(true);
		}
	});
});
