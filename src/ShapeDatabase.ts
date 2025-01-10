import * as fs from 'fs';
import prettier = require('prettier');
import { ModelManager, RootModels, Schema } from './Schema';
import path = require('path');

export default async function shapeDatabase(models: RootModels, schema: Schema) {
    const dbProvider = schema.$dbProvider;

    let imports = '';
    let declarations = '';
    let implementations = '';


    for (const key in models) {
        const model = models[key]
        const t = model.Name;

        imports += `import {type ${t}, type ${t}Form ,validate${t} } from "${schema.$serverProvider.getImportPathForModels()}/${t}"\n`

        declarations += `
        /**
         * Add ${t} to database.
         * @param data object of type ${t}.
         * @throw database error on fail.
         * @return ${t} - if success, null - if error or unable to add.
         */
        add${t}:(data:${t}Form)=>Promise<${t}|null>,

        /**
         * Add multiple ${model.Names} to database.
         * @param data array of objects of type ${t}.
         * @throw database error on fail.
         * @return true - if success, false - if error or unable to add.
         */
        add${model.Names}:(data:${t}Form[])=>Promise<${t}[]|null>,

        /**
         * Delete a ${t} from the database.
         * @param data object of type ${t} or object id in database.
         * @throw database error on fail.
         * @return true on success, false on fail.
         */
        delete${t}:(id:${typeof (model.propsAsKeys['id'])})=>Promise<boolean>,

        /**
         * Update a ${t} from the database.
         * @param data object of type ${t} to be updated.       
         * @return updated ${t} on success, or null if a ${t} with the id does not exist.
         */
        update${t}:(data:${t}Form)=>Promise<${t}|null>,

        /**
         * Retrieve a ${t} from the database.
         * @param id - the id of the object in the database.        
         * @return ${t} on success, or null if a ${t} with the id does not exist.
         */
        get${t}:(id:string|number)=>Promise<${t}|null>,

        /**
         * Retrieve  multiple ${model.Names} from the database.
         * @param the ids of the  ${model.Names} to be retrieved.               
         * @return an array of ${model.Names} or an empty array. If some elements do not exist, they will be skipped in the resulting array.
         */
        get${model.Names}:(ids:${model.idType}[])=>Promise<${t}[]>,

         /**
         * Paginate multiple ${model.Names} from the database.
         * @param start - the index from which to start retrieving elements.
         * @param count - the number of elements to be retrieved.         
         * @return an array of ${model.Names} or an empty array. If start is greater than the record count, return an empty array.
         * 
         */
        list${model.Names}:(params?:ListParams)=>Promise<${t}[]>,

        /**
         * Retrieve all ${model.Names} slugs(or ids) from the database.            
         * @return an array of ${model.Names} slugs or an empty array.         
         */
         slug${model.Names}():Promise<string[]>,
        `

        implementations += `
        async add${t}(data:${t}Form) {           
            ${dbProvider.addModel(t, model, schema)}           
        }

        async add${model.Names}(data:${t}Form[]){          
            ${dbProvider.addModels(t, model, schema)}          
        }

        async delete${t}(id:${model.idType}){          
            ${dbProvider.deleteModel(t, model, schema)}              
        }

        async  update${t}(data:${t}Form) {
             ${dbProvider.updateModel(t, model, schema)}    
        }

        async get${t}(id:${model.idType}) {
             ${dbProvider.getModel(t, model, schema)}    
        }

        async get${model.Names}(ids:${model.idType}[]) {
            ${dbProvider.getModels(t, model, schema)}    
        }

        async list${model.Names}(params?:ListParams){
             ${dbProvider.listModels(t, model, schema)}    
        }

        async slug${model.Names}():Promise<string[]>{
             ${dbProvider.listSlugs(t, model, schema)}    
        }
      `
    }


    let db = `
    ${dbProvider.getImports()}
    ${imports}

    export type ListParams = {
        start?: number,
        count?: number,
        search?: string,
        searchIn?: string[]
    }

    /**
     * Database API
     */
    export interface IDatabase{
        db:any;//TODO type real
        ${declarations}
    }


    class Database implements Database{
        db:any;
        ${schema.$dbProvider.classBody?.(models, schema)}
        ${implementations}
    }

    const database = new Database();

    ${dbProvider.init()}

    export {database};
    `;

    const formattedCode = await prettier.format(db, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
    });

    const dir = schema.$serverProvider.getPathForDatabase();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const filePath = path.join(dir, 'database.ts');

    fs.writeFileSync(filePath, formattedCode);
}