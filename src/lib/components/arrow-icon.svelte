<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** Which way the arrow points. */
		direction?: 'left' | 'right';
		class?: string;
	}

	let { direction = 'right', class: className }: Props = $props();
</script>

<!-- A thin arrow in the colour of the text around it. It says nothing to screen readers. -->
<svg
	viewBox="0 0 20 12"
	fill="none"
	stroke="currentColor"
	stroke-width="1.25"
	aria-hidden="true"
	class={cn('h-3 w-5 shrink-0', direction === 'left' && '-scale-x-100', className)}
>
	<path d="M0 6h19M14 1l5 5-5 5" />
</svg>
