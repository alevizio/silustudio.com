import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisitBand from './visit-band.svelte';

describe('visit-band.svelte', () => {
	it('is a labelled region that invites a visit', async () => {
		render(VisitBand, { lang: 'es' });
		const region = page.getByRole('region', { name: 'Visitá la galería' });
		await expect.element(region).toBeVisible();
		await expect.element(region.getByRole('link', { name: 'Cómo llegar' })).toBeVisible();
	});

	it('shows the photo of the gallery front with an alt text', async () => {
		render(VisitBand, { lang: 'en' });
		await expect
			.element(page.getByRole('img', { name: /Front of the Silu gallery/ }))
			.toBeInTheDocument();
	});

	it('accepts extra classes', async () => {
		render(VisitBand, { lang: 'es', class: 'mt-12' });
		await expect
			.element(page.getByRole('region', { name: 'Visitá la galería' }))
			.toHaveClass(/mt-12/);
	});
});
