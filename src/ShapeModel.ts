import * as fs from 'fs';
import prettier = require('prettier');
import { multilineComment, interfaceProperty } from './utils';
import { ModelManager, RootModels, Schema } from './Schema';
import path = require('path');


export async function shapeModel(models: RootModels, schema: Schema) {
    const modelDir = schema.$serverProvider.getImportPathForModels();

    for (const mKey in models) {
        const model = models[mKey];

        let file = '';
        let commentsPrint = '';
        let propsPrint = '';
        let propsFormPrint = '';
        let propsDatabasePrint = '';
        let importPrint = '';
        let validatePrint = '';
        let hasCustomRules = false;

        importPrint += schema.$validatorProvider._import_();

        if (model.description) {
            commentsPrint += multilineComment(model.description);
        }

        let allProps = ''
        for (let key of model.propsAsKeys) {
            const prop = model.props[key];
            const { constrains } = prop;
            allProps += prop.codeName + ' '


            //let propType = prop.tsType;// typeAlias(prop.propType);

            if (prop.propType in models) {
                importPrint += `import type {${prop.propType}} from './${prop.propType}'\n`
            }



            //TODO temp
            if (prop.constrains.description) {
                propsPrint += multilineComment(prop.description, false) + '\n';
            }

            if (prop.propType === 'image' || prop.propType === 'image[]' || prop.propType === 'file' || prop.propType === 'file[]') {
                propsPrint += interfaceProperty(prop.codeName, constrains['optional'], prop.isArray ? 'string[]' : 'string');
            } else {
                propsPrint += interfaceProperty(prop.codeName, constrains['optional'], prop.tsType);
            }


            //propsFormPrint += multilineComment(prop.description, false);
            if (prop.isRefToAnotherModel) {
                //TODO check if one-to-one or many-to-many              
                const idType = models[prop.propType].idType;





                if (prop.isArray) {
                    validatePrint += `${prop.codeName}Ids: ${schema.$validatorProvider._validate_(models, model, prop)},\n`;
                    propsFormPrint += interfaceProperty(`${prop.codeName}Ids`, constrains['optional'], `${idType}[]`);
                    propsDatabasePrint += interfaceProperty(`${prop.codeName}Ids`, constrains['optional'], `${idType}[]`);
                } else {
                    validatePrint += `${prop.codeName}Id: ${schema.$validatorProvider._validate_(models, model, prop)},\n`;
                    propsDatabasePrint += interfaceProperty(`${prop.codeName}Id`, constrains['optional'], idType);
                    propsFormPrint += interfaceProperty(`${prop.codeName}Id`, constrains['optional'], idType);
                }
            } else {


                validatePrint += `${prop.codeName}: ${schema.$validatorProvider._validate_(models, model, prop)},\n`;

                if (prop.propType === 'image' || prop.propType === 'image[]' || prop.propType === 'file' || prop.propType === 'file[]') {
                    if (prop.isArray) {
                        propsFormPrint += "\n//Files have been uploaded and remain\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}`, true, 'string[]');

                        propsFormPrint += "\n//New files to be uploaded\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}Upload`, true, prop.tsType);

                        propsFormPrint += "\n//Files have been uploaded but need to be deleted\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}Delete`, true, 'string[]');
                    } else {
                        propsFormPrint += "\n//File has been uploaded and remains\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}`, true, 'string');

                        propsFormPrint += "\n//New file to be uploaded\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}Upload`, true, prop.tsType);

                        propsFormPrint += "\n//File has been uploaded but need to be deleted\n";
                        propsFormPrint += interfaceProperty(`${prop.codeName}Delete`, true, 'string');
                    }
                    // propsDatabasePrint += interfaceProperty(prop.codeName, constrains['optional'], 'string');
                    // propsFormPrint += interfaceProperty(`${prop.codeName}`, true,'string');
                    // propsFormPrint += interfaceProperty(`${prop.codeName}Upload`, constrains['optional'], prop.tsType);
                    // propsFormPrint += interfaceProperty(`${prop.codeName}Delete`,true, 'string');
                } else {
                    propsDatabasePrint += interfaceProperty(prop.codeName, constrains['optional'], prop.tsType);
                    propsFormPrint += interfaceProperty(prop.codeName, constrains['optional'], prop.tsType);
                }
            }




            if ('rule' in constrains) {
                hasCustomRules = true;
            }

            //validation.


        }


        // if (!model.getProp('id')) {
        propsPrint = `
                /**
                 * Auto generated id.
                 */
                id:${model.idType};
                ${propsPrint}
                `;

        propsFormPrint = `               
                id?:${model.idType};
                ${propsFormPrint}
                `;

        propsDatabasePrint = `               
                id?:${model.idType};
                ${propsDatabasePrint}
                `;

        if (model.idType === 'string') {
            //IT has to be in validator, so its belong to ZOD only
            validatePrint =
                `
              id: z.coerce.string().optional(),
              ${validatePrint}
              `
        } else {
            //IT has to be in validator, so its belong to ZOD only
            validatePrint =
                `
              id: z.coerce.number().positive().optional(),
              ${validatePrint}
              `
        }

        //  }

        allProps = allProps.trim().replaceAll(' ', ',');
        file += `
        ${importPrint}
        ${commentsPrint}
        export interface ${model.Name}{        
            ${propsPrint}
        }

         export interface ${model.Name}Form{        
            ${propsFormPrint}
        }

      
        /**
         * Validate's ${model.Name} form.
         * @param {${model.Name}Form} data the object of type ${model.Name} to be validated.
         * @throws {z.ZodError} Throws an error if the validation fails.
         * @return {Promise<${model.Name}Form>} validated and modified ${model.Name} object.
         */
        export async function validate${model.Name}(data:unknown):Promise<${model.Name}Form>{
            ${hasCustomRules ? `const {${allProps}} = data as ${model.Name}Form;` : ''}        
            return ${schema.$validatorProvider._wrap_(validatePrint)}           
        }
        `

        const formattedCode = await prettier.format(file, {
            parser: 'typescript',
            semi: true,
            singleQuote: true,
            trailingComma: 'all',
            bracketSpacing: true,
        });

        let parentName = '';
        if (model.parent) {
            parentName = `/${model.parent.name}`
        }
        const dir = `./${schema.$serverProvider.getPathForModels()}${parentName}`
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFileSync(path.join(dir, `${model.Name}.ts`), formattedCode);
    }
}