import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LangSwitch from './lang-switch.svelte';

describe('lang-switch.svelte', () => {
	it('marks Spanish as current and links to the same page in English', async () => {
		render(LangSwitch, { lang: 'es', pathname: '/obras/' });
		await expect.element(page.getByRole('navigation', { name: 'Idioma' })).toBeVisible();
		const english = page.getByRole('link', { name: 'English' });
		await expect.element(english).toHaveAttribute('href', expect.stringMatching(/\/en\/works\/$/));
		await expect.element(english).toHaveAttribute('hreflang', 'en');
		await expect.element(page.getByRole('link', { name: 'Español' })).not.toBeInTheDocument();
	});

	it('links back to Spanish from an English page', async () => {
		render(LangSwitch, { lang: 'en', pathname: '/en/visit/' });
		const spanish = page.getByRole('link', { name: 'Español' });
		await expect.element(spanish).toHaveAttribute('href', expect.stringMatching(/\/visitar\/$/));
	});

	it('accepts extra classes', async () => {
		render(LangSwitch, { lang: 'es', pathname: '/', class: 'ml-auto' });
		await expect.element(page.getByRole('navigation', { name: 'Idioma' })).toHaveClass(/ml-auto/);
	});
});
