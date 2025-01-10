<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	const { drawForm, title, isCreateMode, submitDelete, submitUpdate, onCancel } = $props();

	let showDeletionModal = $state(false);

	onMount(() => {
		document.getElementById('updateProductButton').click();
	});
</script>

<div class="blur" transition:fade={{ duration: 50 }}></div>

<!-- drawer init and show -->
<button
	hidden
	id="updateProductButton"
	type="button"
	data-drawer-target="drawer-update-product-default"
	data-drawer-show="drawer-update-product-default"
	aria-controls="drawer-update-product-default"
>
	open drawer
</button>

<!-- drawer component -->
<div
	transition:fly={{ duration: 150, x: '100vw' }}
	id="drawer-update-product-default"
	class="fixed right-0 top-0 z-40 h-screen w-full max-w-2xl -translate-x-full transform-none overflow-y-auto p-4 pb-0 transition-transform bg-gray-800 flex flex-col"
	tabindex="-1"
	aria-labelledby="drawer-label"
	
>
	<h5
		id="drawer-label"
		class="mb-6 inline-flex items-center text-sm font-semibold uppercase  text-gray-400"
	>
		{title}
	</h5>
	<button
		onclick={onCancel}
		type="button"
		data-drawer-dismiss="drawer-update-product-default"
		aria-controls="drawer-update-product-default"
		class="absolute right-2.5 top-2.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400   hover:bg-gray-600 hover:text-white"
	>
		<svg
			aria-hidden="true"
			class="h-5 w-5"
			fill="currentColor"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
				clip-rule="evenodd"
			></path></svg
		>
		<span class="sr-only">Close menu</span>
	</button>
	{@render drawForm()}

	
	<div
		class="bottom-0 left-0  flex w-full justify-center space-x-4 p-4  sm:mt-4 sm:px-4 sticky bg-gray-800 z-50"
	>
		{#if isCreateMode}
			<button
				onclick={submitUpdate}
				class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 bg-primary-600 hover:bg-primary-700 focus:ring-primary-800 w-full justify-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
			>
				Create
			</button>
		{:else}
			<button
				onclick={submitUpdate}
				class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 bg-primary-600 hover:bg-primary-700 focus:ring-primary-800 w-full justify-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4"
			>
				Update
			</button>
			<button
			onclick={()=>showDeletionModal = true}
				class="inline-flex w-full items-center justify-center rounded-lg border  px-5 py-2.5 text-center text-sm font-medium   focus:outline-none focus:ring-4  border-red-500 text-red-500 hover:bg-red-600 hover:text-white focus:ring-red-900"
			>
				<svg
					aria-hidden="true"
					class="-ml-1 mr-1 h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
						clip-rule="evenodd"
					></path></svg
				>
				Delete
			</button>
		{/if}
	</div>
</div>

<!-- Delete modal starts -->
	<div class:hidden={!showDeletionModal} class="overflow-y-auto overflow-x-hidden fixed flex top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
		<div class="relative p-4 w-full max-w-md max-h-full ">
			<div class="relative  rounded-lg shadow bg-gray-700">
				<button onclick={()=>showDeletionModal = false} type="button" class="absolute top-3 end-2.5 text-gray-400 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white" data-modal-hide="popup-modal">
					<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
					</svg>
					<span class="sr-only">Cancel</span>
				</button>
				<div class="p-4 md:p-5 text-center">
					<svg class="mx-auto mb-4 text-red-700 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
						<path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
					  </svg>
					  
					
					<h3 class="mb-5 text-lg font-normal  text-gray-400">Confirm deletion</h3>
					<button onclick={()=>{showDeletionModal = false; submitDelete()}} data-modal-hide="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none  focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
						Delete
					</button>
					<button onclick={()=>showDeletionModal = false}  type="button" class="py-2.5 px-5 ms-3 text-sm font-medium  focus:outline-none  rounded-lg border   focus:z-10 focus:ring-4  focus:ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700">Cancel</button>
				</div>
			</div>
		</div>
	</div>
	
<!-- Delete modal ends -->

<style>
	.blur {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;		
		filter: blur(5);
		inset: 0;		
		backdrop-filter: blur(4px);	
	}
</style>
