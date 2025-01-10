import process = require('process');
import shapeDatabase from './ShapeDatabase';
import { Model, ModelManager, RootModels, Schema, defaultSchema } from './Schema';
import shapeServer from './ShapeServer';
import { shapeModel } from './ShapeModel';
import { shapeUnitTests } from './ShapeUnitTests';
import { validateSchema } from './ValidateSchema';
import { capitalize, isPackageInstalled, UniqueShortName } from './utils';
import shapeAuth, { injectAuth } from './ShapeAuth';
const term = require('terminal-kit').terminal;

export default function ShapeIt(userSchema: Schema) {
    
    const schema = { ...defaultSchema, ...userSchema } as Schema;

    const models: RootModels = {}

    if (!validatePackages(schema)) {
        return process.exit(1);
    }


    for (let key in schema) {
        if (key[0] !== '$') {
            models[capitalize(key)] = new ModelManager(schema[key], String(key), models);
        }
    }

    //  prepareDbNames(models, _schema);
    if (schema.$authProvider) {
        injectAuth(models, schema);
    }

    for (const mKey in models) {
        const model = models[mKey];
        model.connectRefs();
    }

    for (const mKey in models) {
        const model = models[mKey];
        model.propsAsKeys.forEach(key=>{
            model.props[key].fillUpWithDefaultConstrains();
        });
    }

    

    if (validateSchema(models, schema) !== 0) {
        return process.exit(1);
    }


    if (!schema.$dbProvider.checkSchema?.(models, schema)) {
        return process.exit(1);
    }

    shapeModel(models, schema);
    shapeUnitTests(models, schema);
    shapeDatabase(models, schema);
    shapeServer(models, schema);
    shapeAuth(models, schema);

    term(`\n\n^#^g Done ^ ^gSuccessfully generated\n\n`);
}


function prepareDbNames(models: RootModels, schema: Schema) {
    const usedDbNames = Object.values(models).map(model => model.dbName).filter(Boolean);

    const uniqueShortName = new UniqueShortName(...usedDbNames);

    for (const mKey in models) {
        const model = models[mKey];

        if (!model.dbName) {
            if (schema.$dbProvider.autoGenerateShortDbNames) {
                model.dbName = uniqueShortName.getUniqueName();
            } else {
                model.dbName = model.name;
            }

        }

        const usedPropNames = [];
        for (let propKey of model.propsAsKeys) {
            const prop = model.props[propKey];
            if (prop.dbName) {
                usedPropNames.push(prop.dbName);
            }
        }

        const uniquePropShortName = new UniqueShortName(...usedPropNames);
        for (let propKey of model.propsAsKeys) {
            const prop = model.props[propKey];
            prop.codeName = prop.codeName || String(propKey);
            if (!prop.dbName) {
                prop.dbName = uniquePropShortName.getUniqueName();
            }
        }

        if (Object.keys(model.subCollections)?.length) {
            prepareDbNames(model.subCollections, schema);
        }
    }
}

function validatePackages(schema: Schema) {
    let allPackagesInstalled = true;

    const requirePackages: string[] = [];
    if (schema.$dbProvider) {
        requirePackages.push(...schema.$dbProvider.requirePackages());
    }

    if (schema.$serverProvider) {
        requirePackages.push(...schema.$serverProvider.requirePackages());
    }

    // if(schema.$styleProvider){
    //     requirePackages.push(...schema.$styleProvider.requirePackages());
    // }

    if (schema.$validatorProvider) {
        requirePackages.push(...schema.$validatorProvider.requirePackages());
    }

    if (schema.$authProvider) {
        requirePackages.push(...schema.$authProvider.requirePackages(),);
    }


    requirePackages.forEach(pkg => {
        if (!isPackageInstalled(pkg)) {
            term(`^#^r Error ^ ^rThe npm package ^b${pkg} ^ris not installed but is required\n`);
            term(`^gRun: ^bnpm install ${pkg} ^gto install\n`);
            allPackagesInstalled = false;
        }
    });

    return allPackagesInstalled;
}