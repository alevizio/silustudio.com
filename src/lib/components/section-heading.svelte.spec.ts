import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SectionHeading from './section-heading.svelte';

describe('section-heading.svelte', () => {
	it('renders the title as a level 2 heading by default', async () => {
		render(SectionHeading, { title: 'Obras' });
		await expect.element(page.getByRole('heading', { level: 2, name: 'Obras' })).toBeVisible();
	});

	it('renders a level 1 heading with its label and id', async () => {
		render(SectionHeading, {
			title: 'Visitar la galería',
			label: 'Visitar',
			level: 1,
			id: 'titulo'
		});
		const heading = page.getByRole('heading', { level: 1, name: 'Visitar la galería' });
		await expect.element(heading).toHaveAttribute('id', 'titulo');
		await expect.element(page.getByText('Visitar', { exact: true })).toBeVisible();
	});

	it('accepts extra classes on the wrapper', async () => {
		const { container } = render(SectionHeading, { title: 'Obras', class: 'max-w-prose' });
		expect(container.firstElementChild?.classList.contains('max-w-prose')).toBe(true);
	});
});
