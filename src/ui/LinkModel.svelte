<script lang="ts">
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';

	//TODO generic
	type Selected = {
		id: string|number;
		[key: string]: any;
	};
	type Props = {
		path: string;
		selected: Selected[] | Selected | null;
		title?: string;
		max?: number;	
		format?:(item:any)=>string;
	};
	let { path, selected=$bindable(), title, max = 1,
		format = (item:Selected)=>String(item.id)}: Props = $props();

	let openLinkingWindow = $state(false);
	const isMany = $derived(max > 1);
	const selectedAsArray = $derived.by(() => {
		if (selected) {
			if (isMany) {
				return selected as Selected[];
			} else {
				return [selected as Selected];
			}
		}
		return [];
	});
	const canAddMore = $derived(selectedAsArray.length < max);

	async function removeSelected(item: Selected) {
		if (isMany) {
			selected = (selected as Selected[]).filter((x) => x.id != item.id);
		} else {
			selected = null;
		}
	}

	async function onLinked(event: MessageEvent) {
		if (event.origin !== $page.url.origin) {
			return;
		}

		window.removeEventListener('message', onLinked);
		openLinkingWindow = false;

		console.log('#LINKED', event.data);
		try {
			const parseSelected = JSON.parse(event.data.selected);
			if (isMany) {
				if (parseSelected?.length) {
					selected = parseSelected;
				} else {
					selected = [];
				}
			} else {
				if (parseSelected?.length) {
					selected = parseSelected[0];
				} else {
					selected = null;
				}
			}
		} catch (e) {}
	}

	async function openLinkWindow() {
		window.addEventListener('message', onLinked);
		openLinkingWindow = true;
	}
</script>

<div
	class="space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
>
	{#each selectedAsArray as item (item.id)}
		<div
			class=" flex items-center rounded-lg bg-blue-50 p-4 text-white dark:bg-gray-600"
			transition:slide={{ axis: 'y', duration: 100 }}
		>
			<div class="ms-3 text-sm font-medium">
				<span>{format(item)}</span>
			</div>
			<button
				onclick={() => removeSelected(item)}
				type="button"
				class="dark:bg-gray-00 -mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 dark:hover:bg-gray-700"
				data-dismiss-target="#alert-1"
				aria-label="Close"
			>
				<span class="sr-only">Unlink</span>
				<svg
					class="h-3 w-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 14 14"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
					/>
				</svg>
			</button>
		</div>
	{/each}

	{#if canAddMore}	
		<button
			type="button"
			onclick={() => openLinkWindow()}
			class="me-2 inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
		>
			<svg
				class="me-2 h-5 w-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 12h14m-7 7V5"
				/>
			</svg>

			{isMany? "Add": "Select"}			
		</button>
	{/if}
</div>

{#if openLinkingWindow}
	<div class="linking-window">
		<iframe
			src={`${path}?mode=linking&max=${max}&selected=${selected != null ? (isMany ? selected.map((x) => x.id).join() : selected.id) : ''}`}
			{title}
			transition:fly={{ duration: 150, x: '-100vw' }}
			class="fixed left-0 top-0 z-40 h-screen w-full -translate-x-full transform-none overflow-y-auto bg-white transition-transform md:max-w-4xl xl:max-w-7xl dark:bg-gray-800"
		>
		</iframe>
	</div>
{/if}

<style>
	.linking-window {
		display: flex;
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
		filter: blur(5);
		inset: 0;
		backdrop-filter: blur(4px);
	}
</style>
