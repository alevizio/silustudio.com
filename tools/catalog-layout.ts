/*
 * Where a work's photos and its words go on a page of the PDF catalog (catalog-pdf.ts).
 *
 * The page is upright, the shape of a phone, because that is where the catalog is opened. A
 * work's photos are hung on it as a mosaic, the way the artists laid out their own catalog:
 * every photo keeps its own shape, none is cropped, and the details are large, not thumbnails.
 *
 * There are four ways to hang a work. Each one is tried and the one that shows the photos
 * largest wins, among those that keep the photos in proportion: a detail is never larger than
 * the main photo, and never a thumbnail beside it. The main photo counts for a little more
 * than a detail, and a photo twice the size counts for less than twice as much, so one huge
 * photo loses to a page where every photo is a good size:
 *
 *   beside   the main photo with the words beside it, and the details in a row under them
 *   column   the main photo on the left and the details one over another on the right
 *   stack    the main photo on top and the details in a row under it, with the words beside
 *            the details or under them
 *   row      every photo side by side
 *
 * Everything is measured in millimetres from the top left corner of the room the page gives
 * the work.
 */

export interface Size {
	width: number;
	height: number;
}

export interface Box extends Size {
	x: number;
	y: number;
}

export interface WorkLayout {
	/** One box for each photo, in the order the shapes were given. */
	photos: Box[];
	words: Box;
}

/** The space between two photos, and between the photos and the words. */
export const GAP = 5;
/**
 * The height the words need when they run the whole width of the page: a title on two lines
 * over the longest size and material the catalog has today. catalog-pdf.ts stops if a work
 * ever needs more.
 */
export const WORDS_BAND = 48;
/** The narrowest column the words can be set in. */
export const WORDS_COLUMN = 58;
/** How much more the main photo counts than a detail when the ways to hang a work are compared. */
const MAIN_WEIGHT = 1.25;
/** A detail under this share of the main photo's size (along one side) is a thumbnail. */
const THUMBNAIL = 0.45;
/** Sizes are compared with this much slack, so two photos of one size are never told apart. */
const SLACK = 0.001;
/** The search for the best split between two rows moves in steps of this size. */
const STEP = 1;
/** The shortest a row of photos may get before a way of hanging the work is given up. */
const SHORTEST_ROW = 30;

const sum = (numbers: number[]): number => numbers.reduce((total, number) => total + number, 0);

/**
 * Photos side by side from the left edge, at one height: as tall as the room given, and
 * together no wider than it. `y` is where the row starts.
 */
const inRow = (shapes: number[], room: Size, y: number): Box[] => {
	const tall = Math.min(room.height, (room.width - GAP * (shapes.length - 1)) / sum(shapes));
	let left = 0;
	return shapes.map((shape) => {
		const box = { x: left, y, width: shape * tall, height: tall };
		left += box.width + GAP;
		return box;
	});
};

const rightEdge = (boxes: Box[]): number => Math.max(0, ...boxes.map((box) => box.x + box.width));

/** A photo's size along one side: the side of the square with its area. */
const sideOf = ({ width, height }: Size): number => Math.sqrt(width * height);

/**
 * How well a layout shows the photos. Each photo adds the square root of its size, so growing
 * an already large photo adds little.
 */
const scoreOf = ({ photos }: WorkLayout): number =>
	sum(photos.map((photo, index) => Math.sqrt(sideOf(photo)) * (index === 0 ? MAIN_WEIGHT : 1)));

/** Whether the photos are in proportion: no detail larger than the main photo, none a thumbnail. */
const inProportion = ({ photos: [main, ...details] }: WorkLayout): boolean =>
	details.every((detail) => {
		const share = sideOf(detail) / sideOf(main);
		return share >= THUMBNAIL && share <= 1 + SLACK;
	});

/** The better of two layouts: one in proportion before one that is not, then the larger. */
const larger = (
	best: WorkLayout | undefined,
	next: WorkLayout | undefined
): WorkLayout | undefined => {
	if (!best || !next) return best ?? next;
	if (inProportion(next) !== inProportion(best)) return inProportion(next) ? next : best;
	return scoreOf(next) > scoreOf(best) ? next : best;
};

/** Every height the upper of two rows can take, leaving the lower one room. */
const splits = (area: Size): number[] => {
	const heights: number[] = [];
	for (let tall = SHORTEST_ROW; tall <= area.height - GAP - SHORTEST_ROW; tall += STEP) {
		heights.push(tall);
	}
	return heights;
};

/** The main photo with the words beside it, and the details in a row right under them. */
const beside = (main: number, details: number[], area: Size): WorkLayout | undefined => {
	const widest = area.width - GAP - WORDS_COLUMN;
	const hang = (tall: number): WorkLayout => {
		// A wide main photo stops at the width the words leave it, short of the height it was given.
		const height = Math.min(tall, widest / main);
		const photo = { x: 0, y: 0, width: main * height, height };
		const left = photo.width + GAP;
		const top = height + GAP;
		return {
			photos: [photo, ...inRow(details, { width: area.width, height: area.height - top }, top)],
			words: { x: left, y: 0, width: area.width - left, height }
		};
	};
	if (details.length === 0) return hang(area.height);
	return splits(area).map(hang).reduce(larger, undefined);
};

/** The main photo on the left, the details one over another on the right, the words under both. */
const column = (main: number, details: number[], area: Size): WorkLayout | undefined => {
	if (details.length === 0) return undefined;
	const between = GAP * (details.length - 1);
	// A column of details is as tall as the main photo when it is this many times narrower.
	const slim = sum(details.map((shape) => 1 / shape));
	const tall = Math.min(
		area.height - GAP - WORDS_BAND,
		(area.width - GAP + between / slim) / (main + 1 / slim)
	);
	const photo = { x: 0, y: 0, width: main * tall, height: tall };
	const width = (tall - between) / slim;
	let top = 0;
	const stacked = details.map((shape) => {
		const box = { x: photo.width + GAP, y: top, width, height: width / shape };
		top += box.height + GAP;
		return box;
	});
	return {
		photos: [photo, ...stacked],
		words: { x: 0, y: tall + GAP, width: area.width, height: WORDS_BAND }
	};
};

/**
 * The main photo on top and the details in a row under it. The words go beside the details,
 * or under them across the page, whichever shows the photos larger.
 */
const stack = (main: number, details: number[], area: Size): WorkLayout | undefined => {
	if (details.length === 0) return undefined;
	const hang = (tall: number): WorkLayout | undefined => {
		if (main * tall > area.width) return undefined;
		const photo = { x: 0, y: 0, width: main * tall, height: tall };
		const top = tall + GAP;
		const room = area.height - top;
		const narrow = inRow(details, { width: area.width - GAP - WORDS_COLUMN, height: room }, top);
		const left = rightEdge(narrow) + GAP;
		const wordsBeside = {
			photos: [photo, ...narrow],
			words: { x: left, y: top, width: area.width - left, height: room }
		};
		const wide = inRow(details, { width: area.width, height: room - GAP - WORDS_BAND }, top);
		if (wide[0].height < SHORTEST_ROW) return wordsBeside;
		const wordsUnder = {
			photos: [photo, ...wide],
			words: { x: 0, y: top + wide[0].height + GAP, width: area.width, height: WORDS_BAND }
		};
		return larger(wordsBeside, wordsUnder);
	};
	return splits(area).map(hang).reduce(larger, undefined);
};

/** Every photo side by side, and the words under them. */
const row = (main: number, details: number[], area: Size): WorkLayout => {
	const photos = inRow(
		[main, ...details],
		{ width: area.width, height: area.height - GAP - WORDS_BAND },
		0
	);
	return {
		photos,
		words: { x: 0, y: photos[0].height + GAP, width: area.width, height: WORDS_BAND }
	};
};

/**
 * Hangs a work in `area`. `shapes` are its photos as width divided by height, the main photo
 * first. A work with no photo gets the whole area for its words.
 */
export const layoutWork = (shapes: number[], area: Size): WorkLayout => {
	const [main, ...details] = shapes;
	if (main === undefined) return { photos: [], words: { x: 0, y: 0, ...area } };
	const ways = [beside, column, stack, row].map((way) => way(main, details, area));
	return ways.reduce(larger, undefined) ?? row(main, details, area);
};
