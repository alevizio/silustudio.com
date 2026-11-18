import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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
/** Every work on the site: the 34 of the catalog and the 54 photographed works not in it. */
const WORKS = 88;
const WALL = 'main ul[aria-label="Obras"]';
/** The catalog works that only have small photos hang in their own, smaller wall. */
const CATALOG = 'main ul[aria-label="Catálogo"]';

/** Waits until nothing on the page is still arriving, so it is checked the way a visitor reads it. */
const settled = (page: Page) =>
	page.evaluate(async () => {
		// Something cut short has come to rest too, so that is not an error.
		const rest = () =>
			Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
		await rest();
		// And once more, for whatever the first round set off.
		await rest();
	});

/**
 * Waits until the browser is moving every one of these parts of a page transition, such as
 * '::view-transition-old(work-photo)'. It looks on every frame, so a short change is not missed.
 */
const moving = (page: Page, parts: string[]) =>
	page.waitForFunction(
		(wanted) => {
			const pictured = document
				.getAnimations()
				.map(({ effect }) => (effect instanceof KeyframeEffect ? effect.pseudoElement : null));
			return wanted.every((part) => pictured.includes(part));
		},
		parts,
		{ polling: 'raf' }
	);

/** The row of a work's photos, which a phone swipes through. */
const PHOTO_ROW = { name: 'Fotos de la obra' };

/** Brings the photo at this place of a row into view, the way a swipe does. */
const swipeTo = (row: Locator, place: number) =>
	row
		.getByRole('img')
		.nth(place)
		.evaluate((photo) =>
			photo.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' })
		);

/** How tall each of these photos shows, in pixels. */
const heightsOf = (photos: Locator) =>
	photos.evaluateAll((images) => images.map((image) => image.getBoundingClientRect().height));

/** The artists' film at the top of the studio page, which Vimeo plays. */
const ARTISTS_FILM = 'iframe[title="Video de los artistas, en Vimeo"]';

/** The one button on a film that runs by itself, which stops it and starts it again. */
const toggleOf = (film: Locator): Locator => film.locator('xpath=..').getByRole('button');

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
			await settled(page);
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
	// The way back leads to the place on the wall of the work just seen.
	await page.getByRole('main').getByRole('link', { name: 'Obras', exact: true }).click();
	await expect(page).toHaveURL(/\/obras\/#[a-z0-9-]+$/);
});

test('the way back from a work opens the wall at that work', async ({ page }) => {
	await page.goto('/obras/obra-41/');
	await page.getByRole('main').getByRole('link', { name: 'Obras', exact: true }).click();
	await expect(page).toHaveURL(/\/obras\/#obra-41$/);
	await expect(page.locator('#obra-41')).toBeInViewport();
});

test('the arrows and the arrow keys walk from one work to the next and back', async ({ page }) => {
	await page.goto('/obras/guijarro/');
	const pager = page.getByRole('navigation', { name: 'Recorrer las obras' });
	const next = pager.locator('a[rel="next"]');
	await expect(pager.getByText(`01 / ${WORKS}`)).toBeVisible();
	// The first work has nothing before it.
	await expect(pager.locator('a[rel="prev"]')).toHaveCount(0);
	const place = await next.boundingBox();
	await next.click();
	await expect(pager.getByText(`02 / ${WORKS}`)).toBeVisible();
	// The arrow has not moved, so it can be pressed again without looking for it.
	expect(await next.boundingBox()).toEqual(place);
	// Part way down a work's photos, the arrow key still opens the next work at its top.
	await page.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
	await page.keyboard.press('ArrowRight');
	await expect(pager.getByText(`03 / ${WORKS}`)).toBeVisible();
	await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
	await page.keyboard.press('ArrowLeft');
	await expect(pager.getByText(`02 / ${WORKS}`)).toBeVisible();
	// With the keyboard on the arrow itself, Enter walks on and the focus stays on the arrow.
	await next.focus();
	await page.keyboard.press('Enter');
	await expect(pager.getByText(`03 / ${WORKS}`)).toBeVisible();
	await expect(next).toBeFocused();
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	// A new work starts at its top, wherever the visitor was on the last one.
	expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('the walk ends at the last work', async ({ page }) => {
	await page.goto('/obras/');
	await page.locator(`${CATALOG} a`).last().click();
	const pager = page.getByRole('navigation', { name: 'Recorrer las obras' });
	await expect(pager.getByText(`${WORKS} / ${WORKS}`)).toBeVisible();
	await expect(pager.locator('a[rel="next"]')).toHaveCount(0);
	const address = page.url();
	await page.keyboard.press('ArrowRight');
	expect(page.url()).toBe(address);
});

test("a work's photo travels from the wall into its page, and back to its place", async ({
	page
}) => {
	await page.goto('/obras/');
	await settled(page);
	await page.locator(WALL).getByRole('link', { name: 'Reencause' }).click();
	// Both ends of the trip are pictured: the photo on the wall and the one on the page.
	await moving(page, ['::view-transition-old(work-photo)', '::view-transition-new(work-photo)']);
	await expect(page).toHaveURL(/\/obras\/reencause\/$/);
	await settled(page);
	// Once it has landed nothing stays marked, and the page is itself again.
	await expect(page.locator('html')).not.toHaveAttribute('data-walk', /.*/);

	await page.getByRole('main').getByRole('link', { name: 'Obras', exact: true }).click();
	await moving(page, ['::view-transition-old(work-photo)', '::view-transition-new(work-photo)']);
	await expect(page).toHaveURL(/\/obras\/#reencause$/);
	await settled(page);
	await expect(page.locator('#reencause img')).toBeInViewport();
	await expect(page.locator('.travelling-photo')).toHaveCount(0);
});

test('walking to the next work moves the photos sideways, and back the other way', async ({
	page
}) => {
	await page.goto('/obras/reencause/');
	await settled(page);
	const pager = page.getByRole('navigation', { name: 'Recorrer las obras' });
	await pager.locator('a[rel="next"]').click();
	// The photo on screen leaves and the next one comes in: two photos, not one that changes.
	await moving(page, ['::view-transition-old(leaving-photo)', '::view-transition-new(work-photo)']);
	await expect(page.locator('html')).toHaveAttribute('data-walk', 'next');
	await settled(page);
	await expect(page.locator('html')).not.toHaveAttribute('data-walk', /.*/);

	await page.keyboard.press('ArrowLeft');
	await moving(page, ['::view-transition-old(leaving-photo)', '::view-transition-new(work-photo)']);
	await expect(page.locator('html')).toHaveAttribute('data-walk', 'previous');
	await expect(page).toHaveURL(/\/obras\/reencause\/$/);
});

test('the header keeps its place while the page under it changes', async ({ page }) => {
	await page.goto('/');
	await settled(page);
	await page
		.getByRole('navigation', { name: 'Principal' })
		.getByRole('link', { name: 'Estudio' })
		.click();
	await moving(page, [
		'::view-transition-old(root)',
		'::view-transition-new(root)',
		'::view-transition-group(site-header)'
	]);
	await expect(page).toHaveURL(/\/estudio\/$/);
});

test('pages change at once, with nothing travelling, for visitors who ask for less motion', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/obras/');
	// Keeps watching for any part of a page transition for as long as the page lives.
	await page.evaluate(() => {
		const root = document.documentElement;
		root.dataset.sawTransition = 'no';
		const look = (): void => {
			const pictured = document
				.getAnimations()
				.some(
					({ effect }) =>
						effect instanceof KeyframeEffect &&
						effect.pseudoElement?.startsWith('::view-transition')
				);
			if (pictured) root.dataset.sawTransition = 'yes';
			requestAnimationFrame(look);
		};
		look();
	});
	await page.locator(WALL).getByRole('link', { name: 'Guijarro' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Guijarro');
	await page.keyboard.press('ArrowRight');
	await expect(page.getByText(`02 / ${WORKS}`)).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('data-saw-transition', 'no');
	await expect(page.locator('html')).not.toHaveAttribute('data-walk', /.*/);
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

test("on a work's page every photo has a row of its own and the photos take most of the page", async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/obras/guijarro/');
	await settled(page);
	const boxes = await page.locator('article img').evaluateAll((images) =>
		images.map((image) => {
			const box = image.getBoundingClientRect();
			return { top: box.top, bottom: box.bottom, width: box.width, height: box.height };
		})
	);
	expect(boxes).toHaveLength(3);
	// One under another: each photo starts below the end of the one before.
	expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
	expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom);
	// The first photo is a wide one: it fills its column, which is most of the screen.
	expect(boxes[0].width).toBeGreaterThan(1440 * 0.65);
	// No photo is taller than the screen, so a whole work can always be seen at once.
	for (const box of boxes) expect(box.height).toBeLessThanOrEqual(900);
	// The label is slim beside them and stays readable.
	const label = await page.getByRole('heading', { level: 1 }).boundingBox();
	expect(label?.x).toBeGreaterThan(1440 * 0.7);
	// Nothing here is swiped through, so the photos are not a stop for the keyboard.
	await expect(page.getByRole('group', PHOTO_ROW)).not.toHaveAttribute('tabindex', /.*/);
});

test("on a phone a work's photos are one row to swipe through, and the label stays right under the photo in view", async ({
	page
}) => {
	await page.setViewportSize(PHONE);
	await page.goto('/obras/guijarro/');
	await settled(page);
	const row = page.getByRole('group', PHOTO_ROW);
	const photos = row.getByRole('img');
	await expect(photos).toHaveCount(3);
	const sides = await photos.evaluateAll((images) =>
		images.map((image) => {
			const { left, right } = image.getBoundingClientRect();
			return { left, right };
		})
	);
	// Side by side: the first photo is whole on the screen, and the edge of the second shows.
	expect(sides[0].left).toBeGreaterThan(0);
	expect(sides[0].right).toBeLessThan(PHONE.width);
	expect(sides[1].left).toBeGreaterThan(sides[0].right);
	expect(sides[1].left).toBeLessThan(PHONE.width);

	// The first photo is a wide one and the others are tall. The row is only as tall as the
	// photo in view, so the label comes right under it and not under the tallest photo.
	const heights = await heightsOf(photos);
	expect(heights[1]).toBeGreaterThan(heights[0] * 2);
	const rowHeight = async () => (await row.boundingBox())?.height ?? 0;
	const offBy = async (height: number) => Math.abs((await rowHeight()) - height);
	const title = page.getByRole('heading', { level: 1 });
	const titleTop = async () => (await title.boundingBox())?.y ?? 0;
	await expect.poll(() => offBy(heights[0])).toBeLessThanOrEqual(1);
	const before = await titleTop();
	const dots = row.locator('xpath=..').locator('[aria-hidden="true"] > span');
	const marked = () =>
		dots.evaluateAll((all) => all.map((dot) => dot.classList.contains('bg-ink')));
	expect(await marked()).toEqual([true, false, false]);

	// Swiped to the second photo, the row grows to it, the label moves down with it and the
	// dots say where the visitor is.
	await swipeTo(row, 1);
	await expect.poll(() => offBy(heights[1])).toBeLessThanOrEqual(1);
	await expect.poll(marked).toEqual([false, true, false]);
	await settled(page);
	expect((await titleTop()) - before).toBeGreaterThan(heights[0]);

	await swipeTo(row, 2);
	await expect.poll(marked).toEqual([false, false, true]);
	// Only the row moves sideways, never the page.
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test('a swiped row of photos takes the keyboard, and its arrow keys do not walk on to the next work', async ({
	page
}) => {
	await page.setViewportSize(PHONE);
	await page.goto('/obras/guijarro/');
	await settled(page);
	const row = page.getByRole('group', PHOTO_ROW);
	await row.focus();
	await page.keyboard.press('ArrowRight');
	await expect.poll(() => row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
	await expect(page).toHaveURL(/\/obras\/guijarro\/$/);
	// Anywhere else on the page, the arrow keys still walk from work to work.
	await row.blur();
	await page.keyboard.press('ArrowRight');
	await expect(page).not.toHaveURL(/\/obras\/guijarro\/$/);
});

test("a work's page has no accessibility violations on a phone, where its photos are swiped through", async ({
	page
}) => {
	await page.setViewportSize(PHONE);
	await page.goto('/obras/guijarro/');
	await settled(page);
	const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
	expect(results.violations).toEqual([]);
});

test('without scripts no photo of a swiped row is cut short', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false, viewport: PHONE });
	const page = await context.newPage();
	await page.goto('/obras/guijarro/');
	const row = page.getByRole('group', PHOTO_ROW);
	// Nothing follows the swipe, so the row is as tall as its tallest photo from the start.
	const tallest = Math.max(...(await heightsOf(row.getByRole('img'))));
	expect((await row.boundingBox())?.height).toBeGreaterThanOrEqual(Math.floor(tallest));
	await context.close();
});

test('the unlabelled photos on the works page show three to a row', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/obras/');
	const photos = page.locator('section[aria-labelledby="works-details"] img');
	const tops = await photos.evaluateAll((images) =>
		images.map((image) => Math.round(image.getBoundingClientRect().top))
	);
	expect(tops.length).toBeGreaterThan(3);
	expect(tops[0]).toBe(tops[1]);
	expect(tops[1]).toBe(tops[2]);
	expect(tops[3]).toBeGreaterThan(tops[2]);
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

test('the artists film starts by itself from Vimeo, silent, with one button to stop it', async ({
	page
}) => {
	await page.goto('/estudio/');
	const player = page.locator(ARTISTS_FILM);
	await expect(player).toHaveAttribute(
		'src',
		/player\.vimeo\.com\/video\/\d+\?autoplay=1&muted=1&loop=1&controls=0.*dnt=1/
	);
	const toggle = toggleOf(player);
	await expect(toggle).toHaveAccessibleName('Pausar el video');
	// Starting by itself, it leaves the keyboard focus alone.
	await expect(toggle).not.toBeFocused();
	await toggle.click();
	await expect(toggle).toHaveAccessibleName('Reproducir el video');
});

test('for a visitor who asks for less motion, nothing loads from Vimeo until they press play', async ({
	page
}) => {
	const calls: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('vimeo.com')) calls.push(request.url());
	});
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/estudio/', { waitUntil: 'networkidle' });
	expect(calls).toEqual([]);
	await page.getByRole('button', { name: 'Ver el video' }).click();
	const player = page.locator(ARTISTS_FILM);
	await expect(player).toHaveAttribute('src', /player\.vimeo\.com\/video\/\d+\?.*dnt=1/);
	await expect.poll(() => calls.length).toBeGreaterThan(0);
	// The button they pressed is gone, so the focus follows to the one that stops the film.
	await expect(toggleOf(player)).toBeFocused();
});

test('the film on the home page runs by itself, silent, once the visitor reaches it', async ({
	page
}) => {
	const asked: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('silu-galeria.mp4')) asked.push(request.url());
	});
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	// Nothing of it is downloaded while it is still below the first screen.
	expect(asked).toEqual([]);

	const film = page.locator('video[aria-label^="Película sin sonido"]');
	await film.scrollIntoViewIfNeeded();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(false);
	expect(
		await film.evaluate((video: HTMLVideoElement) => video.muted && video.loop && !video.controls)
	).toBe(true);
	await expect(toggleOf(film)).toHaveAccessibleName('Pausar el video');
	await toggleOf(film).click();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
});

test('the home page opens on a photo that runs edge to edge', async ({ page }) => {
	await page.goto('/');
	await settled(page);
	const photo = page.getByRole('img', { name: /Interior de la galería Silu/ });
	const box = await photo.boundingBox();
	const viewport = page.viewportSize();
	expect(box?.x).toBe(0);
	expect(box?.width).toBe(viewport?.width);
	await expect(page.getByRole('link', { name: 'Cómo llegar' }).first()).toBeInViewport();
});

test('a phone opens the home page on a square photo with the way there in view, and a wide screen on a horizontal one', async ({
	page
}) => {
	const opening = page.getByRole('img', { name: /Interior de la galería Silu/ });
	const shown = () =>
		opening.evaluate((img: HTMLImageElement) => ({
			file: img.currentSrc,
			box: img.getBoundingClientRect().toJSON()
		}));

	await page.setViewportSize(PHONE);
	await page.goto('/');
	await settled(page);
	await expect.poll(async () => (await shown()).file).toContain('sala-01-alta');
	const onPhone = await shown();
	// Square and edge to edge: half as tall again as the horizontal photo a phone once got.
	expect(onPhone.box.x).toBe(0);
	expect(onPhone.box.width).toBe(PHONE.width);
	expect(Math.round(onPhone.box.height)).toBe(PHONE.width);
	// And the way there is still whole on the first screen, under what Silu is.
	await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 });
	await expect(page.getByRole('link', { name: 'Cómo llegar' }).first()).toBeInViewport({
		ratio: 1
	});

	await page.setViewportSize({ width: 1440, height: 900 });
	await expect.poll(async () => (await shown()).file).not.toContain('alta');
	const onWide = await shown();
	expect(onWide.file).toContain('sala-01');
	expect(onWide.box.width).toBe(1440);
	expect(onWide.box.width).toBeGreaterThan(onWide.box.height * 2);
});

test('a phone shows the rooms as upright photos in two columns, a wide screen as horizontal ones', async ({
	page
}) => {
	const tall = page.getByRole('img', { name: /Consola de madera con una pequeña escultura/ });
	const wide = page.getByRole('img', { name: /Pasillo de la galería con relieves a ambos lados/ });
	/** How many photos of each shape the browser has fetched so far. */
	const fetched = () =>
		page.evaluate(() => {
			const names = performance.getEntriesByType('resource').map((entry) => entry.name);
			return {
				tall: names.filter((name) => /\/alta-\d+\./.test(name)).length,
				wide: names.filter((name) => /\/sala-0[2367]\./.test(name)).length
			};
		});

	await page.setViewportSize(PHONE);
	await page.goto('/');
	await tall.scrollIntoViewIfNeeded();
	await expect(tall).toBeVisible();
	await expect(wide).toBeHidden();
	const boxes = await page
		.locator('main .columns-2 img')
		.evaluateAll((photos) => photos.map((photo) => photo.getBoundingClientRect().toJSON()));
	expect(boxes).toHaveLength(6);
	// Two columns: every photo is a little under half the screen wide, at one of two places.
	expect(new Set(boxes.map((box) => Math.round(box.x))).size).toBe(2);
	for (const box of boxes) {
		expect(box.width).toBeLessThan(PHONE.width / 2);
		expect(box.width).toBeGreaterThan(PHONE.width / 3);
		expect(box.height).toBeGreaterThanOrEqual(box.width - 1);
	}
	// The horizontal photos are for another screen, so this one never fetches them.
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await settled(page);
	expect((await fetched()).tall).toBeGreaterThan(0);
	expect((await fetched()).wide).toBe(0);

	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto('/');
	await wide.scrollIntoViewIfNeeded();
	await expect(wide).toBeVisible();
	await expect(tall).toBeHidden();
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await settled(page);
	expect((await fetched()).wide).toBeGreaterThan(0);
	expect((await fetched()).tall).toBe(0);
});

test('the tab shows the logo on no background, dark on a light tab and light on a dark one', async ({
	page,
	request
}) => {
	await page.goto('/');
	const icons = await page.locator('link[rel="icon"]').evaluateAll((links) =>
		links.map((link) => ({
			href: new URL(link.getAttribute('href') ?? '', location.href).pathname,
			media: link.getAttribute('media')
		}))
	);
	expect(icons).toEqual([
		{ href: '/favicon.png', media: '(prefers-color-scheme: light)' },
		{ href: '/favicon-dark.png', media: '(prefers-color-scheme: dark)' }
	]);
	for (const { href } of icons) {
		const answer = await request.get(href);
		expect(answer.ok(), `${href}`).toBe(true);
		// A PNG with an alpha channel (colour type 6), so its corners can be see-through.
		const bytes = await answer.body();
		expect(bytes.subarray(1, 4).toString()).toBe('PNG');
		expect(bytes[25]).toBe(6);
	}
});

test('a shared link shows a picture that is really on the site', async ({ page, request }) => {
	for (const path of ['/', '/en/', '/obras/guijarro/', '/obras/obra-40/']) {
		await page.goto(path);
		const read = (property: string) =>
			page.locator(`meta[property="${property}"]`).getAttribute('content');
		const image = new URL((await read('og:image')) ?? '');
		// The card points at the address the site is served from. Here that is this server.
		const answer = await request.get(image.pathname);
		expect(answer.ok(), `${path}: ${image.pathname}`).toBe(true);
		expect(answer.headers()['content-type']).toMatch(/^image\//);
		expect(Number(await read('og:image:width'))).toBeGreaterThan(0);
		expect(Number(await read('og:image:height'))).toBeGreaterThan(0);
		expect(new URL((await read('og:url')) ?? '').pathname).toBe(path);
	}
	// The picture for the pages with none of their own is the size share cards are made for.
	await page.goto('/');
	expect(await page.locator('meta[property="og:image:width"]').getAttribute('content')).toBe(
		'1200'
	);
	expect(await page.locator('meta[property="og:image:height"]').getAttribute('content')).toBe(
		'630'
	);
});

for (const width of [1280, 1440, 1920]) {
	test(`on a ${width} pixel wide screen the opening photo is never a small copy stretched out`, async ({
		page
	}) => {
		// The photo itself is 2560 pixels wide. An ordinary screen must get as many pixels as
		// it has, up to that, and never the half-size copy it once got.
		const OWN_WIDTH = 2560;
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const photo = page.getByRole('img', { name: /Interior de la galería Silu/ });
		await expect
			.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
			.toBeGreaterThan(0);
		const shown = await photo.evaluate((img: HTMLImageElement) => img.naturalWidth);
		expect(shown).toBeGreaterThanOrEqual(Math.min(width, OWN_WIDTH));
	});
}

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
	// Half a screen is far enough for both shadows to have moved, and no motion is back at rest.
	const HALF_A_SCREEN = 0.5;
	const scrollScreens = (screens: number) =>
		page.evaluate((count) => scrollTo({ top: innerHeight * count, behavior: 'instant' }), screens);

	await page.goto('/obras/');
	const atTheTop = await pose();
	await scrollScreens(HALF_A_SCREEN);
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
	await scrollScreens(HALF_A_SCREEN);
	await page.waitForTimeout(200);
	expect(await pose()).toEqual(still);
});

test('the shadow of the pergola still covers the whole screen wherever its motion takes it', async ({
	page
}) => {
	// A laptop, a phone held upright and a very wide monitor: the wider the screen, the further
	// a turn swings the ends of the layer.
	const SCREENS = [
		{ width: 1280, height: 720 },
		{ width: 390, height: 844 },
		{ width: 2560, height: 1080 }
	];
	// Places where the slide and the turn are both near their furthest.
	const SCROLLED = [0, 1, 1.375, 3, 4.125, 5, 6.875, 9.625, 12.375, 15.125, 20.625];
	for (const viewport of SCREENS) {
		await page.setViewportSize(viewport);
		await page.goto('/obras/');
		for (const screens of SCROLLED) {
			await page.evaluate(
				(count) => scrollTo({ top: innerHeight * count, behavior: 'instant' }),
				screens
			);
			// The pergola's shadow runs across the whole screen, so each corner of the screen has to
			// fall inside its layer even when it is moved and turned. (The plant only fills one corner
			// of its own layer, so that layer has nothing to show or to miss elsewhere.) A corner is
			// mapped back into the layer's own space and compared with its size.
			const uncovered = await page.evaluate(({ width, height }) => {
				const corners = [
					[0, 0],
					[width, 0],
					[0, height],
					[width, height]
				];
				const shadow = document.querySelector('#wall-light [data-part="slats"]');
				const box = shadow?.parentElement?.getBoundingClientRect();
				if (!shadow || !box) return ['the shadow is missing'];
				const style = getComputedStyle(shadow);
				const length = (value: string, full: number): number =>
					value.endsWith('%') ? (parseFloat(value) / 100) * full : parseFloat(value);
				const [originX, originY] = style.transformOrigin.split(' ').map(parseFloat);
				const [moveX = '0', moveY = '0'] =
					style.translate === 'none' ? [] : style.translate.split(' ');
				const shiftX = length(moveX, box.width);
				const shiftY = length(moveY, box.height);
				const angle = style.rotate === 'none' ? 0 : (parseFloat(style.rotate) * Math.PI) / 180;
				return corners.flatMap(([x, y]) => {
					// Undo the move, then undo the turn about the layer's origin.
					const dx = x - box.left - shiftX - originX;
					const dy = y - box.top - shiftY - originY;
					const localX = originX + dx * Math.cos(-angle) - dy * Math.sin(-angle);
					const localY = originY + dx * Math.sin(-angle) + dy * Math.cos(-angle);
					const inside = localX >= 0 && localY >= 0 && localX <= box.width && localY <= box.height;
					return inside ? [] : [`the corner ${x},${y} is bare`];
				});
			}, viewport);
			expect(uncovered, `${viewport.width} wide, after ${screens} screens`).toEqual([]);
		}
	}
});

test('the daylight steps aside for visitors who ask for more contrast', async ({ page }) => {
	await page.emulateMedia({ contrast: 'more' });
	await page.goto('/');
	await expect(page.locator('#wall-light')).toBeHidden();
});

test('what lies below the screen waits, and arrives when the visitor reaches it', async ({
	page
}) => {
	await page.goto('/');
	const artists = page.locator('section[aria-labelledby="home-artists"] .reveal').first();
	await expect(artists).toHaveAttribute('data-reveal', 'waiting');
	await expect(artists).toHaveCSS('opacity', '0');
	await artists.scrollIntoViewIfNeeded();
	await expect(artists).toHaveAttribute('data-reveal', 'shown');
	await expect(artists).toHaveCSS('opacity', '1');
	// Once seen it stays: going back up and down again does not replay it.
	await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
	await expect(artists).toHaveAttribute('data-reveal', 'shown');
});

test('what is on screen when a page opens is there at once, fully visible once it has arrived', async ({
	page
}) => {
	await page.goto('/obras/');
	await settled(page);
	await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
	const firstWork = page.locator(`${WALL} > li`).first();
	await expect(firstWork).toHaveAttribute('data-reveal', 'shown');
	await expect(firstWork).toHaveCSS('opacity', '1');
});

test('nothing waits or moves into place for visitors who ask for less motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
	// Anything fainter than fully visible would be something still waiting to arrive. Parts
	// that are never drawn at all, like the sources inside a video, report no opacity.
	const faint = await page.evaluate(() =>
		[...document.querySelectorAll('main *')]
			.filter((element) => Number(getComputedStyle(element).opacity || 1) < 1)
			.map((element) => element.tagName)
	);
	expect(faint).toEqual([]);
});

test('a printed page shows everything, also what the visitor never scrolled to', async ({
	page
}) => {
	await page.goto('/');
	await page.emulateMedia({ media: 'print' });
	const artists = page.locator('section[aria-labelledby="home-artists"] .reveal').first();
	await expect(artists).toHaveCSS('opacity', '1');
});

test('the whole page is there for a visitor whose browser runs no scripts', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/');
	const artists = page.locator('section[aria-labelledby="home-artists"] .reveal').first();
	await expect(artists).toHaveCSS('opacity', '1');
	await expect(artists).not.toHaveAttribute('data-reveal', /.+/);
	await context.close();
});

test('a work on the wall comes a hair closer under the pointer', async ({ page }) => {
	await page.goto('/obras/');
	await settled(page);
	const tile = page.locator(`${WALL} > li`).first();
	const photo = tile.locator('img');
	const before = await photo.boundingBox();
	await tile.hover();
	await expect
		.poll(async () => (await photo.boundingBox())?.width ?? 0)
		.toBeGreaterThan(before?.width ?? 0);
	const after = await photo.boundingBox();
	// A hair, not a jump: the photo grows by about two percent.
	expect((after?.width ?? 0) / (before?.width ?? 1)).toBeLessThan(1.03);
});

test('a few works carry sample tags while the site is a preview, and the rest carry none', async ({
	page
}) => {
	await page.goto('/obras/');
	const wall = page.locator(WALL);
	await expect(wall.getByText('En la galería', { exact: true })).toHaveCount(3);
	await expect(wall.getByText('Vendida', { exact: true })).toHaveCount(2);
	await expect(page.getByText(/^(Disponible|Reservada)$/)).toHaveCount(0);
	// A tag is small and plain: a word in a frame, smaller than the title above it.
	const tag = wall.getByText('Vendida', { exact: true }).first();
	await expect(tag).toHaveCSS('font-size', '11px');
	expect(await tag.evaluate((element) => element.children.length)).toBe(0);
	// A work's tag is the same on the wall and on its own page.
	await page.goto('/obras/resplandor-circular/');
	await expect(page.getByRole('main').getByText('Vendida', { exact: true })).toBeVisible();
});

test('the visit page draws its own map, and asks Google for one only when the visitor wants it', async ({
	page
}) => {
	const asked: string[] = [];
	page.on('request', (request) => {
		if (/google\.com\/maps/.test(request.url())) asked.push(request.url());
	});
	await page.goto('/visitar/');
	const map = page.getByRole('img', { name: /^Mapa de la costa entre Punta del Este/ });
	await map.scrollIntoViewIfNeeded();
	await expect(map).toBeVisible();
	await expect(page.getByRole('link', { name: '© OpenStreetMap' })).toBeVisible();
	expect(asked).toEqual([]);

	await page.getByRole('button', { name: 'Ver mapa interactivo' }).click();
	const interactive = page.locator(
		'iframe[title="Mapa: ubicación de la galería Silu en Manantiales"]'
	);
	await expect(interactive).toHaveAttribute('src', /-34\.9051398,-54\.8278289/);
	await expect(interactive).toBeFocused();
	await expect(map).toHaveCount(0);
	await expect.poll(() => asked.length).toBeGreaterThan(0);
});

for (const [screen, size] of [
	['a wide screen', { width: 1440, height: 900 }],
	['a phone', PHONE]
] as const) {
	test(`on ${screen} the map comes up close under the visit details without covering them`, async ({
		page
	}) => {
		await page.setViewportSize(size);
		await page.goto('/visitar/');
		const main = page.getByRole('main');
		const directions = main.getByRole('link', { name: 'Cómo llegar' });
		const map = page.getByRole('img', { name: /^Mapa de la costa/ });
		await directions.scrollIntoViewIfNeeded();
		await settled(page);
		const [button, drawing] = await Promise.all([directions.boundingBox(), map.boundingBox()]);
		// The map starts no lower than a little under the buttons: no empty band between them.
		const gap = (drawing?.y ?? 0) - ((button?.y ?? 0) + (button?.height ?? 0));
		expect(gap).toBeLessThan(40);
		// Where the two overlap, the buttons and links win: each can still be pressed.
		for (const name of ['Cómo llegar', 'Escribir por WhatsApp']) {
			await main.getByRole('link', { name }).click({ trial: true });
		}
	});
}

for (const [screen, size] of [
	['a wide screen', { width: 1440, height: 900 }],
	['a phone', PHONE]
] as const) {
	test(`on ${screen} the names on the map sit where the drawing puts their places`, async ({
		page
	}) => {
		await page.setViewportSize(size);
		await page.goto('/visitar/');
		const map = page.getByRole('img', { name: /^Mapa de la costa/ });
		await map.scrollIntoViewIfNeeded();
		await settled(page);
		// How far the gallery's dot and La Barra's dot are from their points in the drawing.
		const drift = await map.evaluate((box) => {
			const drawing = box.querySelector('svg');
			const matrix = drawing?.getScreenCTM();
			if (!drawing || !matrix) return [];
			const onScreen = (x: number, y: number): DOMPoint =>
				new DOMPoint(x, y).matrixTransform(matrix);
			const centreOf = (element: Element): { x: number; y: number } => {
				const { left, top, width, height } = element.getBoundingClientRect();
				return { x: left + width / 2, y: top + height / 2 };
			};
			const { width, height } = drawing.viewBox.baseVal;
			return [...box.querySelectorAll<HTMLElement>('.map-point')]
				.filter((point) => point.querySelector('.rounded-full') && point.offsetParent !== null)
				.map((point) => {
					const x = Number(point.style.getPropertyValue('--x'));
					const y = Number(point.style.getPropertyValue('--y'));
					const drawn = onScreen(x * width, y * height);
					const dot = centreOf(point.querySelector('.rounded-full') ?? point);
					return Math.hypot(dot.x - drawn.x, dot.y - drawn.y);
				});
		});
		// The gallery and La Barra show on every screen. The far towns only on a wide one.
		expect(drift.length).toBeGreaterThanOrEqual(2);
		for (const distance of drift) expect(distance).toBeLessThan(1.5);
		// The gallery is in the middle of the map, and nothing on it spills sideways.
		const [pin, frame] = await Promise.all([
			map.locator('.map-pin').boundingBox(),
			map.boundingBox()
		]);
		const pinCentre = (pin?.x ?? 0) + (pin?.width ?? 0) / 2;
		expect(Math.abs(pinCentre - ((frame?.x ?? 0) + (frame?.width ?? 0) / 2))).toBeLessThan(1.5);
	});
}

test('the coast road is drawn as the map arrives, and is simply there without motion or scripts', async ({
	page,
	browser
}) => {
	await page.goto('/visitar/');
	const road = page.locator('path.drawn-line');
	await expect(road).toHaveCSS('stroke-dashoffset', '1px');
	await road.scrollIntoViewIfNeeded();
	await expect(road).toHaveCSS('animation-name', 'draw-line');
	await settled(page);
	await expect(road).toHaveCSS('stroke-dashoffset', '0px');

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await expect(road).toHaveCSS('animation-name', 'none');
	await expect(road).toHaveCSS('stroke-dashoffset', '0px');

	const context = await browser.newContext({ javaScriptEnabled: false });
	const still = await context.newPage();
	await still.goto('/visitar/');
	await expect(still.locator('path.drawn-line')).toHaveCSS('stroke-dashoffset', '0px');
	await expect(still.locator('.map-pin')).toHaveCSS('opacity', '1');
	await context.close();
});

test('a button fills with colour under the pointer, and its label stays readable', async ({
	page
}) => {
	await page.goto('/');
	await settled(page);
	const button = page.getByRole('link', { name: 'Ver todas las obras' }).first();
	const fill = () => button.evaluate((link) => getComputedStyle(link, '::before').scale);
	expect(await fill()).toBe('1 0');
	await button.hover();
	await expect.poll(fill).toMatch(/^1( 1)?$/);
	// Wall coloured words on ink.
	await expect(button).toHaveCSS('color', 'rgb(246, 244, 239)');
	await expect
		.poll(() => button.evaluate((link) => getComputedStyle(link, '::before').backgroundColor))
		.toBe('rgb(35, 33, 30)');
});

test('every work page lets a visitor ask about that very work, by WhatsApp and by email', async ({
	page
}) => {
	await page.goto('/obras/');
	const hrefs = await page
		.locator(`${WALL} a, ${CATALOG} a`)
		.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
	expect(hrefs).toHaveLength(WORKS);
	for (const href of hrefs) {
		const html = await (await page.request.get(href)).text();
		const links = [...html.matchAll(/href="([^"]+)"/g)].map(([, link]) =>
			link.replaceAll('&amp;', '&')
		);
		// The label's two links carry a message. The ones in the invitation to visit do not.
		const whatsapp = links
			.filter((link) => link.startsWith('https://wa.me/59895342939?text='))
			.map((link) => new URL(link).searchParams.get('text') ?? '');
		const mail = links
			.filter((link) => link.startsWith('mailto:info@silustudio.com?subject='))
			.map((link) => decodeURIComponent(link));
		expect(whatsapp, href).toHaveLength(1);
		expect(mail, href).toHaveLength(1);
		const slug = new URL(href).pathname.split('/').filter(Boolean).pop() ?? '';
		const title = /<h1[^>]*>([^<]+)<\/h1>/.exec(html)?.[1] ?? '';
		// A work with a title is asked about by it, one without by the address of its page.
		const names = slug.startsWith('obra-') ? `/obras/${slug}/` : `«${title}»`;
		expect(whatsapp[0], href).toContain(names);
		expect(mail[0], href).toContain(slug.startsWith('obra-') ? `/obras/${slug}/` : title);
	}
});

test("the sitemap lists every page once, in both languages, with the works' photos", async ({
	page
}) => {
	const xml = await (await page.request.get('/sitemap.xml')).text();
	const addresses = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, address]) => address);
	// Four main pages and every work, each in Spanish and in English.
	expect(addresses).toHaveLength((4 + WORKS) * 2);
	expect(new Set(addresses).size).toBe(addresses.length);
	for (const address of addresses)
		expect(address).toMatch(/^https:\/\/www\.silustudio\.com\/(.*\/)?$/);
	expect(xml.match(/hreflang="x-default"/g)).toHaveLength(addresses.length);
	expect(xml.match(/<image:loc>/g)?.length).toBeGreaterThan(WORKS);
	// A sample of them really are pages of this site.
	for (const address of [addresses[0], addresses[9], addresses.at(-1) ?? '']) {
		const response = await page.request.get(new URL(address).pathname);
		expect(response.status(), address).toBe(200);
	}
	const robots = await (await page.request.get('/robots.txt')).text();
	expect(robots).toContain('Sitemap: https://www.silustudio.com/sitemap.xml');
});

test('pages tell search engines what they are in valid structured data', async ({ page }) => {
	const read = () =>
		page.evaluate(() =>
			[...document.querySelectorAll('script[type="application/ld+json"]')].map(
				(script): Record<string, unknown> => JSON.parse(script.textContent ?? '{}')
			)
		);
	await page.goto('/visitar/');
	const [gallery] = await read();
	expect(gallery['@type']).toBe('ArtGallery');
	expect(gallery.address).toMatchObject({ addressLocality: 'Manantiales', addressCountry: 'UY' });
	await page.goto('/en/works/reencause/');
	const types = (await read()).map((data) => data['@type']);
	expect(types).toEqual(['VisualArtwork', 'BreadcrumbList']);
	await expect(page).toHaveTitle('Reencause · Works · Silu');
});

test('the catalog a visitor can download is a real PDF on the site, in both languages', async ({
	page
}) => {
	for (const [path, name, file] of [
		['/obras/', 'Descargar el catálogo (PDF)', 'catalogo-silu.pdf'],
		['/en/works/', 'Download the catalog (PDF)', 'silu-catalog.pdf']
	]) {
		await page.goto(path);
		// The button is in the first screen, and pressing it saves the file under its own name.
		const button = page.getByRole('link', { name });
		await expect(button).toBeInViewport();
		const [saved] = await Promise.all([page.waitForEvent('download'), button.click()]);
		expect(saved.suggestedFilename()).toBe(file);
		const href = await button.getAttribute('href');
		expect(href).toMatch(/\.pdf$/);
		const response = await page.request.get(href ?? '');
		expect(response.status(), href ?? '').toBe(200);
		expect(response.headers()['content-type']).toContain('pdf');
		expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
	}
});

test('a film of the workshop runs by itself, silent, only while it is on screen', async ({
	page
}) => {
	const asked: string[] = [];
	page.on('request', (request) => {
		if (/taller-\d\.mp4/.test(request.url())) asked.push(request.url());
	});
	await page.goto('/estudio/');
	await page.waitForLoadState('networkidle');
	// Nothing is downloaded for a film the visitor has not reached.
	expect(asked).toEqual([]);

	const film = page.locator('video[aria-label^="Video sin sonido"]').first();
	await film.scrollIntoViewIfNeeded();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(false);
	expect(await film.evaluate((video: HTMLVideoElement) => video.muted && video.loop)).toBe(true);
	await expect.poll(() => asked.length).toBeGreaterThan(0);

	// Scrolled away, it stops. The visitor can also stop it where it is.
	await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
	await film.scrollIntoViewIfNeeded();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(false);
	await expect(toggleOf(film)).toHaveAccessibleName('Pausar el video');
	await toggleOf(film).click();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
	// Having stopped it, the visitor is not overruled when it comes back on screen.
	await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
	await film.scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	expect(await film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
});

test('no film starts by itself for a visitor who asks for less motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/estudio/');
	const film = page.locator('video[aria-label^="Video sin sonido"]').first();
	await film.scrollIntoViewIfNeeded();
	await page.waitForTimeout(800);
	expect(await film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
	// The still is there, and the visitor can start the film.
	await expect(film).toHaveAttribute('poster', /taller-1\.jpg$/);
	await expect(toggleOf(film)).toHaveAccessibleName('Reproducir el video');
	await toggleOf(film).click();
	await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.paused)).toBe(false);
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
