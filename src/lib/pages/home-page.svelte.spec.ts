import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './home-page.svelte';

describe('home-page.svelte', () => {
	it('opens with what Silu is and how to get there', async () => {
		render(HomePage, { lang: 'es' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Galería y estudio de arte en Manantiales, Punta del Este.');
		await expect
			.element(page.getByRole('link', { name: 'Cómo llegar' }))
			.toHaveAttribute('href', expect.stringContaining('google.com/maps/dir/'));
	});

	it('shows three works with their labels and the count from the catalog', async () => {
		render(HomePage, { lang: 'es' });
		await expect.element(page.getByRole('heading', { name: /^34 obras/ })).toBeInTheDocument();
		expect(page.getByRole('heading', { level: 3 }).elements()).toHaveLength(3);
	});

	it('renders in English', async () => {
		render(HomePage, { lang: 'en' });
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Art gallery and studio in Manantiales, Punta del Este.');
		await expect
			.element(page.getByRole('link', { name: 'About the studio' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/studio\/$/));
	});
});
