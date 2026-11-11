<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	/** The drawing's own space. It is scaled to cover the screen, anchored where the light comes in. */
	const VIEW = { width: 1600, height: 1000 };
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
</script>

<!--
	Daylight on the gallery wall: the soft shadow of a pergola and of a plant. It stays where
	it is while the page scrolls, like light in a room, and drifts a little from the top of a
	page to its end (see layout.css). It is drawn behind everything, so it only ever falls on
	the wall, never on a work. It is decoration: hidden from screen readers and from print,
	and gone for anyone who asks for more contrast.
-->
<div
	id="wall-light"
	aria-hidden="true"
	class={cn(
		'pointer-events-none fixed inset-0 -z-10 overflow-hidden mask-wall-light contrast-more:hidden print:hidden forced-colors:hidden',
		className
	)}
>
	<!-- Larger than the screen on every side, so the drift never brings an edge into view. -->
	<div class="absolute -inset-overscan animate-wall-light text-ink opacity-wall-light">
		<svg
			viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
			preserveAspectRatio="xMaxYMin slice"
			fill="currentColor"
			class="size-full"
		>
			<defs>
				<filter id="wall-light-slats" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation={SLAT_BLUR} />
				</filter>
				<filter id="wall-light-fronds" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation={FROND_BLUR} />
				</filter>
			</defs>
			<g
				filter="url(#wall-light-slats)"
				transform={`rotate(${SLAT_ANGLE} ${VIEW.width} 0)`}
				data-part="slats"
			>
				<!-- Each slat is three drawings wide, so leaning it never brings one of its ends into view. -->
				{#each SLATS as slat (slat.y)}
					<rect x={-VIEW.width} y={slat.y} width={VIEW.width * 3} height={slat.thickness} />
				{/each}
			</g>
			<g filter="url(#wall-light-fronds)" data-part="fronds">
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
