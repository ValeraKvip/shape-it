import { ModelManager, Schema } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";

export function get_api_models_server(schema:Schema, serverProvider: ServerProvider, model: ModelManager) {
    return `        
        import { json, error,  type RequestEvent } from '@sveltejs/kit';
        ${serverProvider.getDatabaseImport()}        
 
        export async function GET({request}:RequestEvent) {
            const url = new URL(request.url);

            const start = Number(url.searchParams.get('start') || 0);
            const count = Number((url.searchParams.get('count') || 20));           

            if (!Number.isInteger(start) || !Number.isInteger(count)
                || start < 0 || count <= 0) {
                error(400);
            }

            let search = url.searchParams.get('search') || undefined;
            if(search?.length){
                search = search.replaceAll(/[^a-zA-Z0-9]/g, '').trim();
            }

            let searchIn = url.searchParams.getAll('searchIn') ;
            if(searchIn?.length){
                searchIn = searchIn.map(x=> x.replaceAll(/[^a-zA-Z0-9$_.]/g, ''))
            }

            const result = await database.list${model.Names}({start, count, search, searchIn});

            return json(result);
        }        
    `
}