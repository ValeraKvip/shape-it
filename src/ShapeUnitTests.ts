import * as fs from 'fs';
import prettier = require('prettier');
import { ModelManager, RootModels, Schema } from './Schema';
import path = require('path');



export async function shapeUnitTests(models: RootModels, schema: Schema) {
    const modelDir = schema.$serverProvider.getImportPathForModels();

    for (const mKey in models) {
        const model = models[mKey];
        if (Object.keys(model.subCollections)?.length) {
            shapeUnitTests(model.subCollections, schema);
        }

        let file = '';
        let commentsPrint = '';

        let importPrint = `
        import { z } from "zod";
        import { describe, it, expect } from 'vitest';
        import { type ${model.Name}, validate${model.Name} } from './${model.Name}';`;
        let validatePrint = '';
        let hasCustomRules = false;

        let mockValidKeys = '';
        let _it = '';

        for (let key of model.propsAsKeys) {
            const prop = model.props[key];
            const {constrains} = prop;           

          //  let propType = typeAlias(prop.propType || 'any');

            if (prop.propType in models) {
                importPrint += `import type {${prop.propType}} from './${prop.propType}'\n`
            }

            //validation.
            mockValidKeys += `${prop.codeName}:`
            switch (prop.propType) {
                case 'string': {

                    if ('length' in constrains) {

                        _it += `                      
                        it('${prop.codeName} has fixed length', async () => {
                            const length = ${constrains.length};
                            const valid = {...validData,...{${prop.codeName}:'x'.repeat(length)}};
                            expect( await validate${model.Name}(valid)).toBe<${model.Name}>(valid);

                            let invalid =  {...validData,...{${prop.codeName}:'x'.repeat(length + 1)}};
                            expect( await validate${model.Name}(invalid)).toThrowError();

                            invalid =  {...validData,...{${prop.codeName}:'x'.repeat(length - 1)}};
                            expect( await validate${model.Name}(invalid)).toThrowError();
                        });
                        `
                    } else {
                        if ('min' in constrains) {

                            _it += `
                            it('${prop.codeName} has min limit', async () => {
                                const min = ${constrains.min};
                                let valid = {...validData,...{${prop.codeName}:'x'.repeat(min)}};
                                expect( await validate${model.Name}(valid)).toBe<${model.Name}>(valid);
                                       
                                valid =  {...validData,...{${prop.codeName}:'x'.repeat(min + 1)}};
                                expect( await validate${model.Name}(valid)).toBe<${model.Name}>(valid);
    
                                let invalid =  {...validData,...{${prop.codeName}:'x'.repeat(min - 1)}};
                                expect( await validate${model.Name}(invalid)).toThrowError();
                            });
                            `
                        }
                        if ('max' in constrains) {

                            _it += `
                            it('${prop.codeName} has max limit', async () => {
                                const max = ${constrains.max};
                                let valid = {...validData,...{${prop.codeName}:'x'.repeat(max)}};
                                expect( await validate${model.Name}(valid)).toBe<${model.Name}>(valid);
                                       
                                valid =  {...validData,...{${prop.codeName}:'x'.repeat(max - 1)}};
                                expect( await validate${model.Name}(valid)).toBe<${model.Name}>(valid);
    
                                let invalid =  {...validData,...{${prop.codeName}:'x'.repeat(max + 1)}};
                                expect( await validate${model.Name}(invalid)).toThrowError();
                            });
                            `

                         
                        
                        }
                    }


                    let validLength = 1;
                    if ('length' in constrains) {
                        validLength = constrains.length;                      
                    }
                    else if ('min' in constrains) {
                        validLength = constrains.min;                       
                    }
                    else if ('max' in constrains) {
                        validLength = constrains.max;                        
                    }
                  
                    
                    mockValidKeys += `'x'.repeat(${validLength})`;

                    if ('trim' in constrains) {
                        _it += `
                        it('${prop.codeName} has trim modifier', async () => {                          
                            let invalid = {...validData,...{${prop.codeName}: "  " + 'x'.repeat(${validLength})}};
                            expect( await validate${model.Name}(invalid)).toBe<${model.Name}>(validData);
                                   
                            invalid =  {...validData,...{${prop.codeName}:'x'.repeat(${validLength}) + "  "}};
                            expect( await validate${model.Name}(invalid)).toBe<${model.Name}>(validData);

                            invalid =  {...validData,...{${prop.codeName}:"  " + 'x'.repeat(${validLength}) + "  "}};
                            expect( await validate${model.Name}(invalid)).toBe<${model.Name}>(validData);
                        });
                        `
                    }
                    break;
                }
                case 'number':
                case 'float': {
                    if ('min' in constrains) {
                        mockValidKeys += String(constrains['min']);
                    }
                    else if ('max' in constrains) {
                        mockValidKeys += String(constrains['max']);
                    }
                    else {
                        mockValidKeys += '1';
                    }
                    break;
                }
                case 'boolean': {
                    mockValidKeys += 'true'
                    break;
                }               
                case 'int': {
                    validatePrint += 'number().int()'
                    if ('min' in constrains) {
                        mockValidKeys += String(constrains['min']);
                    }
                    else if ('max' in constrains) {
                        mockValidKeys += String(constrains['max']);
                    }
                    else {
                        mockValidKeys += '1';
                    }
                    break;
                }           
                case 'file': {
                    mockValidKeys += '""';
                    break;
                }
                case 'image': {
                    mockValidKeys += '""';
                    break;
                }
                case 'email': {
                    mockValidKeys += '"xxx@xpost.mail"';
                    break;
                }
                case 'password': {
                    mockValidKeys += '"xxxx"';
                    break;
                }
                case 'url': {
                    mockValidKeys += '"https://x.domain"';
                    break;
                }
                default: {
                    mockValidKeys += 'null as any';
                }
            }

            mockValidKeys += ',\n'

        }
       

        file += `
        ${importPrint}
        ${commentsPrint}


        /**
         * Unit tests for @see validate${model.Name}.       
         */

        describe('# validate${model.Name}', () => {
            const validData:${model.Name} = {
                ${mockValidKeys}
            }

            it('Pass with valid data', async () => {
                expect( await validate${model.Name}(validData)).toBe<${model.Name}>(validData);
            });

            ${_it}
            
        });
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

        fs.writeFileSync(path.join(dir, `${model.Name}.test.ts`), formattedCode);
    }
}