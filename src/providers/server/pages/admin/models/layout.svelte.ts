import { ModelManager, Schema } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";


export function get_admin_models_layout_svelte(schema: Schema, serverProvider: ServerProvider, model: ModelManager) {
    return `
    <script lang="ts">        	
        import { page } from '$app/stores';
        import type { Snippet } from 'svelte';
        import Table from '$lib/components/Table.svelte';
        import { type ${model.Name} } from '$lib/models/${model.Name}';

        type Props = {
            data:{
                ${model.names}:${model.Name}[];
                total:number      
            },
            children: Snippet;
        }

        
        let { children, data }:Props = $props();    
               
    </script>
                      
    {#snippet row(${model.name}:${model.Name})}                                            
        <th class="px-4 py-3">                     
            {${model.name}.id}
        </th>
        ${getTableRows(model)}                     
    {/snippet}

    <Table {row} keys={['id', ${model.propsAsKeys.map(key => `'${model.props[key].displayName}'`).join(',')}]} items={data.${model.names}} total={data.total} path="/${schema.$adminRoute}/${model.names}"> </Table>
     
    {#if $page.url.searchParams.get('mode') == 'linking'}
        <button>Done</button>
    {/if}

    {@render children()}


    <style>
        img{
            max-width: 60px;
            max-height: 60px;
        }
    </style>
    `
}

function getTableRows(model: ModelManager) {

    return `${model.propsAsKeys.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            if (prop.isArray) {
                return `<td class="px-4 py-3">{${model.name}.${prop.codeName}?.map(item=>item.id)}</td>`
                // if (prop.refersToModel.previewPattern) {

                // } else {

                // }
            } else {
                return `<td class="px-4 py-3">{${model.name}.${prop.codeName}?.id}</td>`
                // if (prop.refersToModel.previewPattern) {

                // } else {

                // }
            }
        }

        if (prop.propType === 'enum') {
            return `
                {@const _${prop.codeName} = [${prop.constrains.options.map(option => `'${option}'`)}]}
                <td class="px-4 py-3"> {_${prop.codeName}[${model.name}.${prop.codeName} - 1]}({${model.name}.${prop.codeName}})</td>
                `
        }
        if (prop.propType === 'boolean') {
            return `<td class="px-4 py-3">{${model.name}.${prop.codeName} || false}</td>`
        }
        if (prop.propType === 'image') {
            if (prop.isArray) {
                return `<td class="px-4 py-3">
                {#if  ${model.name}.${prop.codeName}}
                    {#each ${model.name}.${prop.codeName} as item}
                        <img src={item} alt="">
                    {/each}
                {/if}
                </td>`
            } else {
                return `<td class="px-4 py-3"><img src={${model.name}.${prop.codeName}} alt=""></td>`
            }
        }

        else {
            return `<td class="px-4 py-3">{${model.name}.${prop.codeName}}</td>`
        }
    }).join('\n')}`

}
