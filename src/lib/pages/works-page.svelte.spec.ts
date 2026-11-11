import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PHOTOGRAPHED_WORKS, WORKS } from '#lib/content/works.ts';
import WorksPage from './works-page.svelte';

describe('works-page.svelte', () => {
	it('lists the whole catalog under the page title', async () => {
		render(WorksPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Obras');
		await expect
			.element(page.getByRole('heading', { name: 'Las 34 obras del catálogo' }))
			.toBeInTheDocument();
		expect(page.getByRole('listitem').elements()).toHaveLength(WORKS.length);
	});

	it('labels each photographed work once on the wall and once in the list', async () => {
		render(WorksPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		expect(page.getByRole('heading', { level: 3 }).elements()).toHaveLength(
			WORKS.length + PHOTOGRAPHED_WORKS.length
		);
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
});
