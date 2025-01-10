import { ModelManager, PropManager, Schema } from "../../../../../../Schema";
import ServerProvider from "../../../../ServerProvider";



export function get_app_models_model_page_svelte(schema: Schema, serverProvider: ServerProvider, model: ModelManager) {
    return `
    <script lang="ts">                 
        import type { ${model.Name} } from '$lib/models/${model.Name}';                   
        
        type Props = {
            data: {        
                ${model.name} : ${model.Name};
            };        
        };

        const { data } : Props = $props();    
        let ${model.name} : ${model.Name} = $state(data.${model.name});
              
        $inspect(${model.name})
    </script>

    <h1>{data.${model.name}.id}</h1>
    `
}