import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StudioPage from './studio-page.svelte';

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
		expect(images).toHaveLength(4);
		for (const image of images) expect(image.getAttribute('alt')).toBeTruthy();
	});
});
