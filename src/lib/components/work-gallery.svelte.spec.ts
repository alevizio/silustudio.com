import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { photosOf } from '#lib/content/images.ts';
import { WORKS } from '#lib/content/works.ts';
import WorkGallery from './work-gallery.svelte';

// Dar es recibir has one full size photo; Infinito has three catalog photos.
const onePhoto = photosOf(WORKS[28]);
const threePhotos = photosOf(WORKS[22]);
const props = {
	alt: (n: number, total: number) => `Foto ${n} de ${total}`,
	showLabel: (n: number) => `Ver la foto ${n}`,
	label: 'Fotos de la obra'
};

describe('work-gallery.svelte', () => {
	it('shows the first photo large', async () => {
		render(WorkGallery, { ...props, photos: threePhotos });
		await expect.element(page.getByRole('img', { name: 'Foto 1 de 3' })).toBeInTheDocument();
	});

	it('offers one button per photo and marks the one being shown', async () => {
		render(WorkGallery, { ...props, photos: threePhotos });
		const list = page.getByRole('list', { name: 'Fotos de la obra' });
		await expect.element(list).toBeVisible();
		expect(list.getByRole('button').elements()).toHaveLength(3);
		await expect
			.element(page.getByRole('button', { name: 'Ver la foto 1' }))
			.toHaveAttribute('aria-pressed', 'true');
	});

	it('swaps the large photo when another one is chosen', async () => {
		render(WorkGallery, { ...props, photos: threePhotos });
		await page.getByRole('button', { name: 'Ver la foto 3' }).click();
		await expect.element(page.getByRole('img', { name: 'Foto 3 de 3' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Ver la foto 3' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Ver la foto 1' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('shows a single photo without any buttons', async () => {
		render(WorkGallery, { ...props, photos: onePhoto });
		await expect.element(page.getByRole('img', { name: 'Foto 1 de 1' })).toBeInTheDocument();
		expect(page.getByRole('button').elements()).toHaveLength(0);
	});

	it('renders nothing when there are no photos', async () => {
		const { container } = render(WorkGallery, { ...props, photos: [] });
		expect(container.querySelector('img')).toBeNull();
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkGallery, {
			...props,
			photos: onePhoto,
			class: 'lg:col-span-7'
		});
		expect(container.firstElementChild?.classList.contains('lg:col-span-7')).toBe(true);
	});
});
