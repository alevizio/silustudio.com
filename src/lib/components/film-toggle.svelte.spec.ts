import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FilmToggle from './film-toggle.svelte';

describe('film-toggle.svelte', () => {
	it('offers to stop a film that is running', async () => {
		render(FilmToggle, { lang: 'es', running: true, onclick: () => {} });
		await expect.element(page.getByRole('button', { name: 'Pausar el video' })).toBeVisible();
	});

	it('offers to start a film that is still', async () => {
		render(FilmToggle, { lang: 'es', running: false, onclick: () => {} });
		await expect.element(page.getByRole('button', { name: 'Reproducir el video' })).toBeVisible();
	});

	it('tells whoever holds it when it is pressed', async () => {
		const onclick = vi.fn();
		render(FilmToggle, { lang: 'en', running: true, onclick });
		await page.getByRole('button', { name: 'Pause the film' }).click();
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('leaves the focus where it is, unless it is asked to take it', async () => {
		const { container } = render(FilmToggle, { lang: 'es', running: true, onclick: () => {} });
		await expect.element(page.getByRole('button')).toBeVisible();
		expect(document.activeElement).not.toBe(container.querySelector('button'));
	});

	it('takes the focus as it arrives when asked to', async () => {
		const { container } = render(FilmToggle, {
			lang: 'es',
			running: true,
			onclick: () => {},
			takesFocus: true
		});
		await expect.poll(() => document.activeElement).toBe(container.querySelector('button'));
	});

	it('accepts extra classes', async () => {
		const { container } = render(FilmToggle, {
			lang: 'es',
			running: true,
			onclick: () => {},
			class: 'left-2'
		});
		expect(container.querySelector('button')?.classList.contains('left-2')).toBe(true);
	});
});
