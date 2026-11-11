<script lang="ts">
	import { SITE } from '#lib/content/site.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		class?: string;
	}

	let { lang, class: className }: Props = $props();

	const YEAR = new Date().getFullYear();
	const copy = $derived(copyFor(lang).footer);
	const linkClass =
		'hover:text-ink inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:underline';
</script>

<footer
	class={cn(
		'mx-auto flex w-full max-w-page flex-col gap-2 px-gutter py-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between',
		className
	)}
>
	<p>© {YEAR} {copy.rights}</p>
	<ul class="flex flex-wrap gap-x-6">
		<li>
			<a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" class={linkClass}>
				Instagram
			</a>
		</li>
		<li><a href={`mailto:${SITE.email}`} class={linkClass}>{SITE.email}</a></li>
	</ul>
</footer>
