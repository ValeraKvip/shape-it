import { ModelManager } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";

export function get_admin_models_layout_server(serverProvider: ServerProvider, model: ModelManager) {
    return `        
         ${serverProvider.getDatabaseImport()}        
 
         export async function load({ cookies, request }) {
            const url = new URL(request.url);
            const start = Number(url.searchParams.get('start') || 0);
            const count = Number((url.searchParams.get('count') || 20));           

            if (!Number.isInteger(start) || !Number.isInteger(count)
                || start < 0 || count <= 0) {
                  throw new Error('Whether start or count are invalid')
            }

            let search = url.searchParams.get('search') || undefined;
            if (search?.length) {
                search = search.replaceAll(/[^a-zA-Z0-9]/g, '').trim();
            }  
                
            let searchIn = url.searchParams.getAll('searchIn') ;
            if(searchIn?.length){
                searchIn = searchIn.map(x=> x.replaceAll(/[^a-zA-Z0-9$_.]/g, ''))
            }

             const result = await database.list${model.Names}({search, start, count});
             return result;
         }
        `
}