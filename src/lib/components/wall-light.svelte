<script lang="ts">
	import { innerHeight, scrollY } from 'svelte/reactivity/window';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	/** The drawing's own space. It is scaled to cover the screen, anchored where the light comes in. */
	const VIEW = { width: 1600, height: 1000 };
	/** What both shadows share: the same space, covering the screen from the top right, in the text colour. */
	const DRAWING = {
		viewBox: `0 0 ${VIEW.width} ${VIEW.height}`,
		preserveAspectRatio: 'xMaxYMin slice',
		fill: 'currentColor'
	};
	/** How far the slats lean, and how much each kind of shadow is blurred. */
	const SLAT_ANGLE = -22;
	const SLAT_BLUR = 16;
	const FROND_BLUR = 22;

	/** The slats of a pergola, top to bottom: where each one starts and how thick it is. */
	const SLATS = [
		{ y: -140, thickness: 38 },
		{ y: -40, thickness: 30 },
		{ y: 48, thickness: 52 },
		{ y: 170, thickness: 28 },
		{ y: 262, thickness: 44 },
		{ y: 384, thickness: 34 },
		{ y: 482, thickness: 58 },
		{ y: 612, thickness: 30 },
		{ y: 706, thickness: 46 },
		{ y: 828, thickness: 36 },
		{ y: 930, thickness: 54 },
		{ y: 1058, thickness: 30 },
		{ y: 1150, thickness: 44 },
		{ y: 1270, thickness: 36 }
	];

	/** A plant by the window. Each frond grows from the plant's root at an angle. */
	const PLANT = { x: 1560, y: 1080 };
	const FRONDS = [
		{ angle: -160, length: 620, width: 30 },
		{ angle: -146, length: 760, width: 36 },
		{ angle: -131, length: 680, width: 28 },
		{ angle: -115, length: 560, width: 32 }
	];

	/** Fine enough for smooth motion, and it keeps the number written to the page short. */
	const STEPS_PER_SCREEN = 1000;

	// How many screens the visitor has scrolled. This one number is all the script hands over:
	// layout.css turns it into the slow motion of the light. It has to be written on the
	// element itself, because a style sheet cannot read the scroll position on its own.
	const screens = $derived(
		Math.round(((scrollY.current ?? 0) / (innerHeight.current || 1)) * STEPS_PER_SCREEN) /
			STEPS_PER_SCREEN
	);
</script>

<!--
	Daylight on the gallery wall: the soft shadow of a pergola and of a plant. It stays where
	it is while the page scrolls, like light in a room, and as the visitor scrolls it moves the
	way light does over an afternoon: the pergola's shadow slides and turns a little, and the
	fronds sway (see layout.css). It is drawn behind everything, so it only ever falls on the
	wall, never on a work. It is decoration: hidden from screen readers and from print, and
	gone for anyone who asks for more contrast.
-->
<div
	id="wall-light"
	aria-hidden="true"
	style:--wall-light-screens={screens}
	class={cn(
		'pointer-events-none fixed inset-0 -z-10 overflow-hidden mask-wall-light contrast-more:hidden print:hidden forced-colors:hidden',
		className
	)}
>
	<!--
		Larger than the screen on every side, so no motion ever brings an edge into view. Each
		shadow is its own layer: once drawn and blurred, moving it costs the browser nothing.
	-->
	<div class="absolute -inset-overscan text-ink opacity-wall-light">
		<svg {...DRAWING} data-part="slats" class="absolute inset-0 size-full wall-light-slats">
			<filter id="wall-light-slats-blur" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur stdDeviation={SLAT_BLUR} />
			</filter>
			<g filter="url(#wall-light-slats-blur)" transform={`rotate(${SLAT_ANGLE} ${VIEW.width} 0)`}>
				<!-- Each slat is three drawings wide, so leaning it never brings one of its ends into view. -->
				{#each SLATS as slat (slat.y)}
					<rect x={-VIEW.width} y={slat.y} width={VIEW.width * 3} height={slat.thickness} />
				{/each}
			</g>
		</svg>
		<svg {...DRAWING} data-part="fronds" class="absolute inset-0 size-full wall-light-fronds">
			<filter id="wall-light-fronds-blur" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur stdDeviation={FROND_BLUR} />
			</filter>
			<g filter="url(#wall-light-fronds-blur)">
				{#each FRONDS as frond (frond.angle)}
					<ellipse
						cx={PLANT.x + frond.length / 2}
						cy={PLANT.y}
						rx={frond.length / 2}
						ry={frond.width / 2}
						transform={`rotate(${frond.angle} ${PLANT.x} ${PLANT.y})`}
					/>
				{/each}
			</g>
		</svg>
	</div>
</div>
