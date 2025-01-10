import { ModelManager, RootModels, Schema } from "../../Schema";


export default interface ServerProvider {
    requirePackages:()=> string[];
    processModel:(schema:Schema, model:ModelManager)=>{code:string,path:string, filename:string, formatter:string}[];
    processModels:(schema:Schema, models:RootModels)=>{code:string,path:string, filename:string, formatter:string}[];
    getPathForModels():string;
    getPathForDatabase():string;
    getPathForAuth():string;
    getImportPathForModels():string;
    getDatabaseImport():string;
    generateSitemap:(schema:Schema ,models: RootModels)=>{code:string,path:string, filename:string, formatter:string}
}