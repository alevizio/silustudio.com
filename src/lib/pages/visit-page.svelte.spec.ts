import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisitPage from './visit-page.svelte';

describe('visit-page.svelte', () => {
	it('gives the address and a way to get directions', async () => {
		render(VisitPage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Visitar la galería');
		await expect.element(page.getByText(/Ruta 10, km 163.5/)).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'Cómo llegar' })).toBeInTheDocument();
	});

	it('includes a titled map of the gallery location', async () => {
		const { container } = render(VisitPage, { lang: 'en' });
		const map = container.querySelector('iframe');
		expect(map?.getAttribute('title')).toBe('Map: location of the Silu gallery in Manantiales');
		expect(map?.getAttribute('src')).toContain('-34.9051398,-54.8278289');
	});

	it('renders in English', async () => {
		render(VisitPage, { lang: 'en' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Visit the gallery');
	});
});
