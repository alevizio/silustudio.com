<script lang="ts">
	import { asset } from '$app/paths';
	import SilentFilm from '#lib/components/silent-film.svelte';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).home.gallery.film);
</script>

<!-- The artists' vertical film of the studio and gallery. It runs by itself, with no sound. -->
<SilentFilm
	{lang}
	video={asset('video/silu-galeria.mp4')}
	poster={asset('video/silu-galeria-poster.jpg')}
	label={copy.label}
	class={className}
/>
