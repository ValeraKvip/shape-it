<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import { fly, slide } from 'svelte/transition';

	type Props = {
		max: number;
		values: any[];
        input:Snippet<[any]>;
	};
	let { values = $bindable() , max , input}: Props = $props();
  
    $inspect(values);
	const canAddMore = $derived(values?.length < max);

    async function add() {
		values = [...values, ''];
	}

	async function remove(index:number) {       
		 values.splice(index,1)        
	}
</script>

<div
	class="space-y-2 rounded-lg border  p-4 border-gray-600 bg-gray-800"
>
	{#each values as item, index}
		<div
			class=" flex  rounded-lg  p-2 text-white bg-gray-600"
			transition:slide={{ axis: 'y', duration: 100 }}
		>
			<div class="w-full text-sm font-medium">
				<span>{index}</span>
                 {@render input(index)}
			</div>
			<button
				onclick={() => remove(index)}
				type="button"
				class="bg-gray-00 -mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-white  focus:ring-2 focus:ring-blue-400 hover:bg-gray-700"
				data-dismiss-target="#alert-1"
				aria-label="Close"
			>
				<span class="sr-only">Remove</span>
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
			onclick={() => add()}
			class="me-2 inline-flex items-center rounded-lg  px-5 py-2.5 text-center text-sm font-medium text-white  focus:outline-none focus:ring-4  bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
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

			Add
		</button>
	{/if}
</div>

<style>

</style>