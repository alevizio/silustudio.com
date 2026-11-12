<script lang="ts">
	import FilmToggle from '#lib/components/film-toggle.svelte';
	import type { Lang } from '#lib/i18n/index.ts';
	import { watchInView } from '#lib/motion/in-view.ts';
	import { asksForLessMotion } from '#lib/motion/preference.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** Address of the film: a vertical MP4 with no sound. */
		video: string;
		/** Address of the still that stands in until the film runs. */
		poster: string;
		/** What the film shows, in words. */
		label: string;
		class?: string;
	}

	let { lang, video, poster, label, class: className }: Props = $props();

	/** Set when the visitor pauses the film, or asks their device for less motion. */
	let stopped = false;
	let running = $state(false);
	let screen: HTMLVideoElement | undefined = $state();

	// The film runs only while it is on screen, so nothing downloads or moves out of sight.
	const runInView = (film: HTMLVideoElement) => {
		stopped = asksForLessMotion();
		return watchInView(film, (inView) => {
			if (inView && !stopped) void film.play().catch(() => {});
			else film.pause();
		});
	};

	const toggle = (): void => {
		stopped = running;
		if (running) screen?.pause();
		else void screen?.play().catch(() => {});
	};
</script>

<!--
	A film hung like a photo that moves: it runs by itself, silent and in a loop, while it is on
	screen. The button stops and starts it, and a visitor who asks for less motion gets the
	still until they press it.
-->
<div class={cn('relative', className)}>
	<video
		bind:this={screen}
		{@attach runInView}
		muted
		loop
		playsinline
		preload="none"
		{poster}
		aria-label={label}
		onplay={() => (running = true)}
		onpause={() => (running = false)}
		class="aspect-film w-full bg-plate object-cover"
	>
		<source src={video} type="video/mp4" />
	</video>
	<FilmToggle {lang} {running} onclick={toggle} />
</div>
