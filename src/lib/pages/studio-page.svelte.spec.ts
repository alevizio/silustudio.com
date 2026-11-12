import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { AT_WORK_PHOTOS } from '#lib/content/images.ts';
import StudioPage from './studio-page.svelte';

/** The film's still and the three colour photos of the workshop, besides the artists at work. */
const OWN_PHOTOS = 4;
/** Photos of the artists at work that hang among the wall texts, before the rest of the series. */
const HUNG_AT_WORK = 1;

describe('studio-page.svelte', () => {
	it('presents both artists and their statement', async () => {
		render(StudioPage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Silvestre Jacobi y Lucila Dickinson');
		await expect
			.element(page.getByText(/Su proceso creativo surge del sutil diálogo/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Diseñadora de interiores, fotógrafa y paisajista.'))
			.toBeInTheDocument();
	});

	it('renders in English with the corrected spelling', async () => {
		render(StudioPage, { lang: 'en' });
		await expect
			.element(page.getByText('Film director, lawyer and plastic artist.'))
			.toBeInTheDocument();
		await expect.element(page.getByText(/lauyer|fotographer|Curentely/)).not.toBeInTheDocument();
	});

	it("offers the artists' film and loads nothing from it until asked", async () => {
		const { container } = render(StudioPage, { lang: 'es' });
		await expect.element(page.getByRole('button', { name: 'Ver el video' })).toBeVisible();
		expect(container.querySelector('iframe')).toBeNull();
	});

	it('describes every photo', async () => {
		render(StudioPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const images = page.getByRole('img').elements();
		expect(images).toHaveLength(OWN_PHOTOS + AT_WORK_PHOTOS.length);
		for (const image of images) expect(image.getAttribute('alt')).toBeTruthy();
	});

	it('shows the artists at work, each photo with its own description', async () => {
		render(StudioPage, { lang: 'es' });
		const section = page.getByRole('region', { name: 'En el taller' });
		await expect.element(section).toBeInTheDocument();
		await expect
			.element(page.getByRole('img', { name: 'Soldando una escultura de acero, con máscara.' }))
			.toBeInTheDocument();
		expect(section.getByRole('img').elements()).toHaveLength(AT_WORK_PHOTOS.length - HUNG_AT_WORK);
	});

	it('hangs the statement as separate wall texts, the first and the last set large', async () => {
		const { container } = render(StudioPage, { lang: 'es' });
		const statement = page.getByRole('region', { name: 'Estudio' });
		await expect.element(statement).toBeInTheDocument();
		const texts = [...statement.element().querySelectorAll('p')];
		// Five paragraphs, each on its own, in the order the artists wrote them.
		expect(texts).toHaveLength(5);
		expect(texts[0].textContent).toContain('trabajan juntos');
		expect(texts[4].textContent).toContain('la luz y la sombra');
		expect(texts[0].classList.contains('text-title')).toBe(true);
		expect(texts[4].classList.contains('text-title')).toBe(true);
		expect(texts[2].classList.contains('text-title')).toBe(false);
		// And three photos hang among them, with the three films of the workshop.
		expect(statement.element().querySelectorAll('img')).toHaveLength(3);
		expect(statement.element().querySelectorAll('video')).toHaveLength(3);
		expect(container.querySelectorAll('h1')).toHaveLength(1);
	});

	it("hangs the artists' films of the workshop among the wall texts, silent and without controls", async () => {
		const { container } = render(StudioPage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible();
		const films = [...container.querySelectorAll('video')];
		expect(films).toHaveLength(3);
		for (const film of films) {
			expect(film.muted).toBe(true);
			expect(film.controls).toBe(false);
			expect(film.getAttribute('aria-label')).toMatch(/^Video sin sonido/);
		}
		// Each has its own button to stop it.
		expect(
			page.getByRole('button', { name: /el video$/ }).elements().length
		).toBeGreaterThanOrEqual(3);
	});
});
