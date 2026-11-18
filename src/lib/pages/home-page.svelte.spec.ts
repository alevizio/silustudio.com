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

	it('opens on a photo in two shapes, upright for a phone and horizontal for a wide screen', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const opening = container.querySelector('picture');
		const sources = [...(opening?.querySelectorAll('source') ?? [])];
		expect(sources.some((source) => source.media !== '')).toBe(true);
		expect(sources.some((source) => source.media === '')).toBe(true);
		// Its place is upright on a phone and a low band on a wide screen.
		expect(opening?.parentElement?.classList.contains('aspect-tall')).toBe(true);
		expect(opening?.parentElement?.classList.contains('md:aspect-facade')).toBe(true);
	});

	it('says in the artists’ own words who they are, one paragraph after another', async () => {
		render(HomePage, { lang: 'es' });
		await expect
			.element(page.getByText(/^Con más de dos décadas de trayectoria/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/^Son creadores de su propia corriente artística/))
			.toBeInTheDocument();
		await expect.element(page.getByText(/naturalismo abstracto/)).toBeInTheDocument();
	});

	it('describes every photo of the gallery', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect
			.element(page.getByRole('img', { name: /Pasillo de la galería con relieves/ }))
			.toBeInTheDocument();
		const images = [...container.querySelectorAll('img')];
		expect(images.length).toBeGreaterThan(0);
		for (const image of images) expect(image.getAttribute('alt')).toBeTruthy();
	});

	it('hangs the film of the gallery beside the photos, silent and without controls', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const films = container.querySelectorAll('video');
		expect(films).toHaveLength(1);
		expect(films[0].muted).toBe(true);
		expect(films[0].controls).toBe(false);
		expect(films[0].getAttribute('aria-label')).toMatch(/^Película sin sonido/);
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
