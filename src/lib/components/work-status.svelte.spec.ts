import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { WorkStatus as WorkStatusName } from '#lib/content/works.ts';
import WorkStatus from './work-status.svelte';

const STATUSES: WorkStatusName[] = ['onView', 'available', 'reserved', 'sold'];

describe('work-status.svelte', () => {
	it('names each status in Spanish', async () => {
		render(WorkStatus, { status: 'onView', lang: 'es' });
		await expect.element(page.getByText('En la galería')).toBeVisible();
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
		render(WorkStatus, { status: 'onView', lang: 'en' });
		await expect.element(page.getByText('On view at the gallery')).toBeVisible();
	});

	it('says the status in words, with the dot hidden from screen readers', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es' });
		const dot = container.querySelector('span');
		expect(dot?.getAttribute('aria-hidden')).toBe('true');
		expect(container.textContent?.trim()).toBe('Vendida');
	});

	it('draws a different dot for each status', async () => {
		const dotClass = (status: WorkStatusName) =>
			render(WorkStatus, { status, lang: 'es' }).container.querySelector('span')?.className;
		expect(new Set(STATUSES.map(dotClass)).size).toBe(STATUSES.length);
	});

	it('frames the word and its dot as a tag', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es' });
		const tag = container.firstElementChild;
		expect(tag?.classList.contains('border')).toBe(true);
		expect(tag?.classList.contains('inline-flex')).toBe(true);
	});

	it('lets only the dot of a work in the gallery breathe, and only when motion is welcome', async () => {
		const breathes = (status: WorkStatusName) =>
			render(WorkStatus, { status, lang: 'es' }).container.querySelector('span')?.className ?? '';
		expect(breathes('onView')).toContain('motion-safe:after:animate-breathe');
		expect(breathes('sold')).not.toContain('animate-breathe');
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es', class: 'pt-1' });
		expect(container.firstElementChild?.classList.contains('pt-1')).toBe(true);
	});
});
