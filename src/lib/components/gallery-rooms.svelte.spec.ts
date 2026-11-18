import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { GALLERY_TALL_PHOTOS } from '#lib/content/images.ts';
import { copyFor } from '#lib/i18n/index.ts';
import GalleryRooms from './gallery-rooms.svelte';

const WIDE_PHOTOS = 4;

describe('gallery-rooms.svelte', () => {
	it('shows the film of the gallery, silent and without controls', async () => {
		const { container } = render(GalleryRooms, { lang: 'es' });
		const films = container.querySelectorAll('video');
		expect(films).toHaveLength(1);
		expect(films[0].muted).toBe(true);
		expect(films[0].controls).toBe(false);
		expect(films[0].getAttribute('aria-label')).toMatch(/^Película sin sonido/);
	});

	it('has upright photos in two columns for a phone, hidden on a wide screen', async () => {
		const { container } = render(GalleryRooms, { lang: 'es' });
		const columns = container.querySelector('.columns-2');
		expect(columns?.classList.contains('md:hidden')).toBe(true);
		const photos = [...(columns?.querySelectorAll('img') ?? [])];
		expect(photos.length).toBeGreaterThan(0);
		// The upright set, each photo once and in its order.
		expect(photos.map((photo) => photo.getAttribute('src'))).toEqual(
			GALLERY_TALL_PHOTOS.map((photo) => photo.img.src)
		);
		for (const photo of photos) {
			// Upright or square, never wider than tall.
			expect(Number(photo.getAttribute('height'))).toBeGreaterThanOrEqual(
				Number(photo.getAttribute('width'))
			);
		}
	});

	it('has horizontal photos for a wide screen, hidden on a phone', async () => {
		const { container } = render(GalleryRooms, { lang: 'es' });
		const grid = container.querySelector('.grid-rows-gallery');
		expect(grid?.classList.contains('hidden')).toBe(true);
		expect(grid?.classList.contains('md:grid')).toBe(true);
		const photos = [...(grid?.querySelectorAll('img') ?? [])];
		expect(photos).toHaveLength(WIDE_PHOTOS);
		for (const photo of photos) {
			expect(Number(photo.getAttribute('width'))).toBeGreaterThan(
				Number(photo.getAttribute('height'))
			);
		}
	});

	it('waits to load every photo, so a screen only loads the ones it shows', async () => {
		const { container } = render(GalleryRooms, { lang: 'es' });
		const photos = [...container.querySelectorAll('img')];
		expect(photos).toHaveLength(GALLERY_TALL_PHOTOS.length + WIDE_PHOTOS);
		for (const photo of photos) expect(photo.getAttribute('loading')).toBe('lazy');
	});

	it('describes every photo, each in its own words', async () => {
		const { container } = render(GalleryRooms, { lang: 'es' });
		const alts = [...container.querySelectorAll('img')].map((photo) => photo.getAttribute('alt'));
		for (const alt of alts) expect(alt).toBeTruthy();
		expect(new Set(alts).size).toBe(alts.length);
		// One description for each upright photo, no more and no fewer.
		expect(copyFor('es').home.gallery.tallAlts).toHaveLength(GALLERY_TALL_PHOTOS.length);
		expect(copyFor('en').home.gallery.tallAlts).toHaveLength(GALLERY_TALL_PHOTOS.length);
	});

	it('renders in English', async () => {
		render(GalleryRooms, { lang: 'en' });
		await expect
			.element(page.getByRole('img', { name: /Gallery corridor with reliefs/ }))
			.toBeInTheDocument();
	});

	it('accepts extra classes', async () => {
		const { container } = render(GalleryRooms, { lang: 'es', class: 'pt-4' });
		expect(container.firstElementChild?.classList.contains('pt-4')).toBe(true);
	});
});
