import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Work } from '#lib/content/works.ts';
import WorkPager from './work-pager.svelte';

const guijarro: Work = { slug: 'guijarro', title: 'Guijarro' };
const cause: Work = { slug: 'cause', title: 'Cause' };
const untitled: Work = { slug: 'obra-41', ref: 41 };

describe('work-pager.svelte', () => {
	it('links to the works before and after, naming each', async () => {
		render(WorkPager, { lang: 'es', place: 7, total: 84, previous: guijarro, next: cause });
		const nav = page.getByRole('navigation', { name: 'Recorrer las obras' });
		const before = nav.getByRole('link', { name: 'Obra anterior: Guijarro' });
		await expect
			.element(before)
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/guijarro\/?$/));
		await expect.element(before).toHaveAttribute('rel', 'prev');
		const after = nav.getByRole('link', { name: 'Obra siguiente: Cause' });
		await expect
			.element(after)
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/cause\/?$/));
		await expect.element(after).toHaveAttribute('rel', 'next');
	});

	it('says where the work stands among the works, in figures and in words', async () => {
		render(WorkPager, { lang: 'es', place: 7, total: 84, previous: guijarro, next: cause });
		await expect.element(page.getByText('07 / 84')).toBeVisible();
		await expect.element(page.getByText('Obra 7 de 84')).toBeInTheDocument();
	});

	it('tells assistive technology which arrow key does the same', async () => {
		render(WorkPager, { lang: 'es', place: 7, total: 84, previous: guijarro, next: cause });
		await expect
			.element(page.getByRole('link', { name: /Obra anterior/ }))
			.toHaveAttribute('aria-keyshortcuts', 'ArrowLeft');
		await expect
			.element(page.getByRole('link', { name: /Obra siguiente/ }))
			.toHaveAttribute('aria-keyshortcuts', 'ArrowRight');
	});

	it('calls a neighbour with no title yet by its number', async () => {
		render(WorkPager, { lang: 'es', place: 2, total: 84, previous: untitled, next: cause });
		await expect
			.element(page.getByRole('link', { name: 'Obra anterior: Obra 41' }))
			.toHaveAttribute('href', expect.stringMatching(/\/obras\/obra-41\/?$/));
	});

	it('keeps an arrow in its place at either end, leading nowhere', async () => {
		const { container } = render(WorkPager, { lang: 'es', place: 1, total: 84, next: cause });
		const nav = page.getByRole('navigation', { name: 'Recorrer las obras' });
		await expect.element(nav.getByRole('link', { name: /Obra siguiente/ })).toBeVisible();
		expect(nav.getByRole('link').elements()).toHaveLength(1);
		// Both arrows are still drawn, so the one that works does not move.
		expect(container.querySelectorAll('svg')).toHaveLength(2);
		expect(container.querySelector('span[aria-hidden="true"] svg')).not.toBeNull();
	});

	it('gives each arrow a target large enough for a finger', async () => {
		render(WorkPager, { lang: 'es', place: 7, total: 84, previous: guijarro, next: cause });
		for (const link of page.getByRole('link').elements()) {
			expect(link.classList.contains('size-11')).toBe(true);
		}
	});

	it('names itself and its links in English', async () => {
		render(WorkPager, { lang: 'en', place: 7, total: 84, previous: guijarro, next: cause });
		const nav = page.getByRole('navigation', { name: 'Browse the works' });
		await expect
			.element(nav.getByRole('link', { name: 'Next work: Cause' }))
			.toHaveAttribute('href', expect.stringMatching(/\/en\/works\/cause\/?$/));
		await expect.element(page.getByText('Work 7 of 84')).toBeInTheDocument();
	});

	it('accepts extra classes', async () => {
		render(WorkPager, { lang: 'es', place: 7, total: 84, next: cause, class: 'ml-auto' });
		await expect
			.element(page.getByRole('navigation', { name: 'Recorrer las obras' }))
			.toHaveClass(/ml-auto/);
	});
});
