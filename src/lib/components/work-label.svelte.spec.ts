import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { WORKS } from '#lib/content/works.ts';
import WorkLabel from './work-label.svelte';

const duna = WORKS[6];

describe('work-label.svelte', () => {
	it('shows the catalog number, title, technique and size in Spanish', async () => {
		render(WorkLabel, { work: duna, lang: 'es' });
		await expect.element(page.getByRole('heading', { level: 3 })).toHaveTextContent('07');
		await expect
			.element(page.getByRole('heading', { level: 3 }))
			.toHaveTextContent('Duna bañada en peltre');
		await expect.element(page.getByText(/Relieve con tela punzada/)).toBeVisible();
		await expect.element(page.getByText('3 piezas · 100 × 185 × 22 cm')).toBeVisible();
	});

	it('translates technique and size but keeps the Spanish title', async () => {
		render(WorkLabel, { work: duna, lang: 'en' });
		await expect.element(page.getByText('Duna bañada en peltre')).toHaveAttribute('lang', 'es');
		await expect.element(page.getByText(/Relief in needle-punched fabric/)).toBeVisible();
		await expect.element(page.getByText('3 pieces · 100 × 185 × 22 cm')).toBeVisible();
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkLabel, { work: duna, lang: 'es', class: 'pt-4' });
		expect(container.firstElementChild?.classList.contains('pt-4')).toBe(true);
	});
});
