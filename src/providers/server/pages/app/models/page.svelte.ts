import { ModelManager, Schema } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";


export function get_app_models_page_svelte(schema: Schema, serverProvider: ServerProvider, model: ModelManager) {
    return `
    <script lang="ts">        	       
        import { type ${model.Name} } from '$lib/models/${model.Name}';

        type Props = {
            data:{
                ${model.names}:${model.Name}[];      
            },         
        }
        
        let { data }:Props = $props();    
              
    </script>                                                              
                           
 
    <table>
        <thead>
            <tr>
                <th>#id</th>
                ${model.propsAsKeys.map(key =>  `<th>${key}</th>`).join('\n')}
            </tr>
        </thead>
        <tbody>
            {#each data.${model.names} as ${model.name} }           
                <tr>
                    <th>                     
                        {${model.name}.id}
                    </th>
                    ${getTableRows(model)}  
                </tr>                              
            {/each}
        </tbody>
    </table>

    <style>
        table{
            border-collapse: collapse;
        }

        th,td{
            padding:3px;
            border:solid 1px black;           
        }
    </style>

    `
}

function getTableRows(model: ModelManager) {

    return `${model.propsAsKeys.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            if (prop.isArray) {
                return `<td>{${model.name}.${prop.codeName}?.map(item=>item.id)}</td>`
                // if (prop.refersToModel.previewPattern) {

                // } else {

                // }
            } else {
                return `<td>{${model.name}.${prop.codeName}?.id}</td>`
                // if (prop.refersToModel.previewPattern) {

                // } else {

                // }
            }
        }

        if (prop.propType === 'enum') {
            return `
                {@const _${prop.codeName} = [${prop.constrains.options.map(option => `'${option}'`)}]}
                <td > {_${prop.codeName}[${model.name}.${prop.codeName} - 1]}({${model.name}.${prop.codeName}})</td>
                `
        }
        if (prop.propType === 'boolean') {
            return `<td >{${model.name}.${prop.codeName} || false}</td>`
        }
        if (prop.propType === 'image') {
            return `<td ><img src={${model.name}.${prop.codeName}} alt=""></td>`
        }
        else {
            return `<td >{${model.name}.${prop.codeName}}</td>`
        }
    }).join('\n')}`

}
