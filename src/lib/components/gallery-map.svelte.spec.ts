import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import GalleryMap from './gallery-map.svelte';

describe('gallery-map.svelte', () => {
	it('opens as the drawn map, with nothing loaded from Google', async () => {
		const { container } = render(GalleryMap, { lang: 'es' });
		await expect
			.element(
				page.getByRole('region', { name: 'Mapa: ubicación de la galería Silu en Manantiales' })
			)
			.toBeVisible();
		await expect.element(page.getByRole('img', { name: /^Mapa de la costa/ })).toBeVisible();
		expect(container.querySelector('iframe')).toBeNull();
	});

	it('credits OpenStreetMap, whose data the map is drawn from', async () => {
		render(GalleryMap, { lang: 'es' });
		const credit = page.getByRole('link', { name: '© OpenStreetMap' });
		await expect.element(credit).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
		await expect.element(credit).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('swaps in the interactive map when the visitor asks for it, and moves the focus there', async () => {
		const { container } = render(GalleryMap, { lang: 'es' });
		await page.getByRole('button', { name: 'Ver mapa interactivo' }).click();
		const map = container.querySelector('iframe');
		expect(map?.getAttribute('title')).toBe('Mapa: ubicación de la galería Silu en Manantiales');
		expect(map?.getAttribute('src')).toContain('-34.9051398,-54.8278289');
		expect(document.activeElement).toBe(map);
		// The drawing and its button have made way for it.
		expect(container.querySelector('[role="img"]')).toBeNull();
		expect(container.querySelector('button')).toBeNull();
	});

	it('speaks English', async () => {
		render(GalleryMap, { lang: 'en' });
		await expect
			.element(page.getByRole('button', { name: 'Open the interactive map' }))
			.toBeVisible();
	});

	it('accepts extra classes', async () => {
		const { container } = render(GalleryMap, { lang: 'es', class: 'pb-section' });
		expect(container.firstElementChild?.classList.contains('pb-section')).toBe(true);
	});
});
