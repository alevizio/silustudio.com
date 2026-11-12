<script lang="ts">
	import { asset } from '$app/paths';
	import SilentFilm from '#lib/components/silent-film.svelte';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** Which of the films, counting from 1. */
		film: 1 | 2 | 3;
		class?: string;
	}

	let { lang, film, class: className }: Props = $props();

	/*
	 * The artists' short vertical films of the workshop, in static/video, with no sound. Their
	 * descriptions are in the copy, in this order. Every address is written out in full
	 * because `asset()` checks each one against the files that exist.
	 */
	const FILMS = [
		{ video: asset('video/taller-1.mp4'), poster: asset('video/taller-1.jpg') },
		{ video: asset('video/taller-2.mp4'), poster: asset('video/taller-2.jpg') },
		{ video: asset('video/taller-3.mp4'), poster: asset('video/taller-3.jpg') }
	];

	const source = $derived(FILMS[film - 1]);
	const label = $derived(copyFor(lang).studio.reels.labels[film - 1]);
</script>

<!-- One film of the workshop, hung among the wall texts of the studio page. -->
<SilentFilm
	{lang}
	video={source.video}
	poster={source.poster}
	{label}
	class={cn('reveal', className)}
/>
