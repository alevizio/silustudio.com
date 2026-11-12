import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { CATALOG_WORKS, findWork, type Work } from '#lib/content/works.ts';
import WorkLabel from './work-label.svelte';

const duna = CATALOG_WORKS[6];
const untitled: Work = findWork('obra-41') ?? { slug: 'obra-41', ref: 41 };

describe('work-label.svelte', () => {
	it('gives the title, size and material of a work', async () => {
		render(WorkLabel, { lang: 'es', work: duna });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Duna bañada en peltre');
		await expect.element(page.getByText('Medidas')).toBeVisible();
		await expect.element(page.getByText('3 piezas · 100 × 185 × 22 cm')).toBeVisible();
		await expect.element(page.getByText('Material', { exact: true })).toBeVisible();
		await expect.element(page.getByText(/Relieve con tela punzada/)).toBeVisible();
	});

	it('shows no tag until a status is known, then shows it over the title', async () => {
		const bare = render(WorkLabel, { lang: 'es', work: { ...duna, status: undefined } });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		expect(bare.container.textContent).not.toMatch(/En la galería|Vendida|Reservada|Disponible/);
		bare.unmount();

		const tagged = render(WorkLabel, { lang: 'es', work: { ...duna, status: 'onView' } });
		const tag = page.getByText('En la galería');
		await expect.element(tag).toBeVisible();
		const heading = tagged.container.querySelector('h1');
		// The tag comes before the title, in the page and for a screen reader.
		expect(
			tag.element().compareDocumentPosition(heading ?? document.body) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('says a work is sold', async () => {
		render(WorkLabel, { lang: 'en', work: { ...duna, status: 'sold' } });
		await expect.element(page.getByText('Sold')).toBeVisible();
	});

	it('lets the visitor ask about a work by its title', async () => {
		render(WorkLabel, { lang: 'en', work: duna });
		const whatsapp = page.getByRole('link', { name: 'Ask on WhatsApp' });
		await expect
			.element(whatsapp)
			.toHaveAttribute('href', expect.stringContaining('wa.me/59895342939?text='));
		await expect
			.element(whatsapp)
			.toHaveAttribute(
				'href',
				expect.stringContaining(encodeURIComponent('Duna bañada en peltre'))
			);
		await expect
			.element(page.getByRole('link', { name: 'Send an email' }))
			.toHaveAttribute('href', expect.stringContaining('mailto:info@silustudio.com?subject='));
	});

	it('shows a work with no title yet without inventing one', async () => {
		render(WorkLabel, { lang: 'es', work: untitled });
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Obra 41');
		await expect
			.element(page.getByText('Consultanos por el título, las medidas y el material de esta obra.'))
			.toBeVisible();
		await expect.element(page.getByText('Medidas', { exact: true })).not.toBeInTheDocument();
	});

	it('asks about a work with no title by the address of its page', async () => {
		render(WorkLabel, { lang: 'es', work: untitled });
		const address = encodeURIComponent(`${location.origin}/obras/obra-41/`);
		await expect
			.element(page.getByRole('link', { name: 'Consultar por WhatsApp' }))
			.toHaveAttribute('href', expect.stringContaining(address));
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkLabel, { lang: 'es', work: duna, class: 'lg:sticky' });
		expect(container.firstElementChild?.classList.contains('lg:sticky')).toBe(true);
	});
});
