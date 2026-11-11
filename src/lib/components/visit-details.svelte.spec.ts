import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisitDetails from './visit-details.svelte';

describe('visit-details.svelte', () => {
	it('shows the address and the ways to get in touch', async () => {
		render(VisitDetails, { lang: 'es' });
		await expect.element(page.getByText(/Ruta 10, km 163.5/)).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: '+598 95 342 939' }))
			.toHaveAttribute('href', 'tel:+59895342939');
		await expect
			.element(page.getByRole('link', { name: 'info@silustudio.com' }))
			.toHaveAttribute('href', 'mailto:info@silustudio.com');
	});

	it('offers directions and WhatsApp as the two actions', async () => {
		render(VisitDetails, { lang: 'en' });
		await expect
			.element(page.getByRole('link', { name: 'Get directions' }))
			.toHaveAttribute('href', expect.stringContaining('google.com/maps/dir/'));
		await expect
			.element(page.getByRole('link', { name: 'Message on WhatsApp' }))
			.toHaveAttribute('href', 'https://wa.me/59895342939');
	});

	it('leaves opening hours out while none are published', async () => {
		render(VisitDetails, { lang: 'es' });
		await expect.element(page.getByText('Dirección')).toBeVisible();
		await expect.element(page.getByText('Horario')).not.toBeInTheDocument();
	});

	it('accepts extra classes', async () => {
		const { container } = render(VisitDetails, { lang: 'es', class: 'lg:col-span-5' });
		expect(container.firstElementChild?.classList.contains('lg:col-span-5')).toBe(true);
	});
});
