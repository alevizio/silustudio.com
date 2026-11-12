import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { AT_WORK_PHOTOS } from '#lib/content/images.ts';
import PhotoColumns from './photo-columns.svelte';

const PHOTOS = AT_WORK_PHOTOS.slice(0, 3);
const ALTS = ['Primera', 'Segunda', 'Tercera'];

describe('photo-columns.svelte', () => {
	it('shows every photo with its own description', async () => {
		render(PhotoColumns, { photos: PHOTOS, alts: ALTS });
		for (const alt of ALTS) {
			await expect.element(page.getByRole('img', { name: alt })).toBeInTheDocument();
		}
		expect(page.getByRole('img').elements()).toHaveLength(3);
	});

	it('sets the photos in columns and never crops one', async () => {
		const { container } = render(PhotoColumns, { photos: PHOTOS, alts: ALTS });
		await expect.element(page.getByRole('img', { name: 'Primera' })).toBeInTheDocument();
		expect(container.firstElementChild?.classList.contains('columns-2')).toBe(true);
		expect(container.firstElementChild?.classList.contains('md:columns-3')).toBe(true);
		for (const photo of container.querySelectorAll('img')) {
			expect(photo.classList.contains('h-auto')).toBe(true);
			expect(photo.classList.contains('break-inside-avoid')).toBe(true);
			expect(photo.className).not.toMatch(/object-cover/);
		}
	});

	it('waits to load the photos until the visitor is near them', async () => {
		const { container } = render(PhotoColumns, { photos: PHOTOS, alts: ALTS });
		for (const photo of container.querySelectorAll('img')) {
			expect(photo.getAttribute('loading')).toBe('lazy');
		}
	});

	it('treats a photo with no description as decoration', async () => {
		const { container } = render(PhotoColumns, { photos: PHOTOS, alts: ['Primera'] });
		const alts = [...container.querySelectorAll('img')].map((photo) => photo.getAttribute('alt'));
		expect(alts).toEqual(['Primera', '', '']);
	});

	it('renders nothing for an empty set, without crashing', async () => {
		const { container } = render(PhotoColumns, { photos: [], alts: [] });
		expect(container.querySelectorAll('img')).toHaveLength(0);
	});

	it('accepts extra classes', async () => {
		const { container } = render(PhotoColumns, { photos: PHOTOS, alts: ALTS, class: 'pb-section' });
		expect(container.firstElementChild?.classList.contains('pb-section')).toBe(true);
	});
});
