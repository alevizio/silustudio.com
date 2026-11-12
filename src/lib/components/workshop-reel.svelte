<script lang="ts">
	import { asset } from '$app/paths';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { asksForLessMotion } from '#lib/motion/preference.ts';
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
	/** How much of a film has to be on screen for it to run. */
	const IN_VIEW = 0.4;

	/** Set when the visitor pauses the film, or asks their device for less motion. */
	let stopped = false;
	let running = $state(false);
	let screen: HTMLVideoElement | undefined = $state();

	const copy = $derived(copyFor(lang).studio.reels);
	const source = $derived(FILMS[film - 1]);

	// The film runs only while it is on screen, so nothing downloads or moves out of sight.
	const runInView = (video: HTMLVideoElement) => {
		stopped = asksForLessMotion();
		const watcher = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !stopped) void video.play().catch(() => {});
				else video.pause();
			},
			{ threshold: IN_VIEW }
		);
		watcher.observe(video);
		return () => watcher.disconnect();
	};

	const toggle = (): void => {
		stopped = running;
		if (running) screen?.pause();
		else void screen?.play().catch(() => {});
	};
</script>

<!--
	One film of the workshop, hung like a photo that moves: it runs by itself, silent and in a
	loop, while it is on screen. The button stops and starts it, and a visitor who asks for
	less motion gets the still until they press it.
-->
<div class={cn('relative reveal', className)}>
	<video
		bind:this={screen}
		{@attach runInView}
		muted
		loop
		playsinline
		preload="none"
		poster={source.poster}
		aria-label={copy.labels[film - 1]}
		onplay={() => (running = true)}
		onpause={() => (running = false)}
		class="aspect-film w-full bg-plate object-cover"
	>
		<source src={source.video} type="video/mp4" />
	</video>
	<button
		type="button"
		onclick={toggle}
		class="absolute right-2 bottom-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-wall/80 text-ink transition-colors hover:bg-wall"
	>
		<svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 fill-current">
			{#if running}
				<path d="M4 3h3v10H4zM9 3h3v10H9z" />
			{:else}
				<path d="M5 3l8 5-8 5z" />
			{/if}
		</svg>
		<span class="sr-only">{running ? copy.pause : copy.play}</span>
	</button>
</div>
