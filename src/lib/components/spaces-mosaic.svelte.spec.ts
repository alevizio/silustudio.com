import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { SPACES_PHOTOS } from '#lib/content/images.ts';
import { es } from '#lib/i18n/es.ts';
import { en } from '#lib/i18n/en.ts';
import SpacesMosaic from './spaces-mosaic.svelte';

const ALTS = ['Cuadrada', 'Alta', 'Ancha', 'Cuadrada 2', 'Alta 2', 'Ancha 2'];
const PHOTOS = Array.from({ length: ALTS.length }, (_, index) => SPACES_PHOTOS[index % 3]);

/** The three photos of a three, in the order they sit on the page. */
const threes = (container: HTMLElement) =>
	[...(container.firstElementChild?.children ?? [])].map((three) =>
		[...three.querySelectorAll('img')].map((photo) => photo.getAttribute('alt'))
	);

describe('spaces-mosaic.svelte', () => {
	it('shows every photo with its own description', async () => {
		render(SpacesMosaic, { photos: PHOTOS, alts: ALTS });
		for (const alt of ALTS) {
			await expect.element(page.getByRole('img', { name: alt, exact: true })).toBeInTheDocument();
		}
	});

	it('sets them in threes, square over wide beside the tall one, every other three the other way', async () => {
		const { container } = render(SpacesMosaic, { photos: PHOTOS, alts: ALTS });
		await expect.element(page.getByRole('img', { name: 'Alta', exact: true })).toBeInTheDocument();
		expect(threes(container)).toEqual([
			['Cuadrada', 'Ancha', 'Alta'],
			['Cuadrada 2', 'Ancha 2', 'Alta 2']
		]);
		const [first, second] = container.querySelectorAll(':scope > div > div > div:first-child');
		expect(first.classList.contains('order-last')).toBe(false);
		expect(second.classList.contains('order-last')).toBe(true);
		const square = page.getByRole('img', { name: 'Cuadrada', exact: true }).element();
		const wide = page.getByRole('img', { name: 'Ancha', exact: true }).element();
		expect(square.classList.contains('aspect-square')).toBe(true);
		expect(wide.classList.contains('aspect-room')).toBe(true);
	});

	it('starts each row of two threes the other way from the row above on a wider screen', async () => {
		const alts = Array.from({ length: 12 }, (_, index) => `Foto ${index + 1}`);
		const photos = alts.map((_, index) => SPACES_PHOTOS[index % 3]);
		const { container } = render(SpacesMosaic, { photos, alts });
		await expect
			.element(page.getByRole('img', { name: 'Foto 12', exact: true }))
			.toBeInTheDocument();
		const turns = [...container.querySelectorAll(':scope > div > div > div:first-child')].map(
			(column) => [
				column.classList.contains('order-last'),
				column.classList.contains('md:order-last')
			]
		);
		// [turned on a phone, turned on a wider screen] for each three.
		expect(turns).toEqual([
			[false, false],
			[true, true],
			[false, true],
			[true, false]
		]);
	});

	it('leaves out a last three that is not complete, and waits to load the photos', async () => {
		const { container } = render(SpacesMosaic, {
			photos: PHOTOS.slice(0, 4),
			alts: ALTS.slice(0, 4)
		});
		await expect.element(page.getByRole('img', { name: 'Alta', exact: true })).toBeInTheDocument();
		expect(container.querySelectorAll('img')).toHaveLength(3);
		for (const photo of container.querySelectorAll('img')) {
			expect(photo.getAttribute('loading')).toBe('lazy');
		}
	});

	it('has the artists’ photos in whole threes, each described in both languages', () => {
		expect(SPACES_PHOTOS.length).toBeGreaterThan(0);
		expect(SPACES_PHOTOS.length % 3).toBe(0);
		expect(es.home.works.spaces).toHaveLength(SPACES_PHOTOS.length);
		expect(en.home.works.spaces).toHaveLength(SPACES_PHOTOS.length);
	});
});
