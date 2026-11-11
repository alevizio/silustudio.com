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

	const BUTTON = 'min-h-12 justify-center border border-ink px-6 text-center';
	const VARIANTS = {
		solid: cn(BUTTON, 'bg-ink text-wall hover:border-ink-soft hover:bg-ink-soft'),
		line: cn(BUTTON, 'text-ink hover:bg-ink hover:text-wall'),
		text: 'min-h-11 text-ink underline decoration-line underline-offset-8 hover:decoration-ink'
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
