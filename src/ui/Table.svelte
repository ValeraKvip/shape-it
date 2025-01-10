<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  let { row, keys, items, path, total } = $props();

  const isLinkingMode = $page.url.searchParams.get('mode') == 'linking'; 
  const maxSelect = $derived(Number($page.url.searchParams.get('max') || 1));
 
  let linkSelected = $state([]);
  let search = $state('');
  const start = $derived(Number($page.url.searchParams.get('start') || 0));
  const count = $derived(Number($page.url.searchParams.get('count') || 20));
  const currentPage = $derived(Math.floor(start / count) + 1);
  const totalPages = $derived(Math.ceil(total / count));

  function doSearch() {
    let query = new URLSearchParams($page.url.searchParams.toString());
    if (!search) {
      query.delete('search');
    } else {
      query.set('search', search);
    }

    goto(`?${query.toString()}`).then(() => {
      invalidateAll();
    });
  }
  // const selectedIds = $derived.by(()=>{
  // 	if(isLinkingMode ){
  // 		const selected =  $page.url.searchParams.get('selected');

  // 		if(selected?.length){
  // 			const split = 	selected.split(',');
  // 			linkSelected = items.filter(x=>split?.indexOf(x.id) >= 0);
  // 			return split;
  // 		}
  // 	}

  // 	return null;
  // });

  let selectedIds: (string | number)[] = $state([]);
  //	$effect(()=>{
  if (isLinkingMode) {
    const selected = $page.url.searchParams.get('selected');

    if (selected?.length) {
      selectedIds = selected.split(',');
      linkSelected = items.filter(
        (x) => selectedIds?.indexOf(String(x.id)) >= 0,
      );
    }
  }
  //})

  function handleLinkCheckboxChange(event: Event, item: any) {    
    const target = event.target as HTMLInputElement; 

    if (target.checked) {
      if (maxSelect > linkSelected.length) {      
        linkSelected = [...linkSelected, item];
      } else if (maxSelect === 1) {      
        linkSelected = [item];
      }
    } else {
      
      linkSelected = linkSelected.filter((i) => i.id !== item.id);
    }

    selectedIds = linkSelected.map(x=>String(x.id));    
    $state.snapshot(selectedIds);
   
   
  }

  function generatePagination() {
    const pagination = [];

    if (totalPages <= 2) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      pagination.push(1);

      if (currentPage > 3) {
        pagination.push('...');
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pagination.push(i);
      }

      if (currentPage < totalPages - 2) {
        pagination.push('...');
      }

      pagination.push(totalPages);
    }

    return pagination;
  }

  function paginationNavigate(to: number) {
    const start = (to - 1) * count;

    let query = new URLSearchParams($page.url.searchParams.toString());
    query.set('start', String(start));
    console.log('#OG', to, start, count, `?${query.toString()}`);
    goto(`?${query.toString()}`).then(() => {
      invalidateAll();
    });
  }

  const pagination = generatePagination();
</script>

<!-- Start block -->
<section class="bg-gray-50 p-3 antialiased sm:p-5 dark:bg-gray-900">
  <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
    <!-- Start coding here -->
    <div
      class="relative overflow-hidden bg-white shadow-md sm:rounded-lg dark:bg-gray-800"
    >
      <div
        class="flex flex-col items-center justify-between space-y-3 p-4 md:flex-row md:space-x-4 md:space-y-0"
      >
        <div class="w-full md:w-1/2">
          <label for="simple-search" class="sr-only">Search</label>
          <div class="relative w-full">
            <button
              class="search-btn absolute inset-y-0 right-3 flex items-center pl-3"
              onclick={() => doSearch()}
            >
              <svg
                aria-hidden="true"
                class="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewbox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              x
            </button>
            <input
              type="text"
              id="simple-search"
              class="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 !pr-14"
              placeholder="Search"
              bind:value={search}
            />
          </div>
        </div>
        <div
          class="flex w-full flex-shrink-0 flex-col items-stretch justify-end space-y-2 md:w-auto md:flex-row md:items-center md:space-x-3 md:space-y-0"
        >
          <button
            onclick={() => {
              goto($page.url.pathname + '/create');
            }}
            type="button"
            id="createProductModalButton"
            data-modal-target="createProductModal"
            data-modal-toggle="createProductModal"
            class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4"
          >
            <svg
              class="mr-2 h-3.5 w-3.5"
              fill="currentColor"
              viewbox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              ></path>
            </svg>
            Add
          </button>
          <div class="flex w-full items-center space-x-3 md:w-auto">
            <div
              id="actionsDropdown"
              class="z-10 hidden w-44 divide-y divide-gray-100 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700"
            >
              <ul
                class="py-1 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="actionsDropdownButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Mass Edit</a
                  >
                </li>
              </ul>
              <div class="py-1">
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  >Delete all</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table
          class="w-full text-left text-sm text-gray-500 dark:text-gray-400"
        >
          <thead
            class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="px-4 py-4"></th>
              {#each keys as key (key)}
                <th scope="col" class="px-4 py-4">{key}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each items as item (item.id)}
              <tr class="border-b dark:border-gray-700">
                <td class="my-1 px-4 py-3">
                  <div class=" dark:bg-gray-800">
                    
                    {#if isLinkingMode}                   
                        <input
                          type="checkbox"
                          checked={(selectedIds?.length > 0 && selectedIds.indexOf(String(item.id)) >= 0)}
                          onchange={(event) =>
                            handleLinkCheckboxChange(event, item)}
                        />                                          
                    {:else}
                      <a href="{path}/{item.id}" aria-label="c">
                        <svg
                          class="h-6 w-6 text-gray-800 dark:text-white"
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
                            d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                          ></path>
                        </svg>
                      </a>
                    {/if}
                  </div>
                </td>
                {@render row(item)}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <nav
        class="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0"
        aria-label="Table navigation"
      >
        {#if total > 0}
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
            Showing
            <span class="font-semibold text-gray-900 dark:text-white"
              >{start + 1}-{start + count < total ? start + count : total}</span
            >
            of
            <span class="font-semibold text-gray-900 dark:text-white"
              >{start + count < total ? start + count : total}</span
            >
          </span>
        {/if}
        {#if total > count}
          <ul class="inline-flex items-stretch -space-x-px">
            <li>
              <button
                onclick={() => paginationNavigate(currentPage - 1)}
                disabled={currentPage == 1}
                class="ml-0 flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span class="sr-only">Previous{currentPage - 1}</span>
                <svg
                  class="h-5 w-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewbox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </li>
            {#each pagination as pg}
              {#if pg === '...'}
                <li>
                  <button
                    class="flex items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >...</button
                  >
                </li>
              {:else}
                <li>
                  <button
                    onclick={() => paginationNavigate(pg)}
                    class="flex items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >{pg}</button
                  >
                </li>
              {/if}
            {/each}

            <li>
              <button
                onclick={() => paginationNavigate(currentPage + 1)}
                disabled={currentPage == totalPages}
                class="flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span class="sr-only">Next {currentPage + 1}</span>
                <svg
                  class="h-5 w-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewbox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </li>
          </ul>
        {/if}

        {#if isLinkingMode}
          <button
            class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4"
            onclick={() => {
              window.parent.postMessage(
                { selected: JSON.stringify(linkSelected) },
                $page.url.origin,
              );
            }}
          >
            Link Selected
          </button>
        {/if}
      </nav>
    </div>
  </div>
</section>

<!-- End block -->

<style>
  td {
    padding: 4px 3px;
  }

  .search-btn {
    color: transparent;
  }
</style>
