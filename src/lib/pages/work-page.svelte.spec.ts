import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { LISTED_WORKS, ORDERED_WORKS, PHOTOGRAPHED_WORKS } from '#lib/content/images.ts';
import { CATALOG_WORKS, catalogNumber, findWork, type Work } from '#lib/content/works.ts';
import WorkPage from './work-page.svelte';

const duna = CATALOG_WORKS[6];
const first = ORDERED_WORKS[0];
const last = ORDERED_WORKS[ORDERED_WORKS.length - 1];

const work = (slug: string): Work => {
	const found = findWork(slug);
	if (!found) throw new Error(`No work is called ${slug}`);
	return found;
};

const untitled = work('obra-41');
const place = (of: Work): string =>
	`${catalogNumber(ORDERED_WORKS.indexOf(of) + 1)} / ${catalogNumber(ORDERED_WORKS.length)}`;

describe('work-page.svelte', () => {
	it('shows the title, size and material of the work, and its place among the works', async () => {
		render(WorkPage, { lang: 'es', work: duna });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Duna bañada en peltre');
		await expect.element(page.getByText('Medidas')).toBeVisible();
		await expect.element(page.getByText('3 piezas · 100 × 185 × 22 cm')).toBeVisible();
		await expect.element(page.getByText('Material', { exact: true })).toBeVisible();
		await expect.element(page.getByText(/Relieve con tela punzada/)).toBeVisible();
		await expect.element(page.getByText(place(duna))).toBeVisible();
	});

	it('shows every photo of the work', async () => {
		render(WorkPage, { lang: 'es', work: work('guijarro') });
		for (const n of [1, 2, 3]) {
			await expect
				.element(page.getByRole('img', { name: `Guijarro, foto ${n} de 3.` }))
				.toBeInTheDocument();
		}
		expect(page.getByRole('img').elements()).toHaveLength(3);
	});

	it('loads the first photo at once and the others later', async () => {
		render(WorkPage, { lang: 'es', work: work('guijarro') });
		await expect
			.element(page.getByRole('img', { name: 'Guijarro, foto 1 de 3.' }))
			.toHaveAttribute('loading', 'eager');
		await expect
			.element(page.getByRole('img', { name: 'Guijarro, foto 2 de 3.' }))
			.toHaveAttribute('loading', 'lazy');
	});

	it('leaves the tag out until a status is known, then shows it', async () => {
		const { container, unmount } = render(WorkPage, { lang: 'es', work: duna });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		expect(container.textContent).not.toMatch(/En la galería|Vendida|Reservada|Disponible/);
		unmount();
		render(WorkPage, { lang: 'es', work: { ...duna, status: 'reserved' } });
		await expect.element(page.getByText('Reservada')).toBeVisible();
	});

	it('lets the photo that opens the page travel, and none of the others', async () => {
		render(WorkPage, { lang: 'es', work: work('guijarro') });
		await expect
			.element(page.getByRole('img', { name: 'Guijarro, foto 1 de 3.' }))
			.toHaveClass(/travelling-photo/);
		await expect
			.element(page.getByRole('img', { name: 'Guijarro, foto 2 de 3.' }))
			.not.toHaveClass(/travelling-photo/);
	});

	it('has arrows to the works before and after, by the place of the work', async () => {
		const second = PHOTOGRAPHED_WORKS[1];
		render(WorkPage, { lang: 'es', work: second });
		const pager = page.getByRole('navigation', { name: 'Recorrer las obras' });
		await expect
			.element(pager.getByRole('link', { name: /^Obra anterior/ }))
			.toHaveAttribute(
				'href',
				expect.stringMatching(new RegExp(`/obras/${PHOTOGRAPHED_WORKS[0].slug}/?$`))
			);
		await expect
			.element(pager.getByRole('link', { name: /^Obra siguiente/ }))
			.toHaveAttribute(
				'href',
				expect.stringMatching(new RegExp(`/obras/${PHOTOGRAPHED_WORKS[2].slug}/?$`))
			);
		await expect.element(pager.getByText(place(second))).toBeVisible();
	});

	it('lets the visitor ask about a work by its title', async () => {
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

	it('shows a work with no title yet without inventing one', async () => {
		render(WorkPage, { lang: 'es', work: untitled });
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Obra 41');
		await expect
			.element(page.getByText('Consultanos por el título, las medidas y el material de esta obra.'))
			.toBeVisible();
		await expect.element(page.getByText('Medidas', { exact: true })).not.toBeInTheDocument();
		await expect.element(page.getByText('Material', { exact: true })).not.toBeInTheDocument();
	});

	it('lets the visitor ask about a work with no title by the address of its page', async () => {
		render(WorkPage, { lang: 'es', work: untitled });
		const address = encodeURIComponent(`${location.origin}/obras/obra-41/`);
		await expect
			.element(page.getByRole('link', { name: 'Consultar por WhatsApp' }))
			.toHaveAttribute('href', expect.stringContaining(address));
		const mail = page.getByRole('link', { name: 'Enviar un correo' });
		await expect
			.element(mail)
			.toHaveAttribute(
				'href',
				expect.stringContaining(`subject=${encodeURIComponent('Consulta por una obra')}`)
			);
		await expect.element(mail).toHaveAttribute('href', expect.stringContaining(`body=`));
		await expect.element(mail).toHaveAttribute('href', expect.stringContaining(address));
	});

	it('links back to the list and to the works before and after', async () => {
		const second = PHOTOGRAPHED_WORKS[1];
		render(WorkPage, { lang: 'es', work: second });
		// The way back leads to the work's own place on the wall.
		await expect
			.element(page.getByRole('link', { name: 'Obras', exact: true }))
			.toHaveAttribute('href', expect.stringMatching(new RegExp(`/obras/#${second.slug}$`)));
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		expect(
			nav
				.getByRole('link')
				.elements()
				.map((link) => link.getAttribute('href'))
		).toEqual([
			expect.stringMatching(new RegExp(`/obras/${PHOTOGRAPHED_WORKS[0].slug}/?$`)),
			expect.stringMatching(new RegExp(`/obras/${PHOTOGRAPHED_WORKS[2].slug}/?$`))
		]);
		await expect.element(nav.getByRole('link', { name: 'Guijarro' })).toBeVisible();
	});

	it('calls a neighbour with no title the previous or the next work', async () => {
		render(WorkPage, { lang: 'es', work: untitled });
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		await expect.element(nav.getByRole('link', { name: 'Obra anterior' })).toBeVisible();
		await expect.element(nav.getByRole('link', { name: 'Obra siguiente' })).toBeVisible();
	});

	it('goes from the last work on the wall to the first of the list', async () => {
		const lastOnWall = PHOTOGRAPHED_WORKS[PHOTOGRAPHED_WORKS.length - 1];
		render(WorkPage, { lang: 'es', work: lastOnWall });
		await expect
			.element(page.getByRole('navigation', { name: 'Otras obras' }).getByRole('link').last())
			.toHaveAttribute(
				'href',
				expect.stringMatching(new RegExp(`/obras/${LISTED_WORKS[0].slug}/?$`))
			);
	});

	it('has only one neighbour at each end', async () => {
		render(WorkPage, { lang: 'es', work: first });
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		await expect.element(nav).toBeVisible();
		expect(nav.getByRole('link').elements()).toHaveLength(1);
		render(WorkPage, { lang: 'en', work: last });
		const navEnd = page.getByRole('navigation', { name: 'Other works' });
		await expect.element(navEnd).toBeVisible();
		expect(navEnd.getByRole('link').elements()).toHaveLength(1);
	});
});
