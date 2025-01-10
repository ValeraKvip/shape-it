import { ModelManager, RootModels, Schema } from "../../Schema";
import DatabaseProvider from "./DatabaseProvider";

export class DefaultDatabaseProvider implements DatabaseProvider {
   
    preShape?: (models: { [model: string]: ModelManager; }, schema: Schema) => boolean;
    autoGenerateShortDbNames: boolean = true;


    requirePackages() {
        return [
        ]
    }

    init() {
        return `    
        const dir = path.join(process.cwd(), 'static/.shape-it');
        const filePath = path.join(dir, 'data.json');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); 
        }    

        let data = null as any;
           if (fs.existsSync(filePath)) {
            data = fs.readFileSync(filePath, 'utf8');
        }  
             
        const db = (data? JSON.parse(data): {}) as any;  
        database.notifyDatasetUpdated();
        `
    }

    getImports() {
        return `
            import fs from 'fs';
            import path from 'path';
        `
    }
    /**
     * for (let key of model.propsAsKeys) {
                const prop = model.props[key];
     */
    addModel(type, model: ModelManager, schema, options) {
        return `
        if(!db['${model.names}']){
            db['${model.names}'] = [];
        }

        const id = ++this.${model.names}LastId;   
        
        const ${model.name} = 
        {
            id:${model.idType === 'string' ? 'String(id)' : 'id'},
            ${model.propsAsKeys.map(key => {
            const prop = model.props[key];
            if (prop.isRefToAnotherModel) {
                if (prop.isArray) {
                    return `${prop.dbName}: data.${prop.codeName}Ids`;
                } else {
                    return `${prop.dbName}: data.${prop.codeName}Id`;
                }
            } else {
                return `${prop.dbName}: data.${prop.codeName}`;
            }
        }).join(',\n')

            }
            
        };
               
        db['${model.names}'].push(${model.name});
        this.saveDB();

        return ${model.name};
        `
    }

    addModels(type, model, schema, options) {
        return `
        if(!db['${model.names}']){
            db['${model.names}'] = [];
        }

        const dataWithId = data.map(t=>{
          const id = ++this.${model.names}LastId;
          t.id = ${model.idType === 'string' ? 'String(id)' : 'id'};
        })
       
               
        db['${model.names}'].push(...dataWithId);
        this.saveDB();

        return dataWithId;
        `
    }

    deleteModel(type: string, model: any, schema: any, options?: any): string {
        return `
        if(!db['${model.names}']){
            return true;
        }

        const index =  db['${model.names}'].findIndex(x => x.id == id);
        if(index === -1){
            return true;
        }
       
        db['${model.names}'].splice(index, 1)
                  
        this.saveDB();
        return true;
        `
    }

    getModel(type: string, model: any, schema: any, options?: any): string {

        return `
        if(!db['${model.names}']){
            return null;
        }

        // const index =  db['${model.names}'].findIndex(x => x.id == id);
        // if(index === -1){
        //     return null;
        // }
                  
        // return db['${model.names}'][index];

        const result = await this.get${model.Names}([id]);
        if(result?.length){
            return result[0];
        }
        return null;
        `
    }

    getModels(type: string, model: ModelManager, schema: any, options?: any): string {
        return `
        if(!db['${model.names}'] || !ids?.length){
            return [];
        }
        
        return await Promise.all(db['${model.names}']
        .filter(x => ids.includes(x.id))
        .map(async(data) =>{
            return {
                id:data.id,
                ${model.propsAsKeys.map(key => {
                    const prop = model.props[key];
                    if (prop.isRefToAnotherModel) {
                        if (prop.isArray) {
                            return `${prop.dbName}: await  this.get${prop.refersToModel.Names}(data.${prop.dbName})`;
                        } else {
                            return `${prop.dbName}:await this.get${prop.refersToModel.Name}(data.${prop.dbName})`;
                        }
                    } else {
                        return `${prop.dbName}: data.${prop.codeName}`;
                    }
                    }).join(',\n')

                }
            }
            }));
        `
    }

    updateModel(type: string, model: any, schema: any, options?: any): string {
        return `
        if(!db['${model.names}']){
            return null;
        }

        const index =  db['${model.names}'].findIndex(x => x.id == data.id);
        if(index === -1){
            return null;
        }
                
        db['${model.names}'][index] = {
            ...db['${model.names}'][index],
            ...{          
                ${model.propsAsKeys.map(key => {
                    const prop = model.props[key];
                    if (prop.isRefToAnotherModel) {
                        if (prop.isArray) {
                            return `${prop.dbName}: data.${prop.codeName}Ids`;
                        } else {
                            return `${prop.dbName}: data.${prop.codeName}Id`;
                        }
                    } else {
                        return `${prop.dbName}: data.${prop.codeName}`;
                    }
                    }).join(',\n')

                }
            
                }
            };
        this.saveDB();

        return db['${model.names}'][index];
        `
    }

    listModels(type: string, model: any, schema: any, options?: any): string {
        const searchableTypes = ['string','number'];
        return `
        const start = params?.start || 0;
        const count = params?.count || 20;
       
        if(!db['${model.names}'] || start > db['${model.names}'].length){
            return {
                total:0,
                ${model.names}:[]
            };
        }

        const searchIn = params?.searchIn?.length? params.searchIn: [ ${model.propsAsKeys.filter(x=>searchableTypes.some(t=>t.includes(model.props[x].tsType))).map(x=>`'${x}'`).join(',')}];
        const search = searchIn?.length? (params?.search || null):null;

        const filter = search ? db['${model.names}'].filter(data => searchIn.some(k=>String(data[k]).includes(search))) : db['${model.names}'];

        const result =  await Promise.all(filter
        .slice(start, start + count)       
        .map(async(${model.name}:${model.Name}) =>{
            return {
                id:${model.name}.id,
                ${model.propsAsKeys.map(key => {
                    const prop = model.props[key];
                    if (prop.isRefToAnotherModel) {
                        if (prop.isArray) {
                            return `${prop.dbName}: ${model.name}.${prop.dbName} ? await this.get${prop.refersToModel.Names}(${model.name}.${prop.dbName}.map(${prop.refersToModel.name}=>${prop.refersToModel.name}.id)) : []`;
                        } else {
                            return `${prop.dbName}: ${model.name}.${prop.dbName}? await this.get${prop.refersToModel.Name}(${model.name}.${prop.dbName}.id) : null`;
                        }
                    } else {
                        return `${prop.dbName}: ${model.name}.${prop.codeName}`;
                    }
                    }).join(',\n')
                }
            }
        }));     

        return {
            total:filter.length,
            ${model.names}:result
        }
        `
    }

    listSlugs (type: string, model: any, schema: any, options?: any):string{
        return `
        if(!db['${model.names}']){
            return [];
        }

        return await Promise.all(db['${model.names}']      
        .map(async(data:${model.Name}) => String(data.id)));                
        `
    }


    classBody(models: { [model: string]: ModelManager; }, schema: Schema) {
        let result = `
        
        `;
        for (const key in models) {
            const model = models[key]

            result += `
            ${model.names}LastId = 0;
            `

        }

        result += `

        notifyDatasetUpdated(){
        ${Object.keys(models).map(key => {
            const model = models[key]
            return `this.${model.names}LastId = db['${model.names}']? Math.max( ...db['${model.names}'].map(x=>x.id)) :0;`
        }).join(';\n')
            }
         
        }

        saveDB(){        
             fs.writeFileSync(filePath, JSON.stringify(db), 'utf8');
        }
        `
        return result;
    }

    checkSchema(models: RootModels, schema: Schema): boolean {
        return true;
    }
}