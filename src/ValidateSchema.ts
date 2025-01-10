const term = require('terminal-kit').terminal;
import { ModelManager, RootModels, Schema } from './Schema';
import path = require('path');
import { ARRAY_CONSTRAIN_FOR_NON_ARRAY_PROP, ARRAY_CONSTRAINS_MAX_MIN_ARE_EQUAL, ARRAY_LENGTH_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_LENGTH_CONSTRAIN_IS_NOT_INTEGER, ARRAY_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_MAX_CONSTRAIN_IS_NOT_INTEGER, ARRAY_MIN_AND_OPTIONAL_ARE_USED, ARRAY_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO, ARRAY_MIN_CONSTRAIN_IS_NOT_INTEGER, ARRAY_MIN_GREATER_MAX_CONSTRAIN, ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH, FLOAT_CONSTRAINS_MAX_MIN_ARE_EQUAL, FLOAT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, FLOAT_MAX_CONSTRAIN_IS_NOT_INTEGER, FLOAT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO as FLOAT_MIN_CONSTRAIN_IS_NEGATIVE, FLOAT_MIN_CONSTRAIN_IS_NOT_INTEGER, FLOAT_MIN_GREATER_MAX_CONSTRAIN, INT_CONSTRAINS_MAX_MIN_ARE_EQUAL, INT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, INT_MAX_CONSTRAIN_IS_NOT_INTEGER, INT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO, INT_MIN_CONSTRAIN_IS_NOT_INTEGER, INT_MIN_GREATER_MAX_CONSTRAIN, MODEL_IS_EMPTY, SITEMAP_DOMAIN_LOST, SITEMAP_MODEL_CHANGEFREQ_WRONG, STRING_CONSTRAINS_MAX_MIN_ARE_EQUAL, STRING_LOWERCASE_USED_WITH_UPPERCASE, STRING_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO, STRING_MAX_CONSTRAIN_IS_NOT_INTEGER, STRING_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO, STRING_MIN_CONSTRAIN_IS_NOT_INTEGER, STRING_MIN_GREATER_MAX_CONSTRAIN, STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH } from './errors';


export function validateSchema(models: RootModels, schema: Schema): number {
    term(`\n`);
    if (('$sitemap' in schema) && !schema.$sitemap.domain) {
        term(`^#^r Error ^:  ^rSitemap generation has been enabled, but a domain is required. If the ^bdomain ^ris not ready yet, use any placeholder, such as: ^b'https://svelte.dev'`);
        return SITEMAP_DOMAIN_LOST;
    }

    

    for (const mKey in models) {
        const model = models[mKey];

        if (model.propsAsKeys.length === 0) {
            term(`^#^r Error ^:  ^rModel ^b${model.Name}^: ^ris empty. The model must have at least one property in addition to the ^b$id`);
            return MODEL_IS_EMPTY;
        }

        if (('$sitemap' in schema) && schema.$sitemap &&  model.sitemap.changefreq) {
            if(!['always','hourly' , 'daily' , 'weekly' , 'monthly', 'yearly' , 'never'].includes(model.sitemap.changefreq)){
                term(`^#^r Error ^:  ^rModel ^b${model.Name}.$sitemap.changefreq^: ^rhas a wrong value. Allowed values are: ^b'always','hourly' , 'daily' , 'weekly' , 'monthly', 'yearly' , 'never'`);
                return SITEMAP_MODEL_CHANGEFREQ_WRONG;
            }
        }


        for (let key of model.propsAsKeys) {
            const prop = model.props[key];
            const { constrains } = prop;           

            if (!prop.isArray && constrains.array) {
                term(
                    `^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^ ^rYou have declared the 'array' constraint, but the property is not an array. Remove the constraint or declare the property as an array
                    ^b${model.originalName}:{
                        ${prop.codeName}:{
                            ^r- type:"${prop.declaredType}"^:
                            ^g+ type:"${prop.declaredType}[]"^:
                        ^b}
                    }
                `);
                return ARRAY_CONSTRAIN_FOR_NON_ARRAY_PROP;
            }

            if (prop.isArray) {
                if ("array" in constrains) {
                    const { max, min, length } = constrains.array;
                    if ((('max' in constrains.array) || ('min' in constrains.array)) && ('length' in constrains.array)) {
                        term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^ ^rDo not use 'min' or 'max' with the 'length' property.`);
                        return ARRAY_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH;
                    }
                    if ((('max' in constrains.array) && ('min' in constrains.array)) && (min > max)) {
                        term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^ ^#^r min > max ^ ^r'min' cannot be greater than 'max.'`);
                        return ARRAY_MIN_GREATER_MAX_CONSTRAIN;
                    }

                    if (('length' in constrains.array)) {
                        if (length <= 0) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rlength^ ^#^r length:0 ^ ^rThe 'length' must be greater than zero`);
                            return ARRAY_LENGTH_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        }

                        if (!Number.isInteger(length)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rlength^ ^#^r length:${length} ^ ^rThe 'length' property must be an integer.`);
                            return ARRAY_LENGTH_CONSTRAIN_IS_NOT_INTEGER;
                        }

                    }

                    if (('max' in constrains.array)) {
                        if (max <= 0) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmax^ ^#^r max:0 ^ ^rThe 'max' must be greater than zero`);
                            return ARRAY_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        }

                        if (!Number.isInteger(max)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmax^ ^#^r max:${max} ^ ^rThe 'max' property must be an integer.`);
                            return ARRAY_MAX_CONSTRAIN_IS_NOT_INTEGER;
                        }

                        if (min == max) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^: ^#^r min == max ^ ^r'min' cannot be equal to 'max.' Use 'length' instead.`);
                            return ARRAY_CONSTRAINS_MAX_MIN_ARE_EQUAL;
                        }

                    }

                    if (('min' in constrains.array)) {
                        if (min <= 0) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmin^ ^#^r min:0 ^ ^rThe 'min' must be greater than zero`);
                            return ARRAY_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        }

                        if (!Number.isInteger(min)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmin^ ^#^r min:${min} ^ ^rThe 'min' property must be an integer.`);
                            return ARRAY_MIN_CONSTRAIN_IS_NOT_INTEGER;
                        }

                        if(min > 0 && constrains.optional){
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmin^ && ^b${model.Name}^:.^y${prop.codeName}^:.^moptional^: \n^rThe array has been declared as 'optional', but a 'min' length constraint is being used as well. If a 'min' length is necessary, the array must be declared as required.`);
                            return ARRAY_MIN_AND_OPTIONAL_ARE_USED;
                        }
                    }
                                    
                } else {
                    // if(prop.required){
                    //     term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^marray^:.^rmin^ ^#^r min:0 ^ ^rThe 'min' must be greater than zero`);
                    // }
                }
            }

            //validation.         
            const { min, max, length, toLowerCase, toUpperCase } = constrains;
            switch (prop.propType) {
                case'image':
                case'file':{
                    term(`^#^r Error ^ ^rSorry, files and images are disabled during SvelteHack`);
                    return 333;

                }
                case 'string': {
                    if (('length' in constrains) && (('max' in constrains) || ('min' in constrains))) {
                        term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^: ^rDo not use 'min' or 'max' with the 'length' property.`);
                        return STRING_MIN_OR_MAX_CONSTRAIN_USED_WITH_LENGTH;
                    }
                    if (('max' in constrains) && (constrains.min == constrains.max)) {
                        term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^: ^#^r min == max ^ ^r'min' cannot be equal to 'max.' Use 'length' instead.`);
                        return STRING_CONSTRAINS_MAX_MIN_ARE_EQUAL;
                    }

                    if ((constrains.min > constrains.max)) {
                        term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^: ^#^r min > max ^ ^r'min' cannot be greater than 'max.'`);
                        return STRING_MIN_GREATER_MAX_CONSTRAIN;
                    }

                    if (('toLowerCase' in constrains) && ('toUpperCase' in constrains)) {
                        console.error(`Error in ${model.name}.${prop.codeName} useless usage of "toUpperCase" and "toLowerCase".`)
                        return STRING_LOWERCASE_USED_WITH_UPPERCASE;
                    }


                    if (('max' in constrains)) {
                        if (max <= 0) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:0 ^ ^rThe 'max' must be greater than zero`);
                            return STRING_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        }

                        if (!Number.isInteger(max)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:${max} ^ ^rThe 'max' property must be an integer.`);
                            return STRING_MAX_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }

                    if (('min' in constrains)) {
                        if (min <= 0) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:0 ^ ^rThe 'min' must be greater than zero`);
                            return STRING_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        }

                        if (!Number.isInteger(min)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:${min} ^ ^rThe 'min' property must be an integer.`);
                            return STRING_MIN_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }

                    break;
                }
                case 'number':
                case 'float': {
                    if (('max' in constrains) && (constrains.min === constrains.max)) {
                        console.error(`Error in ${model.name}.${prop.codeName} min == max. Use constants instead`)
                        return FLOAT_CONSTRAINS_MAX_MIN_ARE_EQUAL;
                    }

                    if (constrains.min > constrains.max) {
                        console.error(`Error in ${model.name}.${prop.codeName} min > max.`)
                        return FLOAT_MIN_GREATER_MAX_CONSTRAIN;
                    }

                    if (('max' in constrains)) {
                        // if (max <= 0) {
                        //     term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:0 ^ ^rThe 'max' must be greater than zero`);
                        //     return FLOAT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        // }

                        if (!Number.isInteger(max)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:${max} ^ ^rThe 'max' property must be an integer.`);
                            return FLOAT_MAX_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }

                    if (('min' in constrains)) {
                        // if (min < 0) {
                        //     term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:0 ^ ^rThe 'min' must be greater than zero`);
                        //     return FLOAT_MIN_CONSTRAIN_IS_NEGATIVE;
                        // }

                        if (!Number.isInteger(min)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:${min} ^ ^rThe 'min' property must be an integer.`);
                            return FLOAT_MIN_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }


                    break;

                }
                case 'boolean': {

                    break;
                }

                case 'int': {
                    if (('max' in constrains) && constrains.min === constrains.max) {
                        console.error(`Error in ${model.name}.${prop.codeName} min == max. Use constants instead`)
                        return INT_CONSTRAINS_MAX_MIN_ARE_EQUAL;
                    }

                    if (constrains.min > constrains.max) {
                        console.error(`Error in ${model.name}.${prop.codeName} min > max.`)
                        return INT_MIN_GREATER_MAX_CONSTRAIN;
                    }

                    if (('max' in constrains)) {
                        // if (max <= 0) {
                        //     term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:0 ^ ^rThe 'max' must be greater than zero`);
                        //     return INT_MAX_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        // }

                        if (!Number.isInteger(max)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmax^ ^#^r max:${max} ^ ^rThe 'max' property must be an integer.`);
                            return INT_MAX_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }

                    if (('min' in constrains)) {
                        // if (min <= 0) {
                        //     term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:0 ^ ^rThe 'min' must be greater than zero`);
                        //     return INT_MIN_CONSTRAIN_IS_NEGATIVE_OR_ZERO;
                        // }

                        if (!Number.isInteger(min)) {
                            term(`^#^r Error ^ ^b${model.Name}^:.^y${prop.codeName}^:.^rmin^ ^#^r min:${min} ^ ^rThe 'min' property must be an integer.`);
                            return INT_MIN_CONSTRAIN_IS_NOT_INTEGER;
                        }
                    }

                    break;
                }

                default: {

                }
            }
        }
    }

    return 0;
}