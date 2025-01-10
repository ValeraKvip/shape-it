<script lang="ts">
	type Prop = {
		name: string;
		files: string[];
		accept?: string;
		multiple?: boolean;
	};

	let { name, files, accept, multiple }: Prop = $props();
	let inputRef: HTMLInputElement;
	//  files = [
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg',
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg',
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg',
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg',
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg',
	// 	'https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg'
	// ];

	let expandFile = $state('');

	let filesDisplay = $derived(files.filter(x=>x?.length));

	async function unloadFile(file: string) {
		console.log('#unloadFile', inputRef.files);
		files = files.filter((f) => f !== file);
	}

	async function onChange() {
		console.log('#onChange', inputRef.files);
		if (!inputRef.files) {
			return;
		}

		files = [];

		for (const file of inputRef.files) {
			files.push(URL.createObjectURL(file));
		}
	}
</script>

<div
	class="relative flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:hover:bg-gray-800"
>
	{#if filesDisplay.length}
		<div class="grid grid-cols-2 gap-4 p-1 md:grid-cols-3">
			{#each filesDisplay as file}
				<!--svelte-ignore a11y_click_events_have_key_events  a11y-no-static-element-interactions-->
				<div class="relative z-10" onclick={() => (expandFile = file)} role="button" tabindex="0">
					<button
						onclick={() => unloadFile(file)}
						type="button"
						data-drawer-dismiss="drawer-update-product-default"
						aria-controls="drawer-update-product-default"
						class="absolute right-2 top-2 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
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
					<img class="h-auto max-w-full rounded-lg" src={file} alt="" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="pointer-events-none flex flex-col items-center justify-center pb-6 pt-5">
			<svg
				class="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 20 16"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
				/>
			</svg>
			<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
				<span class="font-semibold">Click to upload</span> or drag and drop
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
		</div>
	{/if}
	<input
		onchange={() => onChange()}
		id={name}
		{name}
		bind:this={inputRef}		
		type="file"
		class=" absolute top-0 h-full opacity-0"		
		accept = {accept}
		multiple = {multiple}
	/>
</div>

<!-- Expand modal -->
<div
	class:hidden={!expandFile || true}
	onclick={(e) => {
		expandFile = '';
	}}
	id="default-modal"
	tabindex="-1"
	aria-hidden="true"
	class="fixed left-0 right-0 top-0 z-50 flex h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-[#000000de] md:inset-0"
>
	<div class="relative max-h-full p-4">
		<!-- Modal content -->
		<div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
			<!-- Modal header -->
			<div
				class="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600"
			>
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white"></h3>
				<button
					type="button"
					class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
					data-modal-hide="default-modal"
				>
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
					<span class="sr-only">Close modal</span>
				</button>
			</div>
			<!-- Modal body -->
			<div class="space-y-4 p-4 md:p-5">
				<img src={expandFile} alt="expanded pic" />
			</div>
			<!-- Modal footer -->
			<div
				class="flex items-center rounded-b border-t border-gray-200 p-4 md:p-5 dark:border-gray-600"
			>
				<!-- <button
					data-modal-hide="default-modal"
					type="button"
					class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					>I accept</button
				>
				<button
					data-modal-hide="default-modal"
					type="button"
					class="ms-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
					>Decline</button
				> -->
			</div>
		</div>
	</div>
</div>
