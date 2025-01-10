import { Schema, ModelManager } from "../../../../../../Schema";
import ServerProvider from "../../../../ServerProvider";
import { getMediaCreate, getMediaUpdate, getMediaDelete } from "../../../utils";


export function get_api_model_id_server(schema:Schema, serverProvider: ServerProvider, model: ModelManager) {
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);

    return `        
        import { json, error,  type RequestEvent } from '@sveltejs/kit';
        ${serverProvider.getDatabaseImport()}        
        ${media.length ? `import media from '$lib/media';` : ''}      
 
        export async function GET({ params }:RequestEvent) {
            const { id } = params;
            if(!id){
                error(400, "id is required.");
            }

            const ${model.name} = await database.get${model.Name}(${model.idType === 'number' ? 'Number(id)' : 'id'});

            if(!${model.name}){
                error(404,);
            }

            return json(${model.name});
        }        


        export async function DELETE({request, params}:RequestEvent) {
            const { id } = params;

            if(!id){
                error(400, "id is required.");
            }

            const ${model.name} = await database.get${model.Name}(${model.idType === 'number' ? 'Number(id)' : 'id'});

            if(!${model.name}){
                error(404,);
            }
            
            //TODO delete related media.
            
            await database.delete${model.Name}(${model.name}.id);   
            return  new Response(null, { status: 200 });            
        }
    `
}