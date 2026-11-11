import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SiteHeader from './site-header.svelte';

describe('site-header.svelte', () => {
	it('shows the three sections once, in Spanish', async () => {
		render(SiteHeader, { lang: 'es', current: 'home', pathname: '/' });
		const nav = page.getByRole('navigation', { name: 'Principal' });
		await expect.element(nav).toBeVisible();
		expect(nav.getByRole('link').elements()).toHaveLength(3);
		await expect
			.element(nav.getByRole('link', { name: 'Obras' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/$/));
		await expect.element(nav.getByRole('link', { name: 'Works' })).not.toBeInTheDocument();
	});

	it('marks the page being shown', async () => {
		render(SiteHeader, { lang: 'en', current: 'visit', pathname: '/en/visit/' });
		const nav = page.getByRole('navigation', { name: 'Main' });
		await expect
			.element(nav.getByRole('link', { name: 'Visit' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(nav.getByRole('link', { name: 'Works' }))
			.not.toHaveAttribute('aria-current');
	});

	it('links the logo to the home page of the current language', async () => {
		render(SiteHeader, { lang: 'en', current: 'works', pathname: '/en/works/' });
		await expect
			.element(page.getByRole('link', { name: 'Silu, home' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/$/));
	});
});
