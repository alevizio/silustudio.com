import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { CATALOG_WORKS } from '#lib/content/works.ts';
import WorksIndex from './works-index.svelte';

describe('works-index.svelte', () => {
	it('lists every work it is given with a heading and an anchor', async () => {
		const { container } = render(WorksIndex, { works: CATALOG_WORKS, lang: 'es' });
		await expect.element(page.getByRole('list')).toBeVisible();
		expect(page.getByRole('listitem').elements()).toHaveLength(CATALOG_WORKS.length);
		expect(container.querySelector('#duna-banada-en-peltre')).not.toBeNull();
		await expect.element(page.getByRole('heading', { name: /Simbiosis/ })).toBeInTheDocument();
	});

	it('links every row to the page of its work', async () => {
		render(WorksIndex, { works: CATALOG_WORKS.slice(0, 3), lang: 'es' });
		await expect
			.element(page.getByRole('link', { name: 'Impronta humana' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/impronta-humana\/?$/));
		expect(page.getByRole('link').elements()).toHaveLength(3);
	});

	it('shows a status only on the works that have one', async () => {
		const works = [{ ...CATALOG_WORKS[0], status: 'reserved' as const }, CATALOG_WORKS[1]];
		render(WorksIndex, { works, lang: 'es' });
		await expect.element(page.getByText('Reservada')).toBeVisible();
		expect(page.getByText(/Disponible|Vendida/).elements()).toHaveLength(0);
	});

	it('shows technique and size in the page language', async () => {
		render(WorksIndex, { works: CATALOG_WORKS.slice(0, 3), lang: 'en' });
		await expect.element(page.getByText('Carved wood coated in sand')).toBeVisible();
		await expect.element(page.getByText('Various sizes')).toBeVisible();
	});

	it('renders an empty list without crashing', async () => {
		render(WorksIndex, { works: [], lang: 'es' });
		await expect.element(page.getByRole('list')).toBeInTheDocument();
		expect(page.getByRole('listitem').elements()).toHaveLength(0);
	});

	it('accepts extra classes', async () => {
		render(WorksIndex, { works: CATALOG_WORKS.slice(0, 1), lang: 'es', class: 'mt-8' });
		await expect.element(page.getByRole('list')).toHaveClass(/mt-8/);
	});
});
