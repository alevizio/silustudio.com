<script lang="ts">
	import { asset } from '$app/paths';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).home.gallery.film);
	// The film has music and no speech, so the caption track is a single "[Music]" line.
	const captions = $derived(
		lang === 'es' ? asset('video/silu-galeria.es.vtt') : asset('video/silu-galeria.en.vtt')
	);
</script>

<!-- The artists' vertical film of the studio and gallery. It never plays on its own. -->
<video
	controls
	playsinline
	preload="none"
	poster={asset('video/silu-galeria-poster.jpg')}
	aria-label={copy.label}
	class={cn('aspect-film w-full bg-plate object-cover', className)}
>
	<source src={asset('video/silu-galeria.mp4')} type="video/mp4" />
	<track kind="captions" src={captions} srclang={lang} label={copy.captions} default />
</video>
