import * as fs from 'fs';
import prettier = require('prettier');
import { RootModels, Schema } from "./Schema";
import path = require('path');
import { copy_components } from './ui/copy_components';


export default function shapeServer(models: RootModels, schema: Schema) {
    const serverProvider = schema.$serverProvider;

    const writeFile = async(r)=>{
        const formattedCode = await prettier.format(r.code, {
            parser: r.formatter,
            semi: true,
            singleQuote: true,
            trailingComma: 'all',
            bracketSpacing: true,
            plugins:["prettier-plugin-svelte"]
        });

        const dir = r.path;
       
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir,{ recursive: true });
        }

        const filePath = path.join(dir, r.filename);
        fs.writeFileSync(filePath, formattedCode);
    }

    for (const key in models) {
        const model = models[key];
        const result = serverProvider.processModel(schema, model);
        result.forEach(writeFile)
    }

    const result = serverProvider.processModels(schema, models);
    result.forEach(writeFile)

    if(schema.$sitemap){
        writeFile(serverProvider.generateSitemap(schema,models));
        
    }

    //Append .gitignore
    const filePath = path.join('', '.gitignore');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {            
            return;
        }

        const code = `\n\n#Shape-it\nstatic/.shape-it`
       
        if (!data.includes(code)) {           
            fs.appendFile(filePath, code, (err) => {});
        }             
    });

    //Copy Ui files to components
    const componentsToCopy = copy_components();
    componentsToCopy.forEach(writeFile);
}