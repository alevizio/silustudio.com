<script lang="ts">
	import { asset } from '$app/paths';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	/*
	 * The artists' short vertical films of the workshop, in static/video. They have music and
	 * no speech, so each caption track is a single "[Music]" line. Their descriptions are in
	 * the copy, in this order. Every address is written out in full because `asset()` checks
	 * each one against the files that exist.
	 */
	const REELS = [
		{
			video: asset('video/taller-1.mp4'),
			poster: asset('video/taller-1.jpg'),
			captions: { es: asset('video/taller-1.es.vtt'), en: asset('video/taller-1.en.vtt') }
		},
		{
			video: asset('video/taller-2.mp4'),
			poster: asset('video/taller-2.jpg'),
			captions: { es: asset('video/taller-2.es.vtt'), en: asset('video/taller-2.en.vtt') }
		},
		{
			video: asset('video/taller-3.mp4'),
			poster: asset('video/taller-3.jpg'),
			captions: { es: asset('video/taller-3.es.vtt'), en: asset('video/taller-3.en.vtt') }
		}
	];

	const copy = $derived(copyFor(lang).studio.reels);
</script>

<!--
	The reels stand side by side on a wide screen. On a phone they form a row to swipe through,
	each wide enough to watch. None plays or loads by itself: the visitor presses play.
-->
<ul
	aria-label={copy.title}
	class={cn(
		'flex snap-x gap-3 overflow-x-auto md:grid md:grid-cols-3 md:gap-6 md:overflow-visible',
		className
	)}
>
	{#each REELS as reel, index (reel.video)}
		<li class="w-3/5 shrink-0 reveal snap-start md:w-auto">
			<video
				controls
				playsinline
				preload="none"
				poster={reel.poster}
				aria-label={copy.labels[index]}
				class="aspect-film w-full bg-plate object-cover"
			>
				<source src={reel.video} type="video/mp4" />
				<track
					kind="captions"
					src={reel.captions[lang]}
					srclang={lang}
					label={copy.captions}
					default
				/>
			</video>
		</li>
	{/each}
</ul>
