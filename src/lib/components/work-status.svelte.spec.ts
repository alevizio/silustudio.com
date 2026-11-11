import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import WorkStatus from './work-status.svelte';

describe('work-status.svelte', () => {
	it('names each status in Spanish', async () => {
		render(WorkStatus, { status: 'available', lang: 'es' });
		await expect.element(page.getByText('Disponible')).toBeVisible();
		render(WorkStatus, { status: 'reserved', lang: 'es' });
		await expect.element(page.getByText('Reservada')).toBeVisible();
		render(WorkStatus, { status: 'sold', lang: 'es' });
		await expect.element(page.getByText('Vendida')).toBeVisible();
	});

	it('names each status in English', async () => {
		render(WorkStatus, { status: 'sold', lang: 'en' });
		await expect.element(page.getByText('Sold')).toBeVisible();
	});

	it('says the status in words, with the dot hidden from screen readers', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es' });
		const dot = container.querySelector('span');
		expect(dot?.getAttribute('aria-hidden')).toBe('true');
		expect(container.textContent?.trim()).toBe('Vendida');
	});

	it('draws a different dot for each status', async () => {
		const dotClass = (status: 'available' | 'reserved' | 'sold') =>
			render(WorkStatus, { status, lang: 'es' }).container.querySelector('span')?.className;
		expect(new Set([dotClass('available'), dotClass('reserved'), dotClass('sold')]).size).toBe(3);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es', class: 'pt-1' });
		expect(container.firstElementChild?.classList.contains('pt-1')).toBe(true);
	});
});
