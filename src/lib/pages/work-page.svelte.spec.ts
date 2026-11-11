import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { WORKS } from '#lib/content/works.ts';
import WorkPage from './work-page.svelte';

const first = WORKS[0];
const duna = WORKS[6];
const last = WORKS[WORKS.length - 1];

describe('work-page.svelte', () => {
	it('shows the title, size and material of the work', async () => {
		render(WorkPage, { lang: 'es', work: duna });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Duna bañada en peltre');
		await expect.element(page.getByText('Medidas')).toBeVisible();
		await expect.element(page.getByText('3 piezas · 100 × 185 × 22 cm')).toBeVisible();
		await expect.element(page.getByText('Material', { exact: true })).toBeVisible();
		await expect.element(page.getByText(/Relieve con tela punzada/)).toBeVisible();
		await expect.element(page.getByText('07 / 34')).toBeVisible();
	});

	it('shows the photos of the work, the first one large', async () => {
		render(WorkPage, { lang: 'es', work: duna });
		await expect
			.element(page.getByRole('img', { name: 'Duna bañada en peltre, foto 1 de 2.' }))
			.toBeInTheDocument();
		expect(
			page.getByRole('list', { name: 'Fotos de la obra' }).getByRole('button').elements()
		).toHaveLength(2);
	});

	it('leaves the status out until it is confirmed, then shows it', async () => {
		render(WorkPage, { lang: 'es', work: duna });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect.element(page.getByText('Estado')).not.toBeInTheDocument();
		render(WorkPage, { lang: 'es', work: { ...duna, status: 'reserved' } });
		await expect.element(page.getByText('Estado')).toBeVisible();
		await expect.element(page.getByText('Reservada')).toBeVisible();
	});

	it('lets the visitor ask about this work by name', async () => {
		render(WorkPage, { lang: 'en', work: duna });
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

	it('links back to the list and to the works before and after', async () => {
		render(WorkPage, { lang: 'es', work: duna });
		await expect
			.element(page.getByRole('link', { name: 'Obras' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/$/));
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		await expect
			.element(nav.getByRole('link', { name: 'Desde el centro del ser' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/desde-el-centro-del-ser\/?$/));
		await expect
			.element(nav.getByRole('link', { name: 'Avance sostenido' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/avance-sostenido\/?$/));
	});

	it('has only one neighbour at each end of the catalog', async () => {
		render(WorkPage, { lang: 'es', work: first });
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		await expect.element(nav.getByRole('link', { name: 'Salto al vacío' })).toBeVisible();
		expect(nav.getByRole('link').elements()).toHaveLength(1);
		render(WorkPage, { lang: 'en', work: last });
		const navEnd = page.getByRole('navigation', { name: 'Other works' });
		await expect.element(navEnd.getByRole('link', { name: 'Equilibrio silencioso' })).toBeVisible();
		expect(navEnd.getByRole('link').elements()).toHaveLength(1);
	});
});
