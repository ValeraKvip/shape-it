import { ModelManager, Schema } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";
import { getMediaCreate, getMediaDelete, getMediaUpdate } from "../../utils";

export function get_api_model_server(schema:Schema, serverProvider: ServerProvider, model: ModelManager) {
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);

    return `        
        import { json, error,  type RequestEvent  } from '@sveltejs/kit';
        ${serverProvider.getDatabaseImport()}        
        ${media.length ? `import media from '$lib/media';` : ''}
        import { validate${model.Name}, type ${model.Name}Form} from '$lib/models/${model.Name}';
        import { ZodError } from 'zod';
            
        export async function POST(event:RequestEvent) {
              try{
                const data = await event.request.json();
                console.log('#DATA',data);
                 // Validate  data.
                 const ${model.name}:${model.Name}Form = await validate${model.Name}(data);
                 // Data is valid.
                 

                 ${getMediaCreate(model)}

                // Insert the new records into the database. And return new record with id.
                const ${model.name}New = await database.add${model.Name}(${model.name});
                return json(${model.name}New);               
             }
             catch(e){
                console.error(e);
                if (e instanceof ZodError) {
                    const errors = e.errors.reduce((acc:{[key:string]:string}, { path, message }) => {
                        if(path?.length){
                            acc[path[0]] = message;
                        }
                
                        return acc;
                    }, {});

                    return error(400, JSON.stringify(errors));
                }else{
                    return error(400);
                }
             }            
        }    

        

        export async function PUT(event:RequestEvent) {
        try {
            const data = await event.request.json();
            console.log('#DATA', data);
            // Validate  data.
            if (!data.id) {
            return error(400, "id is required.");
            }
            const ${model.name}:${model.Name}Form = await validate${model.Name}(data);
            // Data is valid.
            ${getMediaUpdate(model)}
            
            // Update data in the database.
            const ${model.name}Updated = await database.update${model.Name}(${model.name});
            return  json(${model.name}Updated);            
        } catch (e) {
            console.error(e);
            if (e instanceof ZodError) {
            const errors = e.errors.reduce(
                (acc: { [key: string]: string }, { path, message }) => {
                if (path?.length) {
                    acc[path[0]] = message;
                }

                return acc;
                },
                {},
            );

            return error(400, JSON.stringify(errors));
            } else {
            return error(400);
            }
        }
    }    
    `
}