<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** The still shown until the visitor asks for the film. */
		poster: Picture;
		posterAlt: string;
		/** Address of the film's player. */
		src?: string;
		class?: string;
	}

	let { lang, poster, posterAlt, src = SITE.filmUrl, class: className }: Props = $props();

	/** Starts at once, without Vimeo's title, author and avatar, and without its tracking. */
	const PLAYER_OPTIONS = 'autoplay=1&title=0&byline=0&portrait=0&dnt=1';

	let playing = $state(false);

	const copy = $derived(copyFor(lang).studio.film);
</script>

<!-- The artists' film is on Vimeo. Nothing loads from Vimeo until the visitor presses play. -->
<div class={cn('relative aspect-video bg-plate', className)}>
	{#if playing}
		<!-- The button that had the focus is gone, so the focus moves on to the player. -->
		<iframe
			{@attach (player) => player.focus()}
			src={`${src}?${PLAYER_OPTIONS}`}
			title={copy.title}
			allow="autoplay; fullscreen; picture-in-picture"
			allowfullscreen
			class="absolute inset-0 size-full"
		></iframe>
	{:else}
		<enhanced:img
			src={poster}
			alt={posterAlt}
			sizes="(min-width: 1280px) 1216px, 100vw"
			fetchpriority="high"
			class="absolute inset-0 size-full object-cover"
		/>
		<button
			type="button"
			onclick={() => (playing = true)}
			class="group absolute inset-0 flex cursor-pointer items-center justify-center"
		>
			<span
				class="relative isolate inline-flex min-h-12 items-center overflow-hidden border border-ink bg-ink px-6 text-label text-wall uppercase transition-colors duration-(--motion-fill) group-hover:border-sand-deep group-focus-visible:border-sand-deep before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-sand-deep before:transition-transform before:duration-(--motion-fill) before:ease-settle group-hover:before:scale-y-100 group-focus-visible:before:scale-y-100 motion-reduce:before:transition-none"
			>
				{copy.play}
			</span>
		</button>
	{/if}
</div>
