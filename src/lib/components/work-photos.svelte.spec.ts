import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS, fullSizePhotosOf } from '#lib/content/images.ts';
import WorkPhotos from './work-photos.svelte';

/** Every full size photo on the site, to cut lists of any length from. */
const PHOTOS = PHOTOGRAPHED_WORKS.flatMap(fullSizePhotosOf);
const alt = (index: number): string => `Foto ${index + 1}`;
describe('work-photos.svelte', () => {
	it('shows every photo with its own description', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 4), alt });
		await expect.element(page.getByRole('img', { name: 'Foto 1' })).toBeInTheDocument();
		await expect.element(page.getByRole('img', { name: 'Foto 4' })).toBeInTheDocument();
		expect(page.getByRole('img').elements()).toHaveLength(4);
	});

	it('gives every photo a row of its own, whatever their number', async () => {
		const { container } = render(WorkPhotos, { photos: PHOTOS.slice(0, 4), alt });
		await expect.element(page.getByRole('img', { name: 'Foto 4' })).toBeInTheDocument();
		// The photos are stacked in one column and centred in it.
		const column = container.firstElementChild;
		expect(column?.classList.contains('flex-col')).toBe(true);
		expect(column?.classList.contains('items-center')).toBe(true);
		expect(column?.querySelectorAll('img')).toHaveLength(4);
	});

	it('never lets a photo grow past its column or past the height of the screen', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 2), alt });
		for (const image of page.getByRole('img').elements()) {
			expect(image.classList.contains('max-w-full')).toBe(true);
			expect(image.classList.contains('max-h-photo')).toBe(true);
			expect(image.classList.contains('object-contain')).toBe(true);
		}
	});

	it('waits to load photos unless they open the page', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 1), alt });
		await expect
			.element(page.getByRole('img', { name: 'Foto 1' }))
			.toHaveAttribute('loading', 'lazy');
		render(WorkPhotos, { photos: PHOTOS.slice(1, 2), alt: () => 'Primera', eager: true });
		const first = page.getByRole('img', { name: 'Primera' });
		await expect.element(first).toHaveAttribute('loading', 'eager');
		await expect.element(first).toHaveAttribute('fetchpriority', 'high');
	});

	it('renders nothing for a work with no photos, without crashing', async () => {
		const { container } = render(WorkPhotos, { photos: [], alt });
		expect(container.querySelectorAll('img')).toHaveLength(0);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkPhotos, {
			photos: PHOTOS.slice(0, 1),
			alt,
			class: 'lg:col-span-2'
		});
		expect(container.firstElementChild?.classList.contains('lg:col-span-2')).toBe(true);
	});
});
