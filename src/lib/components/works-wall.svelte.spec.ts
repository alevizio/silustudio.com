import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS } from '#lib/content/images.ts';
import { WORKS, type Work } from '#lib/content/works.ts';
import WorksWall from './works-wall.svelte';

const bySlug = (slug: string): Work[] => WORKS.filter((work) => work.slug === slug);

const guijarro = bySlug('guijarro');
const untitled = bySlug('obra-41');
/** A catalog work that only has the small catalog photos. */
const listed = bySlug('duna-banada-en-peltre');

describe('works-wall.svelte', () => {
	it('hangs a work with its photo, its title and its size, linked to its page', async () => {
		render(WorksWall, { works: guijarro, lang: 'es', label: 'Obras' });
		const wall = page.getByRole('list', { name: 'Obras' });
		await expect.element(wall).toBeVisible();
		await expect
			.element(page.getByRole('img', { name: 'Guijarro. Madera tallada revestida en arena.' }))
			.toBeInTheDocument();
		await expect
			.element(wall.getByRole('link', { name: 'Guijarro' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/guijarro\/?$/));
		await expect.element(page.getByText('Tamaños varios')).toBeVisible();
	});

	it('hangs every work that has a full size photo', async () => {
		render(WorksWall, { works: PHOTOGRAPHED_WORKS, lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toBeVisible();
		expect(page.getByRole('listitem').elements()).toHaveLength(PHOTOGRAPHED_WORKS.length);
		expect(page.getByRole('link').elements()).toHaveLength(PHOTOGRAPHED_WORKS.length);
	});

	it('shows no title for a work that has none, and still opens its page', async () => {
		render(WorksWall, { works: untitled, lang: 'es', label: 'Obras' });
		const link = page.getByRole('link', { name: 'Obra 41' });
		await expect
			.element(link)
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/obra-41\/?$/));
		// The name is there for screen readers only.
		await expect.element(page.getByText('Obra 41')).toHaveClass(/sr-only/);
		await expect.element(page.getByRole('img', { name: 'Obra 41.' })).toBeInTheDocument();
	});

	it('hangs a catalog work that only has small photos with its photo from the catalog', async () => {
		render(WorksWall, { works: listed, lang: 'es', label: 'Catálogo' });
		const wall = page.getByRole('list', { name: 'Catálogo' });
		await expect
			.element(wall.getByRole('link', { name: 'Duna bañada en peltre' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/duna-banada-en-peltre\/?$/));
		await expect
			.element(page.getByRole('img', { name: /^Duna bañada en peltre\. Relieve/ }))
			.toBeInTheDocument();
	});

	it('leaves out a work that has no photo at all', async () => {
		const noPhotos: Work = { slug: 'sin-fotos', title: 'Sin fotos' };
		render(WorksWall, { works: [noPhotos, ...guijarro], lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('link', { name: 'Guijarro' })).toBeVisible();
		expect(page.getByRole('listitem').elements()).toHaveLength(1);
	});

	it('hangs two works to a row unless it is asked for three', async () => {
		render(WorksWall, { works: guijarro, lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toHaveClass(/md:grid-cols-2/);
		render(WorksWall, { works: listed, lang: 'es', label: 'Catálogo', columns: 3 });
		await expect
			.element(page.getByRole('list', { name: 'Catálogo' }))
			.toHaveClass(/lg:grid-cols-3/);
	});

	it('lets a link point at a work on the wall', async () => {
		const { container } = render(WorksWall, { works: guijarro, lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toBeVisible();
		expect(container.querySelector('li#guijarro')).not.toBeNull();
	});

	it('shows a status only on the works that have one', async () => {
		const works: Work[] = [{ ...guijarro[0], status: 'sold' }, ...untitled];
		render(WorksWall, { works, lang: 'es', label: 'Obras' });
		await expect.element(page.getByText('Vendida')).toBeVisible();
		expect(page.getByText(/Disponible|Reservada/).elements()).toHaveLength(0);
	});

	it('loads its first row at once when it opens the page, and the rest later', async () => {
		const works = PHOTOGRAPHED_WORKS.slice(0, 3);
		render(WorksWall, { works, lang: 'es', label: 'Obras', opensPage: true });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toBeVisible();
		const loading = page
			.getByRole('img')
			.elements()
			.map((image) => image.getAttribute('loading'));
		expect(loading).toEqual(['eager', 'eager', 'lazy']);
	});

	it('waits to load every photo when it sits further down a page', async () => {
		render(WorksWall, { works: PHOTOGRAPHED_WORKS.slice(0, 3), lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toBeVisible();
		const loading = page
			.getByRole('img')
			.elements()
			.map((image) => image.getAttribute('loading'));
		expect(loading).toEqual(['lazy', 'lazy', 'lazy']);
	});

	it('writes the size and the stand-in name in the page language', async () => {
		render(WorksWall, { works: [...guijarro, ...untitled], lang: 'en', label: 'Works' });
		await expect.element(page.getByText('Various sizes')).toBeVisible();
		await expect.element(page.getByRole('link', { name: 'Work 41' })).toBeInTheDocument();
	});

	it('renders an empty wall without crashing', async () => {
		render(WorksWall, { works: [], lang: 'es', label: 'Obras' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toBeInTheDocument();
		expect(page.getByRole('listitem').elements()).toHaveLength(0);
	});

	it('accepts extra classes', async () => {
		render(WorksWall, { works: guijarro, lang: 'es', label: 'Obras', class: 'mt-8' });
		await expect.element(page.getByRole('list', { name: 'Obras' })).toHaveClass(/mt-8/);
	});
});
