<script lang="ts" module>
	/** Where a screen counts as wide: the same width as Tailwind's `md`. */
	export const WIDE_SCREEN = '(min-width: 48rem)';
</script>

<script lang="ts">
	import type { Picture } from 'vite-imagetools';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** The upright photo, for a phone. */
		tall: Picture;
		/** The horizontal photo, for a wide screen. */
		wide: Picture;
		/** One description that is true of both photos. */
		alt: string;
		/** How wide the photo shows, as an image's `sizes`. Edge to edge unless told otherwise. */
		sizes?: string;
		class?: string;
	}

	let { tall, wide, alt, sizes = '100vw', class: className }: Props = $props();
</script>

<!--
	The photo a page opens on, in two shapes: upright for a phone and horizontal for a wide
	screen, so each screen gets a photo framed for it. The browser picks one and loads only
	that one, at once and ahead of everything else. The photo fills its place and is cut to
	it, so the place decides how much of the photo shows.
-->
<picture>
	{#each Object.entries(wide.sources) as [format, srcset] (format)}
		<source
			media={WIDE_SCREEN}
			{srcset}
			{sizes}
			type={`image/${format}`}
			width={wide.img.w}
			height={wide.img.h}
		/>
	{/each}
	{#each Object.entries(tall.sources) as [format, srcset] (format)}
		<source {srcset} {sizes} type={`image/${format}`} />
	{/each}
	<img
		src={tall.img.src}
		{alt}
		width={tall.img.w}
		height={tall.img.h}
		fetchpriority="high"
		class={cn('size-full object-cover', className)}
	/>
</picture>
