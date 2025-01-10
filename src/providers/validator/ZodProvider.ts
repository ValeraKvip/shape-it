import { ModelManager, PropManager, RootModels } from "../../Schema";
import { commaNumber, underscoreNumber } from "../../utils";
import ValidatorProvider from "./ValidatorProvider";
//TODO underscoreNumber all numbers
export default class ZodValidator implements ValidatorProvider {
    requirePackages (){
        return [
            'zod',
        ]
    }

    _import_(): string {
        return 'import { z } from "zod";';
    }

    _wrap_(content: string): string {
        return `z.object({
                    ${content}
                }).strict().parse(data);`
    }

    _validate_(models: RootModels, model: ModelManager, prop: PropManager): string {
        const { constrains } = prop;

        let validatePrint = `z.`;
        switch (prop.propType) {
            case 'string': {
                validatePrint += 'string()';
                if ('trim' in constrains) {
                    validatePrint += `.trim()`;
                }
                if ('toLowerCase' in constrains) {
                    validatePrint += `.toLowerCase()`;
                }
                if ('toUpperCase' in constrains) {
                    validatePrint += `.toUpperCase()`;
                }
                if ('min' in constrains) {
                    validatePrint += `.min(${underscoreNumber(constrains['min'])})`;
                } else {
                    validatePrint += `.min(1)`;
                }
                if ('max' in constrains) {
                    validatePrint += `.max(${underscoreNumber(constrains['max'])})`;
                }
                if ('length' in constrains) {
                    validatePrint += `.length(${underscoreNumber(constrains['length'])})`;
                }
                if ('email' in constrains) {
                    validatePrint += `.email()`;
                }
                if ('url' in constrains) {
                    validatePrint += `.url()`;
                }
                if ('emoji' in constrains) {
                    validatePrint += `.emoji()`;
                }
                if ('uuid' in constrains) {
                    validatePrint += `.uuid()`;
                }
                if ('cuid' in constrains) {
                    validatePrint += `.cuid()`;
                }
                if ('cuid2' in constrains) {
                    validatePrint += `.cuid2()`;
                }
                if ('ulid' in constrains) {
                    validatePrint += `.ulid()`;
                }
                if ('regex' in constrains) {
                    validatePrint += `.regex(${constrains['regex']})`;
                }
                if ('includes' in constrains) {
                    validatePrint += `.includes(${constrains['includes']})`;
                }
                if ('startsWith' in constrains) {
                    validatePrint += `.startsWith(${constrains['startsWith']})`;
                }
                if ('endsWith' in constrains) {
                    validatePrint += `.endsWith(${constrains['endsWith']})`;
                }
                if ('datetime' in constrains) {
                    validatePrint += `.datetime()`;
                }
                if ('ip' in constrains) {
                    validatePrint += `.ip()`;
                }
                break;
            }
            case 'file':
                {
                    //TODO check .type  
                    //TODO keep name 
                    let print = ''
                    print += 'instanceof(File)';

                    if (prop.required) {
                        print += '.refine((file) => file !== null && file !== undefined, "file is required.")';

                    }

                    if ('min' in constrains) {
                        //size in bytes
                        print += `.refine((file) => file.size >  ${underscoreNumber(constrains['min'])}, "Min file size is ${commaNumber(constrains['min'])} bytes.")`;
                    }
                    if ('max' in constrains) {
                        //size in bytes
                        print += `.refine((file) => file.size <  ${underscoreNumber(constrains['max'])}, "Max file size is ${commaNumber(constrains['max'])} bytes.")`;
                    }

                    if ('accept' in constrains) {
                        const accepted = constrains['accept'].split(',').map(x => `'${x.trim()}'`);
                        print += `.refine((file) => [${accepted}].includes(file.type), "Only ${accepted} files are accepted")`;
                    }


                    if(!prop.required){
                        validatePrint += `union([
                             z.${print},
                             z.instanceof(File).refine((file) => file.size == 0)
                        ])`
                    }else{
                        validatePrint += print;
                    }

                    break;
                }
            case 'files':
                {
                    //TODO check .type  
                    //TODO keep name option
                    validatePrint += 'instanceof(File)';
                    validatePrint += '.refine((files) => files?.length > 1, "Only one file is accepted.")';

                    if (prop.required) {
                        validatePrint += '.refine((files) => files?.length == 0, "file is required.")';

                    }

                    if ('min' in constrains) {
                        //size in bytes
                        validatePrint += `.refine((files) => files[0].size >  ${constrains['min']}, "Min file size is ${constrains['min']} bytes.")`;
                    }
                    if ('max' in constrains) {
                        //size in bytes
                        validatePrint += `.refine((files) => files[0].size <  ${constrains['max']}, "Max file size is ${constrains['max']} bytes.")`;
                    }

                    if ('accept' in constrains) {
                        const accepted = constrains['accept'].split(',').map(x => `'${x.trim()}'`);
                        validatePrint += `.refine((files) => [${accepted}].includes(files[0].type), "Only ${accepted} files are accepted")`;
                    }

                    break;
                }
            case 'image': {

                //TODO check .type  
                //TODO keep name option
                let print ='';
                print += 'instanceof(File)';

                if (prop.required) {
                    print += '.refine((file) => file !== null && file !== undefined, "file is required.")';

                }

                if ('min' in constrains) {
                    //size in bytes
                    print += `.refine((file) => file.size >  ${underscoreNumber(constrains['min'])}, "Min file size is ${commaNumber(constrains['min'])} bytes.")`;
                }
                if ('max' in constrains) {
                    //size in bytes
                    print += `.refine((file) => file.size <  ${underscoreNumber(constrains['max'])}, "Max file size is ${commaNumber(constrains['max'])} bytes.")`;
                }

                if ('accept' in constrains) {
                    const accepted = constrains['accept'].split(',').map(x => `'${x.trim()}'`);
                    print += `.refine((file) => [${accepted}].includes(file.type), "Only ${accepted} files are accepted")`;
                }

                
                if(!prop.required){
                    validatePrint += `union([
                         z.${print},
                         z.instanceof(File).refine((file) => file.size == 0)
                    ])`
                }else{
                    validatePrint += print;
                }
                break;
            }
            case 'url': {
                validatePrint += 'string().trim().url()';
                if ('min' in constrains) {
                    validatePrint += `.min(${constrains['min']})`;
                }
                if ('max' in constrains) {
                    validatePrint += `.max(${constrains['max']})`;
                }
                if ('length' in constrains) {
                    validatePrint += `.length(${constrains['length']})`;
                }
                if ('regex' in constrains) {
                    validatePrint += `.regex(${constrains['regex']})`;
                }
                if ('includes' in constrains) {
                    validatePrint += `.includes(${constrains['includes']})`;
                }
                if ('startsWith' in constrains) {
                    validatePrint += `.startsWith(${constrains['startsWith']})`;
                }
                if ('endsWith' in constrains) {
                    validatePrint += `.endsWith(${constrains['endsWith']})`;
                }

                break;
            }
            case 'email': {
                validatePrint += 'string().email().trim()';
                if ('min' in constrains) {
                    validatePrint += `.min(${constrains['min']})`;
                }
                if ('max' in constrains) {
                    validatePrint += `.max(${constrains['max']})`;
                }
                if ('length' in constrains) {
                    validatePrint += `.length(${constrains['length']})`;
                }
                if ('regex' in constrains) {
                    validatePrint += `.regex(${constrains['regex']})`;
                }
                if ('includes' in constrains) {
                    validatePrint += `.includes(${constrains['includes']})`;
                }
                if ('startsWith' in constrains) {
                    validatePrint += `.startsWith(${constrains['startsWith']})`;
                }
                if ('endsWith' in constrains) {
                    validatePrint += `.endsWith(${constrains['endsWith']})`;
                }
                break;
            }
            case 'password': {
                //TODO add check for register and strongness
                validatePrint += 'string().trim()';
                if ('min' in constrains) {
                    validatePrint += `.min(${constrains['min']})`;
                }
                if ('max' in constrains) {
                    validatePrint += `.max(${constrains['max']})`;
                }
                if ('length' in constrains) {
                    validatePrint += `.length(${constrains['length']})`;
                }
                if ('regex' in constrains) {
                    validatePrint += `.regex(${constrains['regex']})`;
                }
                if ('includes' in constrains) {
                    validatePrint += `.includes(${constrains['includes']})`;
                }
                if ('startsWith' in constrains) {
                    validatePrint += `.startsWith(${constrains['startsWith']})`;
                }
                if ('endsWith' in constrains) {
                    validatePrint += `.endsWith(${constrains['endsWith']})`;
                }
                break;
            }
            case 'select': {
                validatePrint += `string()`;
                //TODO check if string is within an array.       
                break;
            }
            case 'enum': {
                validatePrint += `coerce.number().int().max(${constrains.options.length})`
                if (prop.required) {
                    validatePrint += '.positive()'
                } else {
                    validatePrint += '.nonnegative()'
                }
                break;
            }

            case 'date': {
                validatePrint += `coerce.date()`;
                //TODO and date ranges                                 
                break;
            }

            case 'number':
            case 'float': {
                validatePrint += 'coerce.number()';
                if ('positive' in constrains) {
                    validatePrint += `.positive()`;
                }
                if ('nonnegative' in constrains) {
                    validatePrint += `.nonnegative()`;
                }
                if ('negative' in constrains) {
                    validatePrint += `.negative()`;
                }
                if ('nonpositive' in constrains) {
                    validatePrint += `.nonpositive()`;
                }
                break;
            }
            case 'boolean': {
                validatePrint += 'boolean()'
                break;
            }
            case 'int': {
                validatePrint += 'coerce.number().int()'
                if ('positive' in constrains) {
                    validatePrint += `.positive()`;
                }
                if ('nonnegative' in constrains) {
                    validatePrint += `.nonnegative()`;
                }
                if ('negative' in constrains) {
                    validatePrint += `.negative()`;
                }
                if ('nonpositive' in constrains) {
                    validatePrint += `.nonpositive()`;
                }
                if ('min' in constrains) {
                    validatePrint += `.min(${constrains['min']})`;
                }
                if ('max' in constrains) {
                    validatePrint += `.max(${constrains['max']})`;
                }
                break;
            }
            // case 'array': {
            //     validatePrint += `array(z.string())`;
            //     if ('min' in constrains) {
            //         validatePrint += `.min(${constrains['min']})`;
            //     }
            //     if ('max' in constrains) {
            //         validatePrint += `.max(${constrains['max']})`;
            //     }
            //     if ('length' in constrains) {
            //         validatePrint += `.length(${constrains['length']})`;
            //     }
            //     break;
            // }
            default: {
                // if (prop.propType in models) {
                if (prop.isRefToAnotherModel) {
                    //TODO incorrect. id can has a lot of variations!
                    //TODO string id has to has length.
                    let _optional = '';
                    if(!prop.required){
                        _optional = '.optional()'
                    }
                    switch (models[prop.propType].idType) {
                        case 'number':
                            validatePrint += `
                            preprocess(val => val === '' ? undefined : Number(val),
                                z.number().positive("Selecting a ${prop.refersToModel.Name} is required.")${_optional})`;
                            break;
                        case 'string':
                            validatePrint += `string()${_optional}`;
                            break;
                    }

                    

                } else {
                    validatePrint += 'any()';
                }
            }
        }



        if ('rule' in constrains) {
            let refineStr = constrains.rule;
            model.propsAsKeys.forEach(key => {
                refineStr = refineStr.replaceAll(key, model.props[key].codeName);
            });

            validatePrint += `.refine((${prop.codeName}) => ${refineStr})`
        }

        if (prop.isArray) {
            validatePrint = `z.array(${validatePrint})`;


            if ('array' in prop.constrains) {
                if ('length' in prop.constrains.array) {
                    validatePrint += `.length(${prop.constrains.array.length},
                     "You must select exactly ${prop.constrains.array.length} item(s)")`;
                } else {
                    if ('min' in prop.constrains.array) {
                        validatePrint += `.min(${prop.constrains.array['min']},
                        "You must select at least ${prop.constrains.array.min} item(s)" )`;
                    } else {
                        if (prop.required) {
                            validatePrint += '.min(1,"You must select at least 1 item(s)")';
                        }
                    }
                    if ('max' in prop.constrains.array) {
                        validatePrint += `.max(${prop.constrains.array['max']},
                            "You cannot select more than ${prop.constrains.array.max} item(s).")`;
                    }
                }
            }

            //TODo optional for arrays
        }

        if (constrains['optional'] && !prop.isRefToAnotherModel) {
            validatePrint += `.optional()`
        }

        return validatePrint;
    }
}