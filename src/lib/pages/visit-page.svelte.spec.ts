import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisitPage from './visit-page.svelte';

describe('visit-page.svelte', () => {
	it('gives the address and a way to get directions', async () => {
		const { container } = render(VisitPage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Visitar la galería');
		expect(container.querySelector('address')?.textContent).toContain('Ruta 10, km 163.5');
		await expect.element(page.getByRole('link', { name: 'Cómo llegar' })).toBeInTheDocument();
	});

	it('closes on a map of where the gallery is, drawn for the site', async () => {
		const { container } = render(VisitPage, { lang: 'en' });
		await expect
			.element(
				page.getByRole('region', { name: 'Map: location of the Silu gallery in Manantiales' })
			)
			.toBeVisible();
		await expect
			.element(page.getByRole('img', { name: /^Map of the coast between Punta del Este/ }))
			.toBeVisible();
		// Nothing is asked of Google until the visitor wants its map.
		expect(container.querySelector('iframe')).toBeNull();
	});

	it('renders in English', async () => {
		render(VisitPage, { lang: 'en' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Visit the gallery');
	});
});
