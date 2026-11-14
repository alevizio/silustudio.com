<script lang="ts" module>
	/** The photos fill the column beside a work's label, or the whole screen on a phone. */
	export const WORK_PHOTO_SIZES =
		'(min-width: 1536px) 74rem, (min-width: 1024px) calc(100vw - 26rem), 100vw';
</script>

<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { followSwipe } from '#lib/motion/swipe-row.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		photos: readonly Picture[];
		/** Alt text for the photo at this place in `photos`, counting from 0. */
		alt: (index: number) => string;
		/** Names the photos as a group, for a visitor who hears the page. */
		label: string;
		class?: string;
	}

	let { photos, alt, label, class: className }: Props = $props();

	/** The photo the visitor is looking at, counting from 0, where the photos are swiped through. */
	let inView = $state(0);
	let swipes = $state(false);

	const follow = (row: HTMLElement) =>
		followSwipe(row, (photo, swiping) => {
			inView = photo;
			swipes = swiping;
		});
</script>

<!--
	A work's photos. On a phone they are one row to swipe through sideways, as on Instagram:
	the edge of the next photo shows, the dots under the row say how many there are, and the
	row is as tall as the photo in view, so the label stays right under it. Until a visitor
	swipes, only the first photo gives the row its height.

	On a wide screen they are one to a row, down the column beside the label.

	Either way each photo is as large as its place or as tall as the screen allows, so a whole
	work is always in view at once. Where the height of the screen is what holds a photo back,
	as on a phone held sideways, the photo keeps to the left of its place in the row, on the
	line the page starts on. A photo takes its width from its own pixel size and is only
	ever scaled down, so a small catalog photo is never stretched. The first photo opens the
	page: it loads at once, and it is the one that travels when the page changes, flying in
	from its place on the wall or stepping aside for the next work.
-->
<div class={cn('min-w-0', className)}>
	<!-- A row that scrolls must take the keyboard, or its photos could only be reached by touch. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		{@attach follow}
		role="group"
		aria-label={label}
		tabindex={swipes ? 0 : undefined}
		class="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter scrollbar-none items-start gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-gutter transition-[height] duration-(--motion-fit) ease-settle motion-reduce:transition-none lg:mx-0 lg:flex-col lg:items-center lg:gap-6 lg:overflow-visible lg:px-0"
	>
		{#each photos as photo, index (index)}
			<enhanced:img
				src={photo}
				alt={alt(index)}
				sizes={WORK_PHOTO_SIZES}
				loading={index === 0 ? 'eager' : 'lazy'}
				fetchpriority={index === 0 ? 'high' : 'auto'}
				class={[
					'max-h-photo shrink-0 reveal snap-start object-contain object-left lg:max-w-full lg:object-center',
					photos.length > 1 ? 'max-w-swipe' : 'max-w-full',
					index === 0 ? 'travelling-photo' : '-mb-photo lg:mb-0 noscript:mb-0'
				]}
			/>
		{/each}
	</div>
	{#if photos.length > 1}
		<div aria-hidden="true" class="flex justify-center gap-2 pt-4 lg:hidden">
			{#each photos, index}
				<span
					class={[
						'size-1.5 rounded-full transition-colors duration-(--motion-fit)',
						index === inView ? 'bg-ink' : 'bg-ink/20'
					]}
				></span>
			{/each}
		</div>
	{/if}
</div>
