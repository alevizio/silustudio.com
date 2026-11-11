import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './home-page.svelte';

const FEATURED_WORKS = 4;

describe('home-page.svelte', () => {
	it('opens with a photo of the gallery, what Silu is and how to get there', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Galería y estudio de arte en Manantiales, Punta del Este.');
		await expect
			.element(page.getByRole('link', { name: 'Cómo llegar' }))
			.toHaveAttribute('href', expect.stringContaining('google.com/maps/dir/'));
		await expect.element(page.getByText(/Ruta 10, km 163\.5 · Manantiales/)).toBeVisible();
		// The line over the headline says whose gallery it is.
		await expect
			.element(page.getByText('Silu · Silvestre Jacobi y Lucila Dickinson', { exact: true }))
			.toBeVisible();
		// The photo comes before any text.
		expect(container.querySelector('img')?.getAttribute('alt')).toContain(
			'Interior de la galería Silu'
		);
		expect(container.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
	});

	it('hangs four works, each one a link to its page', async () => {
		render(HomePage, { lang: 'es' });
		await expect
			.element(
				page.getByRole('heading', {
					name: 'Obras en arena, cuarzo, piedra caliza, madera y nácar.'
				})
			)
			.toBeInTheDocument();
		const wall = page.getByRole('list', { name: 'Obras' });
		expect(wall.getByRole('listitem').elements()).toHaveLength(FEATURED_WORKS);
		await expect
			.element(wall.getByRole('link', { name: 'Guijarro' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/guijarro\/?$/));
	});

	it('describes every photo of the gallery', async () => {
		render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect
			.element(page.getByRole('img', { name: /Vista larga de la galería/ }))
			.toBeInTheDocument();
		for (const image of page.getByRole('img').elements()) {
			expect(image.getAttribute('alt')).toBeTruthy();
		}
	});

	it('renders in English', async () => {
		render(HomePage, { lang: 'en' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Art gallery and studio in Manantiales, Punta del Este.');
		await expect
			.element(page.getByText('Silu · Silvestre Jacobi and Lucila Dickinson', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByRole('link', { name: 'About the studio' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/studio\/$/));
	});
});
