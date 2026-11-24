import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './home-page.svelte';

describe('home-page.svelte', () => {
	it('opens with a photo of the gallery, what Silu is and how to get there', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Estudio y exposición permanente de la dupla creativa SILU.');
		await expect
			.element(page.getByRole('link', { name: 'Cómo llegar' }))
			.toHaveAttribute('href', expect.stringContaining('google.com/maps/dir/'));
		await expect.element(page.getByText('Punta del Este · Uruguay', { exact: true })).toBeVisible();
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

	it('shows the works in the rooms they hang in, under the heading of the works', async () => {
		render(HomePage, { lang: 'es' });
		await expect
			.element(
				page.getByRole('heading', {
					name: 'Obras esculturales realizadas con materiales naturales.'
				})
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('img', { name: /^Una mujer camina por un pasillo blanco/ }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('img', { name: /^Escultura de anillos de acero/ }))
			.toBeInTheDocument();
	});

	it('opens on a photo in two shapes, square for a phone and horizontal for a wide screen', async () => {
		const { container } = render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const opening = container.querySelector('picture');
		const sources = [...(opening?.querySelectorAll('source') ?? [])];
		expect(sources.some((source) => source.media !== '')).toBe(true);
		expect(sources.some((source) => source.media === '')).toBe(true);
		// Its place is square on a phone and a low band on a wide screen.
		expect(opening?.parentElement?.classList.contains('aspect-square')).toBe(true);
		expect(opening?.parentElement?.classList.contains('md:aspect-facade')).toBe(true);
	});

	it('says in the artists’ own words who they are', async () => {
		render(HomePage, { lang: 'es' });
		await expect
			.element(page.getByText(/^Con más de dos décadas de trayectoria.*entre ambos mundos\.$/))
			.toBeInTheDocument();
		await expect.element(page.getByText(/“naturalismo abstracto”/)).toBeInTheDocument();
	});

	it('takes a visitor to the catalog of the works from the opening and from the works', async () => {
		render(HomePage, { lang: 'es' });
		const links = page.getByRole('link', { name: 'Catálogo', exact: true });
		expect(links.elements()).toHaveLength(2);
		for (const link of links.elements()) expect(link.getAttribute('href')).toMatch(/\/obras\/$/);
		await expect
			.element(page.getByRole('heading', { name: 'Exposición permanente.' }))
			.toBeInTheDocument();
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
			.toHaveTextContent('Studio and permanent exhibition of the creative duo SILU.');
		await expect
			.element(page.getByText('Silu · Silvestre Jacobi and Lucila Dickinson', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByRole('link', { name: 'About the studio' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/studio\/$/));
	});
});
