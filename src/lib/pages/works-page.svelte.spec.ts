import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { LISTED_WORKS, PHOTOGRAPHED_WORKS } from '#lib/content/images.ts';
import { WORKS } from '#lib/content/works.ts';
import WorksPage from './works-page.svelte';

describe('works-page.svelte', () => {
	it('hangs every work that has a full size photo under the page title', async () => {
		render(WorksPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Obras');
		const wall = page.getByRole('list', { name: 'Obras' });
		expect(wall.getByRole('listitem').elements()).toHaveLength(PHOTOGRAPHED_WORKS.length);
	});

	it('hangs the catalog works that only have small photos under their own heading', async () => {
		render(WorksPage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { name: `${LISTED_WORKS.length} obras más del catálogo` }))
			.toBeInTheDocument();
		const catalog = page.getByRole('list', { name: 'Catálogo' });
		expect(catalog.getByRole('listitem').elements()).toHaveLength(LISTED_WORKS.length);
		await expect.element(catalog).toHaveClass(/lg:grid-cols-3/);
	});

	it('shows every work exactly once', async () => {
		const { container } = render(WorksPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const links = [...container.querySelectorAll('ul[aria-label] a')].map((link) =>
			link.getAttribute('href')
		);
		expect(links).toHaveLength(WORKS.length);
		expect(new Set(links).size).toBe(WORKS.length);
	});

	it('offers the catalog PDF and two ways to ask about a work, in English', async () => {
		render(WorksPage, { lang: 'en' });
		await expect
			.element(page.getByRole('link', { name: 'See the catalog as a PDF' }))
			.toHaveAttribute('href', expect.stringContaining('drive.google.com'));
		await expect
			.element(page.getByRole('link', { name: 'Message on WhatsApp' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'Send an email' }))
			.toHaveAttribute('href', 'mailto:info@silustudio.com');
	});

	it('shows works in the homes of the people who bought them', async () => {
		render(WorksPage, { lang: 'en' });
		const section = page.getByRole('region', { name: 'In homes' });
		await expect.element(section).toBeInTheDocument();
		expect(section.getByRole('img').elements()).toHaveLength(10);
		await expect
			.element(page.getByRole('img', { name: 'A round blue work above a sofa.' }))
			.toBeInTheDocument();
	});
});
