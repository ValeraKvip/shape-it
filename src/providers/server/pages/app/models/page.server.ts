import { ModelManager } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";

export function get_app_models_page_server(serverProvider: ServerProvider, model: ModelManager) {
    return `        
         ${serverProvider.getDatabaseImport()}        
 
         export async function load({ cookies }) {            
             const ${model.names} = await database.list${model.Names}();
             return {${model.names}};
         }
    `
}