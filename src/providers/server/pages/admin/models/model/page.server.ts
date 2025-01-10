import { ModelManager } from "../../../../../../Schema";
import ServerProvider from "../../../../ServerProvider";
import { getMediaCreate, getMediaDelete, getMediaUpdate } from "../../../utils";

export function get_admin_models_model_page_server(serverProvider: ServerProvider, model: ModelManager) {
   
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);

    return `        
    import { error, fail, json, type Actions, type RequestEvent } from '@sveltejs/kit';        
    ${serverProvider.getDatabaseImport()}        
    ${media.length ? `import media from '$lib/media';` : ''}
    import { validate${model.Name}, type ${model.Name}Form} from '$lib/models/${model.Name}';

    export async function load({ cookies, params }) {
        //TODO add setting for lazy loading            
        if(!params.${model.name}){
            return error(400);
        }

        if(params.${model.name} === 'create'){
            return {};
        }

        const ${model.name} = await database.get${model.Name}(${model.idType === 'number' ? `Number(params.${model.name})` : `params.${model.name}`}   );
        if(!${model.name}){
            return error(404);
        }

        return {${model.name}};
    }

    export const actions = {
         create: async ({ cookies, request }) => {
             try{
                 const data = await request.formData();
                 console.log('#DATA',data);
                 // Validate form data.
                 const ${model.name}:${model.Name}Form = await validate${model.Name}({
                     ${getFormActions(model)} 
                 });
                 // Data is valid.
                 

                 ${getMediaCreate(model)}

                // Insert the new records into the database.
                return await database.add${model.Name}(${model.name});

             }
             catch(e){
                console.error(e);
                const errors = e.errors.reduce((acc, { path, message }) => {
                    if(path?.length){
                        acc[path[0]] = message;
                    }
            
                    return acc;
                }, {});

                return fail(400, {
                    errors,
                    error: 'Fatal error encountered. Please check the logs for more details.'
                });
             }
         },

         update: async ({ cookies, request }) => {
             try{
                 const data = await request.formData();
                  console.log('#UPD',data);
                 // Validate form data.
                 if (!data.get('id')) {
                     return fail(400, {
                         error: "ID is required but was not specified."
                     });
                 }                

                 const ${model.name}:${model.Name}Form = await validate${model.Name}({
                    id: data.get('id'),
                    ${getFormActions(model)}                        
                
                 });

                 // Data is valid.
                  ${getMediaUpdate(model)}

                // Update data in the database.
                return await database.update${model.Name}(${model.name});

             }
             catch(e){
                console.error(e);
                return fail(400, {
                    error: 'Fatal error encountered. Please check the logs for more details.'
                });
             }
         },

         delete: async ({ cookies, request }) => {
              try{
                 const data = await request.formData();
                 const id = data.get('id');
                 if (!id) {
                     return fail(400, {
                         error: "ID is required but was not specified."
                     });
                 }
                

                ${getMediaDelete(model)}

                return await database.delete${model.Name}(${model.idType === 'number' ? 'Number(id)' : 'id'});

             }
             catch(e){
                console.error(e);
                return fail(400, {
                    error: 'Fatal error encountered. Please check the logs for more details.'
                });
             }
         }            
     } satisfies Actions;
   `;

}



function getFormActions(model: ModelManager) {

    return `${model.keysOmitId.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            if (prop.isArray) {
                return `${key}Ids: data.getAll('${key}Ids')`;
            } else {
                return `${key}Id: data.get('${key}Id')`;
            }
        }
        if (prop.isArray) {
            return `${key}: data.getAll('${key}')`;
        }
        if (prop.propType === 'boolean') {
            return `${key}: (data.get('${key}') || false) === 'on'`;
        }
        if (prop.propType === 'enum') {
            return `${key}: data.get('${key}') || 0`;
        }
        if (prop.propType === 'select') {
            return `${key}: data.get('${key}') || ''`;
        }
        else {
            return `${key}: data.get('${key}')`;
        }

    })}`
}

function formToDatabase(model: ModelManager) {

    return `${model.keysOmitId.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            return `${key}Id: ${model.name}.${key}Id`;
        } else if (prop.tsType === 'File') {
            return `${key}:_${key}StoragePath`;
        }
        else {
            return `${key}: ${model.name}.${key}`;
        }

    })}`
}