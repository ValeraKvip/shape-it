import path = require("path");
import { ModelManager, RootModels, Schema } from "./Schema";
import prettier = require('prettier');
import * as fs from 'fs';
const term = require('terminal-kit').terminal;


export default async function shapeAuth(models: RootModels, schema: Schema) {
    const authProvider = schema.$authProvider;

    const writeFile = async (r) => {
        const formattedCode = await prettier.format(r.code, {
            parser: r.formatter,
            semi: true,
            singleQuote: true,
            trailingComma: 'all',
            bracketSpacing: true,
            plugins: ["prettier-plugin-svelte"]
        });

        const dir = r.path;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, r.filename);
        fs.writeFileSync(filePath, formattedCode);
    }

    //Append .env
    const filePath = path.join('', '.env');
    const code = `\ADMINS="[{"username":"admin","password":"admin"}]"`
   
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {            
            fs.writeFile(filePath, code, (err) => {
                if (err) {
                    console.error('Error creating .env file:', err);
                } else {
                    console.log('.env file created and code added.');
                }
            });
        } else {          
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading .env file:', err);
                    return;
                }

                if (!data.includes(code)) {
                    fs.appendFile(filePath, `\n${code}`, (err) => {
                        if (err) {
                            console.error('Error appending to .env file:', err);
                        } else {
                           // console.log('Code appended to .env file.');
                        }
                    });
                } else {
                   //'Code already exists in .env file.'
                }
            });
        }
    });
}

export function injectAuth(models: RootModels, schema: Schema) {
    // let modelName = '';
    // if('User' in models){
    //     if('UserAuth' in models){
    //         term(`^#^r Error ^ ^rOne of the names is required for authentication: 'User' or 'UserAuth.' However, both names are already in use. Please rename the existing models`);
    //         return 1;

    //     }else{
    //         term(`^#^y WARN ^ ^yThe name 'User' is already in use. The name 'UserAuth' will be used to name the model for authentication.`);
    //         return 1;
    //     }
    // }
    //  models['User'] = new ModelManager({
    //     $id: {
    //         type: 'number'
    //     },
    //     username: {
    //         type:'string'
    //     }
    //  }, "user", models);
}