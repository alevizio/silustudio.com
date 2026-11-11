import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
	{ path: '/', lang: 'es', h1: 'Galería y estudio de arte en Manantiales, Punta del Este.' },
	{ path: '/obras/', lang: 'es', h1: 'Obras' },
	{ path: '/estudio/', lang: 'es', h1: 'Silvestre Jacobi y Lucila Dickinson' },
	{ path: '/visitar/', lang: 'es', h1: 'Visitar la galería' },
	{ path: '/en/', lang: 'en', h1: 'Art gallery and studio in Manantiales, Punta del Este.' },
	{ path: '/en/works/', lang: 'en', h1: 'Works' },
	{ path: '/en/studio/', lang: 'en', h1: 'Silvestre Jacobi and Lucila Dickinson' },
	{ path: '/en/visit/', lang: 'en', h1: 'Visit the gallery' }
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PHONE = { width: 390, height: 844 };
const CATALOG_SIZE = 34;

// The map is a third-party page. The tests never call it: they get an empty document instead.
test.beforeEach(async ({ page }) => {
	await page.route(/google\.com\/maps/, (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><html lang="en"><head><title>Map</title></head><body><main><h1>Map</h1></main></body></html>'
		})
	);
});

for (const { path, lang, h1 } of PAGES) {
	test.describe(`page ${path}`, () => {
		test('has one main heading, a title and the right language', async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
			await expect(page).toHaveTitle(/Silu/);
		});

		test('has no accessibility violations', async ({ page }) => {
			await page.goto(path);
			const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
			expect(results.violations).toEqual([]);
		});

		test('fits a phone screen without sideways scrolling', async ({ page }) => {
			await page.setViewportSize(PHONE);
			await page.goto(path);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - window.innerWidth
			);
			expect(overflow).toBeLessThanOrEqual(0);
		});
	});
}

test('the header takes a visitor to the works and then to the visit page', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Principal' });
	await nav.getByRole('link', { name: 'Obras' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
	await expect(nav.getByRole('link', { name: 'Obras' })).toHaveAttribute('aria-current', 'page');
	await nav.getByRole('link', { name: 'Visitar' }).click();
	await expect(page).toHaveURL(/\/visitar\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Visitar la galería');
});

test('the language switch keeps the visitor on the same page', async ({ page }) => {
	await page.goto('/obras/');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/works\/$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('link', { name: 'Español' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
});

test('the works page lists the whole catalog and each work can be linked to', async ({ page }) => {
	await page.goto('/obras/#simbiosis');
	await expect(page.locator('main ol').getByRole('listitem')).toHaveCount(CATALOG_SIZE);
	await expect(page.locator('#simbiosis')).toBeInViewport();
});

test('every page except Visit ends with the invitation to visit', async ({ page }) => {
	await page.goto('/estudio/');
	await expect(page.getByRole('region', { name: 'Visitá la galería' })).toBeVisible();
	await page.goto('/visitar/');
	await expect(page.getByRole('region', { name: 'Visitá la galería' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Cómo llegar' })).toHaveCount(1);
});

test('the skip link is the first stop for keyboard users', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Saltar al contenido' });
	await expect(skip).toBeFocused();
	await expect(skip).toHaveAttribute('href', '#contenido');
});

test('no page asks for a file that does not exist', async ({ page }) => {
	const failed: string[] = [];
	page.on('response', (response) => {
		if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
	});
	for (const { path } of PAGES) {
		await page.goto(path, { waitUntil: 'networkidle' });
	}
	expect(failed).toEqual([]);
});
