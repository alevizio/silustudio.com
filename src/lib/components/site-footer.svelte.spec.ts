import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SiteFooter from './site-footer.svelte';

describe('site-footer.svelte', () => {
	it('shows the current year and the rights line', async () => {
		render(SiteFooter, { lang: 'es' });
		const year = String(new Date().getFullYear());
		await expect.element(page.getByText(new RegExp(`© ${year} Silu`))).toBeVisible();
	});

	it('links to Instagram and the gallery email', async () => {
		render(SiteFooter, { lang: 'en' });
		await expect
			.element(page.getByRole('link', { name: 'Instagram' }))
			.toHaveAttribute('href', 'https://www.instagram.com/silu.studio/');
		await expect
			.element(page.getByRole('link', { name: 'info@silustudio.com' }))
			.toHaveAttribute('href', 'mailto:info@silustudio.com');
	});

	it('accepts extra classes', async () => {
		render(SiteFooter, { lang: 'es', class: 'mt-10' });
		await expect.element(page.getByRole('contentinfo')).toHaveClass(/mt-10/);
	});
});
