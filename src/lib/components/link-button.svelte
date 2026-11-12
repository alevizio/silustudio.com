<script lang="ts" module>
	/**
	 * The look of a text link, for the rare control that is not a link. The rule under it is
	 * always there, faint, and a darker one is drawn over it from the left.
	 */
	export const TEXT_LINK =
		'relative min-h-11 text-ink before:absolute before:inset-x-0 before:bottom-2 before:h-px before:bg-line after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-(--motion-fill) after:ease-settle hover:after:scale-x-100 focus-visible:after:scale-x-100';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		/** For a page of this site, pass the result of `pageHref()`. */
		href: string;
		/** `solid` and `line` are buttons. `text` is an underlined label for secondary links. */
		variant?: 'solid' | 'line' | 'text';
		/** Opens in a new tab. Use for maps, WhatsApp and other sites. */
		external?: boolean;
		class?: string;
		children: Snippet;
	}

	let { href, variant = 'solid', external = false, class: className, children }: Props = $props();

	/*
	 * A button fills with colour from the bottom under the pointer or the keyboard, the way
	 * sand settles, and sinks a hair when pressed. The fill is a layer behind the label.
	 */
	const BUTTON =
		'relative isolate min-h-12 justify-center overflow-hidden border border-ink px-6 text-center duration-(--motion-fill) before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-(--motion-fill) before:ease-settle hover:before:scale-y-100 focus-visible:before:scale-y-100 active:translate-y-px motion-reduce:before:transition-none';
	const VARIANTS = {
		solid: cn(BUTTON, 'bg-ink text-wall before:bg-sand-deep hover:border-sand-deep'),
		line: cn(BUTTON, 'text-ink before:bg-ink hover:text-wall focus-visible:text-wall'),
		text: TEXT_LINK
	};
</script>

<a
	{href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
	class={cn(
		'inline-flex items-center text-label uppercase transition-colors',
		VARIANTS[variant],
		className
	)}
>
	{@render children()}
</a>
