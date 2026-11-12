import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Work } from '#lib/content/works.ts';
import WorkNeighbours from './work-neighbours.svelte';

const guijarro: Work = { slug: 'guijarro', title: 'Guijarro' };
const cause: Work = { slug: 'cause', title: 'Cause' };
const untitled: Work = { slug: 'obra-41', ref: 41 };

describe('work-neighbours.svelte', () => {
	it('links to the works before and after by their titles', async () => {
		render(WorkNeighbours, { lang: 'es', previous: guijarro, next: cause });
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		const before = nav.getByRole('link', { name: 'Guijarro' });
		await expect
			.element(before)
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/guijarro\/?$/));
		await expect.element(before).toHaveAttribute('rel', 'prev');
		const after = nav.getByRole('link', { name: 'Cause' });
		await expect
			.element(after)
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/cause\/?$/));
		await expect.element(after).toHaveAttribute('rel', 'next');
	});

	it('says which way each neighbour lies, and shows its photo without repeating its name', async () => {
		const { container } = render(WorkNeighbours, { lang: 'es', previous: guijarro, next: cause });
		await expect.element(page.getByRole('link', { name: 'Anterior Guijarro' })).toBeVisible();
		await expect.element(page.getByRole('link', { name: 'Siguiente Cause' })).toBeVisible();
		const photos = [...container.querySelectorAll('img')];
		expect(photos).toHaveLength(2);
		// The link's words already name the work, so the photos are decoration to a screen reader.
		for (const photo of photos) expect(photo.getAttribute('alt')).toBe('');
	});

	it("never crops a neighbour's photo", async () => {
		const { container } = render(WorkNeighbours, { lang: 'es', previous: guijarro, next: cause });
		for (const photo of container.querySelectorAll('img')) {
			expect(photo.classList.contains('object-contain')).toBe(true);
		}
	});

	it('calls a neighbour with no title yet the previous or the next work', async () => {
		render(WorkNeighbours, { lang: 'es', previous: untitled, next: untitled });
		await expect
			.element(page.getByRole('link', { name: 'Obra anterior' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/obra-41\/?$/));
		await expect.element(page.getByRole('link', { name: 'Obra siguiente' })).toBeVisible();
	});

	it('shows one link at either end of the order, and none when the work stands alone', async () => {
		render(WorkNeighbours, { lang: 'es', next: cause });
		const nav = page.getByRole('navigation', { name: 'Otras obras' });
		await expect.element(nav.getByRole('link', { name: 'Cause' })).toBeVisible();
		expect(nav.getByRole('link').elements()).toHaveLength(1);
		const { container } = render(WorkNeighbours, { lang: 'es' });
		expect(container.querySelectorAll('a')).toHaveLength(0);
	});

	it('names itself and its links in English', async () => {
		render(WorkNeighbours, { lang: 'en', previous: untitled, next: cause });
		const nav = page.getByRole('navigation', { name: 'Other works' });
		await expect
			.element(nav.getByRole('link', { name: 'Previous work' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/works\/obra-41\/?$/));
	});

	it('accepts extra classes', async () => {
		render(WorkNeighbours, { lang: 'es', next: cause, class: 'pb-section' });
		await expect
			.element(page.getByRole('navigation', { name: 'Otras obras' }))
			.toHaveClass(/pb-section/);
	});
});
