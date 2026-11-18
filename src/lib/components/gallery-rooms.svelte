<script lang="ts">
	import roomConsole from '#lib/assets/gallery/sala-02.jpg?enhanced';
	import roomCorridor from '#lib/assets/gallery/sala-03.jpg?enhanced';
	import roomRoots from '#lib/assets/gallery/sala-06.jpg?enhanced';
	import roomPlinths from '#lib/assets/gallery/sala-07.jpg?enhanced';
	import GalleryFilm from '#lib/components/gallery-film.svelte';
	import PhotoColumns from '#lib/components/photo-columns.svelte';
	import { GALLERY_TALL_PHOTOS } from '#lib/content/images.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const SIZES = {
		wide: '(min-width: 768px) 62vw, 100vw',
		narrow: '(min-width: 768px) 21vw, 100vw'
	};
	/** The rooms as a wide screen shows them: horizontal photos, one wide over three smaller. */
	const rooms = [
		{ key: 'console', picture: roomConsole, sizes: SIZES.wide, place: 'col-span-3' },
		{ key: 'corridor', picture: roomCorridor, sizes: SIZES.narrow, place: '' },
		{ key: 'roots', picture: roomRoots, sizes: SIZES.narrow, place: 'reveal-after-1' },
		{ key: 'plinths', picture: roomPlinths, sizes: SIZES.narrow, place: 'reveal-after-2' }
	] as const;

	const copy = $derived(copyFor(lang).home.gallery);
</script>

<!--
	The gallery in a film and photos. Each screen gets photos of its own shape. On a phone the
	film comes first and the rooms follow as upright photos in two columns. On a wide screen
	the film sets the height of the row, and horizontal photos beside it fill that height.
	Only the photos a screen shows are loaded.
-->
<div class={cn('grid gap-4 md:grid-cols-12 md:gap-6', className)}>
	<GalleryFilm {lang} class="reveal md:col-span-4" />
	<PhotoColumns photos={GALLERY_TALL_PHOTOS} alts={copy.tallAlts} class="md:hidden" />
	<div class="hidden grid-cols-3 grid-rows-gallery gap-6 md:col-span-8 md:grid">
		{#each rooms as room (room.key)}
			<div class={['relative reveal', room.place]}>
				<enhanced:img
					src={room.picture}
					alt={copy.alts[room.key]}
					sizes={room.sizes}
					loading="lazy"
					class="absolute inset-0 size-full object-cover"
				/>
			</div>
		{/each}
	</div>
</div>
