import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS, fullSizePhotosOf } from '#lib/content/images.ts';
import WorkPhotos from './work-photos.svelte';

/** Every full size photo on the site, to cut lists of any length from. */
const PHOTOS = PHOTOGRAPHED_WORKS.flatMap(fullSizePhotosOf);
const alt = (index: number): string => `Foto ${index + 1}`;
const label = 'Fotos de la obra';

/** The dots under the row, one for each photo. */
const dotsIn = (container: Element): Element[] => [
	...container.querySelectorAll('[aria-hidden="true"] > span')
];

describe('work-photos.svelte', () => {
	it('shows every photo with its own description, as one named group', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 4), alt, label });
		const group = page.getByRole('group', { name: label });
		await expect.element(group.getByRole('img', { name: 'Foto 1' })).toBeInTheDocument();
		await expect.element(group.getByRole('img', { name: 'Foto 4' })).toBeInTheDocument();
		expect(group.getByRole('img').elements()).toHaveLength(4);
	});

	it('puts the photos in one row to swipe through, and one under another on a wide screen', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 4), alt, label });
		const row = page.getByRole('group', { name: label });
		await expect.element(row).toHaveClass(/(^| )snap-x( |$)/);
		await expect.element(row).toHaveClass(/(^| )overflow-x-auto( |$)/);
		await expect.element(row).toHaveClass(/(^| )lg:flex-col( |$)/);
		await expect.element(row).toHaveClass(/(^| )lg:overflow-visible( |$)/);
		for (const image of row.getByRole('img').elements()) {
			expect(image.classList.contains('snap-start')).toBe(true);
			// Each leaves the edge of the next one in view.
			expect(image.classList.contains('max-w-swipe')).toBe(true);
		}
	});

	it('never lets a photo grow past the height of the screen or past its column', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 2), alt, label });
		await expect.element(page.getByRole('img', { name: 'Foto 2' })).toBeInTheDocument();
		for (const image of page.getByRole('img').elements()) {
			expect(image.classList.contains('max-h-photo')).toBe(true);
			expect(image.classList.contains('lg:max-w-full')).toBe(true);
			expect(image.classList.contains('object-contain')).toBe(true);
			// Held back by the height of the screen, a photo keeps to the left of its place in
			// the row, and to the middle of its column on a wide screen.
			expect(image.classList.contains('object-left')).toBe(true);
			expect(image.classList.contains('lg:object-center')).toBe(true);
		}
	});

	it('loads the first photo at once and waits to load the others', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 3), alt, label });
		const first = page.getByRole('img', { name: 'Foto 1' });
		await expect.element(first).toHaveAttribute('loading', 'eager');
		await expect.element(first).toHaveAttribute('fetchpriority', 'high');
		for (const name of ['Foto 2', 'Foto 3']) {
			await expect.element(page.getByRole('img', { name })).toHaveAttribute('loading', 'lazy');
		}
	});

	it('lets the first photo travel between pages, and none of the others', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 3), alt, label });
		await expect.element(page.getByRole('img', { name: 'Foto 1' })).toHaveClass(/travelling-photo/);
		for (const name of ['Foto 2', 'Foto 3']) {
			await expect.element(page.getByRole('img', { name })).not.toHaveClass(/travelling-photo/);
		}
	});

	it('lets only the first photo give the row its height, until a visitor swipes', async () => {
		render(WorkPhotos, { photos: PHOTOS.slice(0, 3), alt, label });
		await expect.element(page.getByRole('img', { name: 'Foto 1' })).not.toHaveClass(/-mb-photo/);
		for (const name of ['Foto 2', 'Foto 3']) {
			const later = page.getByRole('img', { name });
			await expect.element(later).toHaveClass(/(^| )-mb-photo( |$)/);
			// Stacked on a wide screen, or with no scripts to follow the swipe, every photo counts.
			await expect.element(later).toHaveClass(/(^| )lg:mb-0( |$)/);
			await expect.element(later).toHaveClass(/(^| )noscript:mb-0( |$)/);
		}
	});

	it('shows one dot for each photo, the first one marked, and keeps them from screen readers', async () => {
		const { container } = render(WorkPhotos, { photos: PHOTOS.slice(0, 3), alt, label });
		await expect.element(page.getByRole('img', { name: 'Foto 3' })).toBeInTheDocument();
		const dots = dotsIn(container);
		expect(dots).toHaveLength(3);
		expect(dots.map((dot) => dot.classList.contains('bg-ink'))).toEqual([true, false, false]);
		// The dots are for the swiped row only.
		expect(dots[0].parentElement?.classList.contains('lg:hidden')).toBe(true);
	});

	it('shows a single photo whole, with no dots and nothing peeking', async () => {
		const { container } = render(WorkPhotos, { photos: PHOTOS.slice(0, 1), alt, label });
		const only = page.getByRole('img', { name: 'Foto 1' });
		await expect.element(only).toHaveClass(/(^| )max-w-full( |$)/);
		await expect.element(only).not.toHaveClass(/max-w-swipe/);
		expect(dotsIn(container)).toHaveLength(0);
	});

	it('renders nothing for a work with no photos, without crashing', async () => {
		const { container } = render(WorkPhotos, { photos: [], alt, label });
		await expect.element(page.getByRole('group', { name: label })).toBeInTheDocument();
		expect(container.querySelectorAll('img')).toHaveLength(0);
		expect(dotsIn(container)).toHaveLength(0);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkPhotos, {
			photos: PHOTOS.slice(0, 1),
			alt,
			label,
			class: 'lg:col-span-2'
		});
		expect(container.firstElementChild?.classList.contains('lg:col-span-2')).toBe(true);
	});
});
