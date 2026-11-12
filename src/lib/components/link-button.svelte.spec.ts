import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LinkButton from './link-button.svelte';

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('link-button.svelte', () => {
	it('renders a link with its label and destination', async () => {
		render(LinkButton, { href: '/obras/', children: label('Ver todas las obras') });
		const link = page.getByRole('link', { name: 'Ver todas las obras' });
		await expect.element(link).toHaveAttribute('href', '/obras/');
		await expect.element(link).not.toHaveAttribute('target');
	});

	it('opens external links in a new tab without leaking the opener', async () => {
		render(LinkButton, {
			href: 'https://wa.me/59895342939',
			external: true,
			children: label('Escribir por WhatsApp')
		});
		const link = page.getByRole('link', { name: 'Escribir por WhatsApp' });
		await expect.element(link).toHaveAttribute('target', '_blank');
		await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('renders secondary links as underlined text instead of a button', async () => {
		render(LinkButton, {
			href: '/visitar/',
			variant: 'text',
			children: label('Planificar la visita')
		});
		const link = page.getByRole('link', { name: 'Planificar la visita' });
		// A faint rule is always under the label, and a darker one is drawn over it on hover.
		await expect.element(link).toHaveClass(/before:bg-line/);
		await expect.element(link).toHaveClass(/hover:after:scale-x-100/);
		await expect.element(link).not.toHaveClass(/border/);
	});

	it('fills a button with colour from the bottom, for the pointer and the keyboard alike', async () => {
		render(LinkButton, { href: '/', children: label('Sólido') });
		render(LinkButton, { href: '/', variant: 'line', children: label('Línea') });
		for (const name of ['Sólido', 'Línea']) {
			const button = page.getByRole('link', { name });
			await expect.element(button).toHaveClass(/before:origin-bottom/);
			await expect.element(button).toHaveClass(/hover:before:scale-y-100/);
			await expect.element(button).toHaveClass(/focus-visible:before:scale-y-100/);
			// Visitors who ask for less motion get the new colour at once.
			await expect.element(button).toHaveClass(/motion-reduce:before:transition-none/);
		}
		await expect
			.element(page.getByRole('link', { name: 'Sólido' }))
			.toHaveClass(/before:bg-sand-deep/);
		await expect.element(page.getByRole('link', { name: 'Línea' })).toHaveClass(/before:bg-ink/);
	});

	it('accepts a variant and extra classes', async () => {
		render(LinkButton, { href: '/', variant: 'line', class: 'w-full', children: label('Inicio') });
		const link = page.getByRole('link', { name: 'Inicio' });
		await expect.element(link).toHaveClass(/w-full/);
		await expect.element(link).toHaveClass(/border-ink/);
	});
});
