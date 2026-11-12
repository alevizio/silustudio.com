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

	it('says the status in words and nothing else: no dot, no icon', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es' });
		expect(container.textContent?.trim()).toBe('Vendida');
		expect(container.firstElementChild?.children).toHaveLength(0);
	});

	it('looks the same whatever it says, so only the word tells the statuses apart', async () => {
		const classOf = (status: WorkStatusName) =>
			render(WorkStatus, { status, lang: 'es' }).container.firstElementChild?.className;
		expect(new Set(STATUSES.map(classOf)).size).toBe(1);
	});

	it('frames the word as a small tag, smaller than the labels around it', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es' });
		const tag = container.firstElementChild;
		expect(tag?.classList.contains('border')).toBe(true);
		expect(tag?.classList.contains('text-tag')).toBe(true);
		expect(tag?.classList.contains('text-label')).toBe(false);
	});

	it('accepts extra classes', async () => {
		const { container } = render(WorkStatus, { status: 'sold', lang: 'es', class: 'pt-1' });
		expect(container.firstElementChild?.classList.contains('pt-1')).toBe(true);
	});
});
