import { ModelManager } from "../../../../../../Schema";
import ServerProvider from "../../../../ServerProvider";

export function get_app_models_model_page_server(serverProvider: ServerProvider, model: ModelManager) {
   
 return `        
    import { error,  json,  type RequestEvent } from '@sveltejs/kit';        
    ${serverProvider.getDatabaseImport()}        


    export async function load({ cookies, params }) {
        //TODO add setting for lazy loading            
        if(!params.${model.name}){
            return error(400);
        }
      
        const ${model.name} = await database.get${model.Name}(${model.idType === 'number' ? `Number(params.${model.name})` : `params.${model.name}`}   );
        if(!${model.name}){
            return error(404);
        }

        return {${model.name}};
    }
   `;

}

