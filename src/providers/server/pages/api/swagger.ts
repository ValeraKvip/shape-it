import { Schema, ModelManager, RootModels } from "../../../../Schema";
import ServerProvider from "../../ServerProvider";
// const packageJson = require('./package.json');
// const packageName = packageJson.name;

function getModels(schema, model) {
    return `  
    const response = await fetch('/${schema.$apiRoute}/${model.names}?start=5&count=50&search=Svelte', {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    });
    const {${model.names}, total} = await response.json();

    `.replace(/\n/g, '\\n');
}


function getModel(schema, model) {
    return `   
    const response = await fetch('/${schema.$apiRoute}/${model.names}/${model.name}/id', {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    });
    const ${model.name} = await response.json();
    `.replace(/\n/g, '\\n');
}

function postModel(schema, model) {
    return `   
    const response = await fetch('/${schema.$apiRoute}/${model.names}/${model.name}', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(${model.name}),
    });
    `.replace(/\n/g, '\\n');
}

function putModel(schema, model) {
    return `   
    const response = await fetch('/${schema.$apiRoute}/${model.names}/${model.name}', {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(${model.name}),
    });
    `.replace(/\n/g, '\\n');
}

function deleteModel(schema, model) {
    return `   
    const response = await fetch('/${schema.$apiRoute}/${model.names}/${model.name}/id', {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json'
        },        
    });
    `.replace(/\n/g, '\\n');
}

export function get_swagger_docs(schema: Schema, serverProvider: ServerProvider, models: RootModels) {


    let json = `{
    "openapi": "3.1.0",
    "info":{
        "title":"${schema.$title || 'API'}",
        "description":"${schema.$description || ''}",
        "version":"0.0.1",
    },
    "servers":[{
        url:"http://localhost:5173/api"
    }],

    "paths": {
        ${Object.keys(models).map(key => {
        const model = models[key];

        return `
            "/${model.names}": {                
                "get": {
                    "tags":["${model.names}"],
                    "summary":"Return a list of ${model.Names}",
                    "description": "${getModels(schema, model)}",
                    "parameters":[
                        {                            
                            "name":"start",
                            "in": "query",
                            "description":"Start pagination at, in other words, how many ${model.Names} to skip from the start.",
                            "required":false,
                            "schema":{
                                "type":"integer",
                                "default":0
                            }                            
                        },
                        {                            
                            "name":"count",
                            "in": "query",
                            "description":"How many ${model.Names} to retrieve",
                            "required":false,
                            "schema":{
                                "type":"integer",
                                "default":20
                            }                            
                        },
                        {                            
                            "name":"search",
                            "in": "query",
                            "description":"Search query",
                            "required":false,
                            "schema":{
                                "type":"string",                              
                            }                            
                        },
                        {                            
                            "name":"searchIn",
                            "in": "query",
                            "description":"An array of properties to search in. If the array is empty, it will search by the whole object. Only 'string' and 'number' properties are accepted.",
                            "required":false,
                            "schema":{
                                "type":"array",
                                "schema":{
                                    "type":"string",
                                }
                            }                            
                        }
                    ],                                            
                    "responses": {
                        "200":{
                            "description": "An object with two properties: 'total' - the total number of records or the total number of records after the search is applied, and '${model.Names}' - an array of retrieved records, which may be an empty array if there are no '${model.Names}' or if the 'start' parameter exceeds the '${model.Names}' count.",
                            "content":{
                                "application/json":{
                                    "schema":{
                                        "type":"object",
                                        "properties":{
                                            "total":{
                                                "type":"integer"
                                            },
                                            "${model.names}":{
                                                "type":"array",
                                                "items":{                                          
                                                    "$ref":"#/components/schemas/${model.Name}"
                                                }   
                                            }                                 
                                        }
                                    }
                                }
                            }
                        },
                        "400":{
                            "description": "Whether 'start' or 'count' are invalid."
                        }
                    }
                },               
            },

            "/${model.names}/${model.name}": {                          
                "post":{
                    "tags":["${model.names}"],
                    "summary":"Add a new ${model.Name}",
                    "description": "${postModel(schema, model)}",
                    "requestBody":{                        
                        "content":{
                            "application/json": {
                                "schema": {
                                    "type":"object",
                                    "properties":{
                                        ${formatPOSTProperties(model)}
                                    }
                                }
                            }
                        },
                        "required":true
                    },
                    "responses": {
                        "200":{
                            description:"${model.Name} has been successfully created."
                        },  
                        "400":{
                            "description": "Return an error message or a JSON string object where each key represents a property with an error, and the value contains the corresponding error message.",
                        },
                        "404":{
                             "description": "${model.Name} with the specified id does not exist.",
                        },
                        "500":{
                             "description": "Internal server error",
                        }
                    }
                  
                },
                
                "put":{
                    "tags":["${model.names}"],
                    "summary":"Update the ${model.Name}",
                    "description": "${putModel(schema, model)}",
                    "requestBody":{                        
                        "content":{
                            "application/json": {
                                "schema": {                                    
                                    "type":"object",
                                    "properties":{
                                        "id":{
                                            "type":"${model.idType}"
                                        },
                                        ${formatPOSTProperties(model)}
                                    }                        
                                }
                            },
                        },
                        "required":true
                    },
                    "responses": {
                        "200":{
                            description:"${model.Name} has been successfully updated."
                        },    
                        "400":{
                            "description": "Return an error message or a JSON string object where each key represents a property with an error, and the value contains the corresponding error message.",
                        },
                        "404":{
                             "description": "${model.Name} with the specified id does not exist.",
                        },
                        "500":{
                             "description": "Internal server error",
                        }
                    }
                },                   
            },

            "/${model.names}/${model.name}/{${model.name}Id}": {           
                "get": {
                    "tags":["${model.names}"],
                    "summary":"Return the ${model.Name} by id",
                    "description": "${getModel(schema, model)}",
                     "parameters": [
                        {
                            "name": "${model.name}Id",
                            "in": "path",
                            "description": "ID of the ${model.Name} to return",
                            "required": true,
                            "schema": {
                            "type": "${model.idType}",                           
                            }
                        }
                    ],
                    "responses": {
                        "200":{
                            "description": "The ${model.Name} with the given ID",
                            "content":{
                                "application/json":{
                                    "schema":{
                                        "$ref":"#/components/schemas/${model.Name}"
                                    }
                                }
                            }
                        },
                        "404":{
                             "description": "${model.Name} with the specified id does not exist.",
                        },
                        "500":{
                             "description": "Internal server error",
                        }
                    }
                },               
                
                "delete":{
                    "tags":["${model.names}"],
                    "summary":"Delete the ${model.Name} by id",
                    "description": "${deleteModel(schema, model)}",
                    "parameters": [
                        {
                            "name": "${model.name}Id",
                            "in": "path",
                            "description": "ID of the ${model.Name} to delete",
                            "required": true,
                            "schema": {
                            "type": "${model.idType}",                           
                            }
                        }
                    ],
                    "responses": {        
                        "200":{
                            description:"${model.Name} has been successfully deleted."
                        },                               
                        "404":{
                             "description": "${model.Name} with the specified id does not exist.",
                        },
                        "500":{
                             "description": "Internal server error",
                        }
                    }
                },
            }
            `;
    }).join(',')}
    },

    "components":{
        "schemas":{
                ${Object.keys(models).map(key => {
        const model = models[key];

        return `
            "${model.Name}": {
                "type":"object",
                    "properties":{
                        ${formatProperties(model)}
                    }
                }
            `;
    }).join(',')}
        }
    }

    }
    `;




    return json;
}


function formatProperties(model: ModelManager) {

    return `
    "id":{
        "type":"${model.idType}"
    },
    ${model.keysOmitId.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            if (prop.isArray) {
                return `"${key}":{
                    "type":"array",
                    "items":{
                       "$ref":"#/components/schemas/${prop.refersToModel.Name}"
                    }
                   
                }`;
            } else {
                return `"${key}":{
                    "$ref":"#/components/schemas/${prop.refersToModel.Name}"
                }`;
            }
        }
        if (prop.isArray) {
            let type: string = prop.propType;
            if (type === 'int') {
                type = 'integer';
            } else if (type === 'float') {
                type = 'number';
            }
            else if (type === 'file' || type === 'image') {
                return `"${key}Ids":{
                "type":"array",
                "items":{
                    "type":"string",
                    "format":"binary"
                }
               
                }`;
            }
            return `"${key}Ids":{
                "type":"array",
                "items":{
                    "type":"${type}",
                }
               
            }`;
        }
        if (prop.propType === 'boolean') {
            return `"${key}":{
                "type":"boolean",

            }`;
        }
        if (prop.propType === 'file' || prop.propType === 'image') {
            return `"${key}":{
                "type":"string",
                "format":"binary"

            }`;
        }
        if (prop.propType === 'int') {
            return `"${key}":{
                "type":"integer",
                "minimum": ${prop.constrains.min},
                "maximum": ${prop.constrains.max}


            }`;
        }
        if (prop.propType === 'number' || prop.propType === 'float') {
            return `"${key}":{
                "type":"number",
                "minimum": ${prop.constrains.min},
                "maximum": ${prop.constrains.max}

            }`;
        }
        if (prop.propType === 'string') {
            let min = ('min' in prop.constrains) ? `"minLength": ${prop.constrains.min},` : '';
            let max = ('max' in prop.constrains) ? `"maxLength": ${prop.constrains.max},` : '';
            if (('length' in prop.constrains)) {
                min = `"minLength": ${prop.constrains.length},`;
                max = `"maxLength": ${prop.constrains.length}`;
            }
            return `"${key}":{
                "type":"string",
                ${min}
                ${max}

            }`;
        }
        // if (prop.propType === 'enum') {
        //     return `${key}: data.get('${key}') || 0`;
        // }
        // if (prop.propType === 'select') {
        //     return `${key}: data.get('${key}') || ''`;
        // }
        // else {
        return `"${key}":{
                "type":"${prop.tsType}",

            }`;
        //}

    }).join(',')}`
}


function formatPOSTProperties(model: ModelManager) {

    return `${model.keysOmitId.map(key => {
        const prop = model.props[key];
        if (prop.isRefToAnotherModel) {
            if (prop.isArray) {
                return `"${key}Ids":{
                    "type":"array",
                    "items":{
                        "type":"${prop.refersToModel.idType}",
                    }
                   
                }`;
            } else {
                return `"${key}Id":{
                    "type":"${prop.refersToModel.idType}",
                }`;
            }
        }
        if (prop.isArray) {
            let type: string = prop.propType;
            if (type === 'int') {
                type = 'integer';
            } else if (type === 'float') {
                type = 'number';
            } else if (type === 'file' || type === 'image') {
                return `"${key}Ids":{
                "type":"array",
                "items":{
                    "type":"string",
                    "format":"binary"
                }
               
                }`;
            }
            return `"${key}Ids":{
                "type":"array",
                "items":{
                    "type":"${type}",
                }
               
            }`;
        }
        if (prop.propType === 'boolean') {
            return `"${key}":{
                "type":"boolean",

            }`;
        }
        if (prop.propType === 'file' || prop.propType === 'image') {
            return `"${key}":{
                "type":"string",
                "format":"binary"

            }`;
        }
        if (prop.propType === 'int') {
            return `"${key}":{
                "type":"integer",
                "minimum": ${prop.constrains.min},
                "maximum": ${prop.constrains.max}


            }`;
        }
        if (prop.propType === 'number' || prop.propType === 'float') {
            return `"${key}":{
                "type":"number",
                "minimum": ${prop.constrains.min},
                "maximum": ${prop.constrains.max}

            }`;
        }
        if (prop.propType === 'string') {
            let min = ('min' in prop.constrains) ? `"minLength": ${prop.constrains.min},` : '';
            let max = ('max' in prop.constrains) ? `"maxLength": ${prop.constrains.max},` : '';
            if (('length' in prop.constrains)) {
                min = `"minLength": ${prop.constrains.length},`;
                max = `"maxLength": ${prop.constrains.length}`;
            }
            return `"${key}":{
                "type":"string",
                ${min}
                ${max}

            }`;
        }
        // if (prop.propType === 'enum') {
        //     return `${key}: data.get('${key}') || 0`;
        // }
        // if (prop.propType === 'select') {
        //     return `${key}: data.get('${key}') || ''`;
        // }
        // else {
        return `"${key}":{
                "type":"${prop.tsType}",

            }`;
        //}

    }).join(',')}`
}
