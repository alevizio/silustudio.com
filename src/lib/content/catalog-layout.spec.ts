import { describe, expect, it } from 'vitest';
import {
	GAP,
	WORDS_BAND,
	WORDS_COLUMN,
	layoutWork,
	type Box,
	type Size
} from '../../../tools/catalog-layout.ts';

/** The room an A4 page gives a work in the catalog, in millimetres. */
const AREA: Size = { width: 182, height: 247 };
const UPRIGHT = 9 / 16;
const WIDE = 3 / 2;
const SQUARE = 1;
/** Rounding leaves boxes a hair off; nothing may be off by more than this. */
const HAIR = 0.01;

const sizeOf = (box: Size): number => Math.sqrt(box.width * box.height);
const overlap = (a: Box, b: Box): boolean =>
	a.x < b.x + b.width - HAIR &&
	b.x < a.x + a.width - HAIR &&
	a.y < b.y + b.height - HAIR &&
	b.y < a.y + a.height - HAIR;

/** Every set of shapes a work in the catalog can have: a main photo and up to two details. */
const SHAPES = [UPRIGHT, 2 / 3, 3 / 4, SQUARE, 4 / 3, WIDE, 16 / 9];
const SETS: number[][] = [
	...SHAPES.map((main) => [main]),
	...SHAPES.flatMap((main) => SHAPES.map((detail) => [main, detail])),
	...SHAPES.flatMap((main) =>
		SHAPES.flatMap((first) => SHAPES.map((second) => [main, first, second]))
	)
];

describe('the layout of a work on a page of the PDF catalog (tools/catalog-layout.ts)', () => {
	it('keeps every photo and the words inside the page, whatever the shapes', () => {
		for (const shapes of SETS) {
			const { photos, words } = layoutWork(shapes, AREA);
			for (const box of [...photos, words]) {
				expect(box.x, `${shapes}`).toBeGreaterThanOrEqual(-HAIR);
				expect(box.y, `${shapes}`).toBeGreaterThanOrEqual(-HAIR);
				expect(box.x + box.width, `${shapes}`).toBeLessThanOrEqual(AREA.width + HAIR);
				expect(box.y + box.height, `${shapes}`).toBeLessThanOrEqual(AREA.height + HAIR);
			}
		}
	});

	it('never crops a photo: every box has the shape of its photo', () => {
		for (const shapes of SETS) {
			const { photos } = layoutWork(shapes, AREA);
			expect(photos).toHaveLength(shapes.length);
			photos.forEach((box, at) => {
				expect(box.width / box.height, `${shapes}`).toBeCloseTo(shapes[at], 5);
			});
		}
	});

	it('never puts one thing over another', () => {
		for (const shapes of SETS) {
			const { photos, words } = layoutWork(shapes, AREA);
			const boxes = [...photos, words];
			boxes.forEach((box, at) => {
				for (const other of boxes.slice(at + 1)) {
					expect(overlap(box, other), `${shapes}`).toBe(false);
				}
			});
		}
	});

	it('always leaves the words room to be read', () => {
		for (const shapes of SETS) {
			const { words } = layoutWork(shapes, AREA);
			expect(words.width, `${shapes}`).toBeGreaterThanOrEqual(WORDS_COLUMN - HAIR);
			// Across the page they get their band; beside a photo, at least as much height.
			expect(words.height, `${shapes}`).toBeGreaterThanOrEqual(WORDS_BAND - HAIR);
		}
	});

	it('shows the details large, never as thumbnails beside one huge photo', () => {
		for (const shapes of SETS.filter((set) => set.length > 1)) {
			const [main, ...details] = layoutWork(shapes, AREA).photos;
			for (const detail of details) {
				expect(sizeOf(detail), `${shapes}`).toBeGreaterThan(sizeOf(main) * 0.4);
			}
		}
	});

	it('hangs three upright photos as a tall main photo with the details one over another', () => {
		const { photos, words } = layoutWork([UPRIGHT, UPRIGHT, UPRIGHT], AREA);
		const [main, first, second] = photos;
		// The main photo takes the height the words leave, and the details stand beside it.
		expect(main.height).toBeCloseTo(AREA.height - GAP - WORDS_BAND, 5);
		expect(first.x).toBeCloseTo(main.width + GAP, 5);
		expect(second.x).toBeCloseTo(first.x, 5);
		expect(second.y).toBeCloseTo(first.height + GAP, 5);
		// Together the details are exactly as tall as the main photo.
		expect(second.y + second.height).toBeCloseTo(main.height, 5);
		expect(words).toEqual({ x: 0, y: main.height + GAP, width: AREA.width, height: WORDS_BAND });
	});

	it('hangs two upright photos side by side at the same size', () => {
		const [main, detail] = layoutWork([UPRIGHT, UPRIGHT], AREA).photos;
		expect(detail.width).toBeCloseTo(main.width, 5);
		expect(detail.height).toBeCloseTo(main.height, 5);
		expect(main.width + GAP + detail.width).toBeCloseTo(AREA.width, 5);
	});

	it('gives a single upright photo most of the page, with the words beside it', () => {
		const { photos, words } = layoutWork([UPRIGHT], AREA);
		expect(photos[0].height).toBeGreaterThan(AREA.height * 0.8);
		expect(words.x).toBeCloseTo(photos[0].width + GAP, 5);
		expect(words.height).toBeCloseTo(photos[0].height, 5);
	});

	it('gives a single wide photo the whole width, with the words under it', () => {
		const { photos, words } = layoutWork([WIDE], AREA);
		expect(photos[0].width).toBeCloseTo(AREA.width, 5);
		expect(words.y).toBeCloseTo(photos[0].height + GAP, 5);
		expect(words.width).toBe(AREA.width);
	});

	it('gives a work with no photo the whole page for its words', () => {
		expect(layoutWork([], AREA)).toEqual({ photos: [], words: { x: 0, y: 0, ...AREA } });
	});
});
