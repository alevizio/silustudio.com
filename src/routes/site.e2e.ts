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
	{ path: '/en/visit/', lang: 'en', h1: 'Visit the gallery' },
	// Work pages: one with full size photos, one with catalog photos only, one with no title
	// yet, one in English.
	{ path: '/obras/guijarro/', lang: 'es', h1: 'Guijarro' },
	{ path: '/obras/duna-banada-en-peltre/', lang: 'es', h1: 'Duna bañada en peltre' },
	{ path: '/obras/obra-41/', lang: 'es', h1: 'Obra 41' },
	{ path: '/en/works/infinito/', lang: 'en', h1: 'Infinito' }
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PHONE = { width: 390, height: 844 };
/** Every work on the site: the 34 of the catalog and the 50 photographed works not in it. */
const WORKS = 84;
const WALL = 'main ul[aria-label="Obras"]';
/** The catalog works that only have small photos hang in their own, smaller wall. */
const CATALOG = 'main ul[aria-label="Catálogo"]';

// The map and the film are third-party pages. The tests never call them: they get an empty
// document instead.
test.beforeEach(async ({ page }) => {
	await page.route(/google\.com\/maps|player\.vimeo\.com/, (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><html lang="en"><head><title>Embed</title></head><body><main><h1>Embed</h1></main></body></html>'
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

test('the works page shows every work once, large or among the catalog works', async ({ page }) => {
	await page.goto('/obras/#simbiosis');
	const large = await page.locator(`${WALL} > li`).count();
	const small = await page.locator(`${CATALOG} > li`).count();
	expect(large).toBeGreaterThan(small);
	expect(large + small).toBe(WORKS);
	await expect(page.locator('#simbiosis')).toBeInViewport();
});

test('the catalog works hang three to a row, never larger than their photos really are', async ({
	page
}) => {
	await page.goto('/obras/');
	const photos = await page.locator(`${CATALOG} > li img`).evaluateAll((images) =>
		images.map((image) => {
			const box = image.getBoundingClientRect();
			return {
				left: box.left,
				right: box.right,
				bottom: box.bottom,
				shown: box.width,
				real: Number(image.getAttribute('width'))
			};
		})
	);
	const [first, second, third, fourth] = photos;
	expect(second.left).toBeGreaterThan(first.right);
	expect(third.left).toBeGreaterThan(second.right);
	expect(Math.abs(first.bottom - third.bottom)).toBeLessThanOrEqual(1);
	expect(fourth.bottom).toBeGreaterThan(first.bottom);
	for (const { shown, real } of photos) expect(shown).toBeLessThanOrEqual(real);
});

test('the wall hangs two works to a row on a wide screen, on one baseline', async ({ page }) => {
	await page.goto('/obras/');
	const boxes = await page
		.locator(`${WALL} > li img`)
		.evaluateAll((images) => images.slice(0, 2).map((image) => image.getBoundingClientRect()));
	const [left, right] = boxes;
	expect(right.left).toBeGreaterThan(left.right);
	expect(Math.abs(left.bottom - right.bottom)).toBeLessThanOrEqual(1);
});

test('a visitor opens a work from the wall and reads its label beside the photos', async ({
	page
}) => {
	await page.goto('/obras/');
	await page.locator(WALL).getByRole('link', { name: 'Guijarro' }).click();
	await expect(page).toHaveURL(/\/obras\/guijarro\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Guijarro');
	await expect(page.getByText('Madera tallada revestida en arena')).toBeVisible();
	// The label stays in view while the photos scroll past.
	await page.getByRole('img', { name: 'Guijarro, foto 3 de 3.' }).scrollIntoViewIfNeeded();
	await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
});

test('a visitor opens a catalog work, moves to the next one and comes back', async ({ page }) => {
	await page.goto('/obras/');
	await page.locator(CATALOG).getByRole('link', { name: 'Duna bañada en peltre' }).click();
	await expect(page).toHaveURL(/\/obras\/duna-banada-en-peltre\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duna bañada en peltre');
	await expect(page.getByText(new RegExp(`^\\d{2} / ${WORKS}$`))).toBeVisible();
	await page.getByRole('navigation', { name: 'Otras obras' }).locator('a[rel="next"]').click();
	await expect(page).not.toHaveURL(/duna-banada-en-peltre/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await page.getByRole('main').getByRole('link', { name: 'Obras' }).click();
	await expect(page).toHaveURL(/\/obras\/$/);
});

test('every work on the works page has its own page', async ({ page }) => {
	await page.goto('/obras/');
	const hrefs = await page
		.locator(`${WALL} a, ${CATALOG} a`)
		.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
	expect(hrefs).toHaveLength(WORKS);
	for (const href of hrefs) {
		const response = await page.request.get(href);
		expect(response.status(), href).toBe(200);
	}
});

test('the language switch stays on the same work', async ({ page }) => {
	await page.goto('/obras/guijarro/');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/works\/guijarro\/$/);
	await expect(page.getByText('Carved wood coated in sand')).toBeVisible();
});

test('a work page shows every photo of the work', async ({ page }) => {
	await page.goto('/en/works/infinito/');
	for (const n of [1, 2, 3]) {
		await expect(page.getByRole('img', { name: `Infinito, photo ${n} of 3.` })).toBeVisible();
	}
});

test('a small catalog photo is never stretched past its own size', async ({ page }) => {
	await page.goto('/obras/duna-banada-en-peltre/');
	const sizes = await page.locator('article img').evaluateAll((images) =>
		images.map((image) => ({
			shown: image.getBoundingClientRect().width,
			real: Number(image.getAttribute('width'))
		}))
	);
	expect(sizes.length).toBeGreaterThan(0);
	for (const { shown, real } of sizes) expect(shown).toBeLessThanOrEqual(real);
});

test('a work with no title yet is asked about by the address of its page', async ({ page }) => {
	await page.goto('/obras/obra-41/');
	const address = encodeURIComponent(`${new URL(page.url()).origin}/obras/obra-41/`);
	await expect(page.getByRole('link', { name: 'Consultar por WhatsApp' })).toHaveAttribute(
		'href',
		new RegExp(address.replace(/[.]/g, '\\.'))
	);
});

test('the artists film loads from Vimeo only when the visitor presses play', async ({ page }) => {
	const calls: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('vimeo.com')) calls.push(request.url());
	});
	await page.goto('/estudio/', { waitUntil: 'networkidle' });
	expect(calls).toEqual([]);
	await page.getByRole('button', { name: 'Ver el video' }).click();
	await expect(page.locator('iframe[title="Video de los artistas, en Vimeo"]')).toHaveAttribute(
		'src',
		/player\.vimeo\.com\/video\/\d+\?.*dnt=1/
	);
	await expect.poll(() => calls.length).toBeGreaterThan(0);
});

test('the home page opens on a photo that runs edge to edge', async ({ page }) => {
	await page.goto('/');
	const photo = page.getByRole('img', { name: /Interior de la galería Silu/ });
	const box = await photo.boundingBox();
	const viewport = page.viewportSize();
	expect(box?.x).toBe(0);
	expect(box?.width).toBe(viewport?.width);
	await expect(page.getByRole('link', { name: 'Cómo llegar' }).first()).toBeInViewport();
});

test('the daylight on the wall stays put while the page scrolls, and never widens it', async ({
	page
}) => {
	await page.goto('/obras/');
	const light = page.locator('#wall-light');
	const viewport = page.viewportSize();
	const before = await light.boundingBox();
	expect(before).toEqual({ x: 0, y: 0, width: viewport?.width, height: viewport?.height });
	await page.mouse.wheel(0, 3000);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(2000);
	expect(await light.boundingBox()).toEqual(before);
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test('the daylight falls behind the page: on the wall, never on a work or a link', async ({
	page
}) => {
	await page.goto('/obras/');
	const light = page.locator('#wall-light');
	await expect(light).toHaveCSS('z-index', '-10');
	await expect(light).toHaveCSS('pointer-events', 'none');
	// Whatever is at the middle of the first photo is the photo itself, and it can be clicked.
	const photo = page.locator(`${WALL} > li img`).first();
	const box = await photo.boundingBox();
	if (!box) throw new Error('The first photo of the wall has no box');
	const top = await page.evaluate(
		([x, y]) => document.elementFromPoint(x, y)?.closest('li')?.id ?? null,
		[box.x + box.width / 2, box.y + box.height / 2]
	);
	expect(top).toBe('guijarro');
	await page.locator(WALL).getByRole('link', { name: 'Guijarro' }).click();
	await expect(page).toHaveURL(/\/obras\/guijarro\/$/);
});

test('the daylight moves as the visitor scrolls, and holds still when less motion is asked for', async ({
	page
}) => {
	const pose = () =>
		page.evaluate(() =>
			['slats', 'fronds'].map((part) => {
				const shadow = document.querySelector(`#wall-light [data-part="${part}"]`);
				if (!shadow) return null;
				const style = getComputedStyle(shadow);
				return `${style.translate} ${style.rotate}`;
			})
		);
	const scrollScreens = (screens: number) =>
		page.evaluate((count) => scrollTo({ top: innerHeight * count, behavior: 'instant' }), screens);

	await page.goto('/obras/');
	const atTheTop = await pose();
	await scrollScreens(1);
	await expect.poll(pose).not.toEqual(atTheTop);
	const [slats, fronds] = await pose();
	expect(slats).not.toBe(atTheTop[0]);
	expect(fronds).not.toBe(atTheTop[1]);
	// Scrolling back brings the light back to where it was.
	await scrollScreens(0);
	await expect.poll(pose).toEqual(atTheTop);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/obras/');
	const still = await pose();
	await scrollScreens(1);
	await page.waitForTimeout(200);
	expect(await pose()).toEqual(still);
});

test('the daylight still covers the whole screen wherever its motion takes it', async ({
	page
}) => {
	await page.goto('/obras/');
	const viewport = page.viewportSize();
	if (!viewport) throw new Error('The page has no viewport');
	for (const screens of [0, 1.25, 1.75, 3.75, 5.25, 8.75, 12.25]) {
		await page.evaluate(
			(count) => scrollTo({ top: innerHeight * count, behavior: 'instant' }),
			screens
		);
		// Each corner of the screen has to fall inside both shadow layers, even when they are moved
		// and turned. A corner is mapped back into the layer's own space and compared with its size.
		const uncovered = await page.evaluate(({ width, height }) => {
			const corners = [
				[0, 0],
				[width, 0],
				[0, height],
				[width, height]
			];
			const missing: string[] = [];
			for (const part of ['slats', 'fronds']) {
				const shadow = document.querySelector(`#wall-light [data-part="${part}"]`);
				const box = shadow?.parentElement?.getBoundingClientRect();
				if (!shadow || !box) return [`${part} is missing`];
				const style = getComputedStyle(shadow);
				const length = (value: string, full: number): number =>
					value.endsWith('%') ? (parseFloat(value) / 100) * full : parseFloat(value);
				const [originX, originY] = style.transformOrigin.split(' ').map(parseFloat);
				const [moveX = '0', moveY = '0'] =
					style.translate === 'none' ? [] : style.translate.split(' ');
				const shiftX = length(moveX, box.width);
				const shiftY = length(moveY, box.height);
				const angle = style.rotate === 'none' ? 0 : (parseFloat(style.rotate) * Math.PI) / 180;
				for (const [x, y] of corners) {
					// Undo the move, then undo the turn about the layer's origin.
					const dx = x - box.left - shiftX - originX;
					const dy = y - box.top - shiftY - originY;
					const localX = originX + dx * Math.cos(-angle) - dy * Math.sin(-angle);
					const localY = originY + dx * Math.sin(-angle) + dy * Math.cos(-angle);
					const inside = localX >= 0 && localY >= 0 && localX <= box.width && localY <= box.height;
					if (!inside) missing.push(`${part} leaves the corner ${x},${y} bare`);
				}
			}
			return missing;
		}, viewport);
		expect(uncovered, `after ${screens} screens`).toEqual([]);
	}
});

test('the daylight steps aside for visitors who ask for more contrast', async ({ page }) => {
	await page.emulateMedia({ contrast: 'more' });
	await page.goto('/');
	await expect(page.locator('#wall-light')).toBeHidden();
});

test('no work shows a status until one is confirmed', async ({ page }) => {
	await page.goto('/obras/');
	await expect(page.getByText(/^(Disponible|Reservada|Vendida)$/)).toHaveCount(0);
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
