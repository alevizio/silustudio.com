<script lang="ts">
	import { COAST_MAP } from '#lib/content/coast-map.ts';
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import ArrowIcon from './arrow-icon.svelte';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).visit.map);

	/** Where a place's name is written, seen from its dot. */
	const NAME_SIDES = {
		right: 'top-1/2 left-3 -translate-y-1/2',
		above: 'bottom-9 left-1/2 -translate-x-1/2',
		belowLeft: 'top-3 right-0'
	};

	/**
	 * The towns named on the map, each with its name on the side that keeps it off the road.
	 * A phone shows only the middle of the drawing, so the `far` ones are left out there.
	 */
	const TOWNS = [
		{ name: 'Maldonado', side: 'right', far: true },
		{ name: 'Punta del Este', side: 'right', far: true },
		{ name: 'La Barra', side: 'above', far: false },
		{ name: 'José Ignacio', side: 'belowLeft', far: true }
	] as const;

	/**
	 * On a phone, the two ends of the coast road are named where the road leaves the map:
	 * Punta del Este to the west, under the road, and José Ignacio to the east, over it.
	 */
	const WAYS_OUT = [
		{ name: 'Punta del Este', direction: 'left', x: 0.285, y: 0.79, place: 'left-0' },
		{
			name: 'José Ignacio',
			direction: 'right',
			x: 0.715,
			y: 0.12,
			place: 'right-0 flex-row-reverse'
		}
	] as const;

	/** The gallery is the centre of the drawing. */
	const GALLERY = { x: 0.5, y: 0.5 };
	/** A stretch of Ruta 10 past the gallery with open land above it, for the road's name. */
	const ROAD_NAME = { x: 0.6, y: 0.33 };
	const SCALE_KM = 5;

	const nameClass = 'absolute text-label whitespace-nowrap text-ink-soft uppercase';
</script>

<!--
	The coast from Punta del Este to José Ignacio, drawn for this site from OpenStreetMap data
	in the colours of the wall, with the gallery on Ruta 10. It is one picture to a screen
	reader, described by its label. The names are text laid over the drawing, so they keep
	their size on any screen. To arrive, it needs the `reveal` class from whoever places it.
-->
<div
	role="img"
	aria-label={copy.alt}
	class={cn('relative aspect-square overflow-hidden coast-map md:aspect-coast', className)}
>
	<svg
		viewBox={`0 0 ${COAST_MAP.width} ${COAST_MAP.height}`}
		preserveAspectRatio="xMidYMid slice"
		aria-hidden="true"
		class="absolute inset-0 size-full fades-into-wall"
	>
		<path d={COAST_MAP.land} fill-rule="evenodd" class="fill-plate" />
		<path
			d={COAST_MAP.water}
			fill-rule="evenodd"
			stroke-width="0.6"
			class="fill-wall stroke-line"
		/>
		<path d={COAST_MAP.roads} stroke-width="0.8" class="fill-none stroke-sand/45" />
		<path d={COAST_MAP.shore} stroke-width="1" class="fill-none stroke-sand" />
		<path
			d={COAST_MAP.coastRoad}
			pathLength="1"
			stroke-width="1.5"
			stroke-linejoin="round"
			class="drawn-line fill-none stroke-ink"
		/>
	</svg>

	{#each TOWNS as town (town.name)}
		{@const place = COAST_MAP.places[town.name]}
		<p class={['map-point', town.far && 'max-md:hidden']} style:--x={place.x} style:--y={place.y}>
			<span class="absolute size-1.5 -translate-1/2 rounded-full bg-ink-soft"></span>
			<span class={cn(nameClass, NAME_SIDES[town.side])}>{town.name}</span>
		</p>
	{/each}

	{#each WAYS_OUT as way (way.name)}
		<p class="map-point md:hidden" style:--x={way.x} style:--y={way.y}>
			<span class={cn(nameClass, 'flex items-center gap-2', way.place)}>
				<ArrowIcon direction={way.direction} />
				{way.name}
			</span>
		</p>
	{/each}

	<p class="map-point" style:--x={ROAD_NAME.x} style:--y={ROAD_NAME.y}>
		<span class={cn(nameClass, '-translate-1/2 text-ink')}>{copy.road}</span>
	</p>

	<div class="map-point" style:--x={GALLERY.x} style:--y={GALLERY.y}>
		<span
			class="absolute size-3.5 -translate-1/2 map-pin rounded-full border border-ink bg-sand after:absolute after:-inset-px after:rounded-full after:border after:border-sand-deep after:opacity-0"
		></span>
		<p class="absolute top-4 left-3 flex flex-col whitespace-nowrap">
			<span class="text-label text-ink uppercase">{SITE.name}</span>
			<span class="font-serif text-lead leading-snug text-ink">{SITE.address.street}</span>
			<span class="text-sm text-ink-soft">{SITE.address.locality}</span>
		</p>
	</div>

	<p class={cn(nameClass, 'right-gutter bottom-5 md:bottom-12')}>{copy.sea}</p>

	<!-- The scale: its length is measured against the drawing, so it is true on any screen. -->
	<p
		class="absolute bottom-5 left-gutter h-1.5 map-length border-x border-b border-ink-soft md:bottom-12"
		style:--length={COAST_MAP.fiveKm}
	>
		<span
			class="absolute bottom-full left-0 pb-1.5 text-sm whitespace-nowrap text-ink-soft tabular-nums"
		>
			{SCALE_KM} km
		</span>
	</p>
</div>
