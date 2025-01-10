import { ModelManager, RootModels, Schema } from "../../Schema";
import DatabaseProvider from "./DatabaseProvider";



export class PrismaProvider implements DatabaseProvider {
    listSlugs: (type: string, model: any, schema: any, options?: any) => string;
    getModel: (type: string, model: any, schema: any, options?: any) => string;
    getModels: (type: string, model: any, schema: any, options?: any) => string;
    updateModel: (type: string, model: any, schema: any, options?: any) => string;
    listModels: (type: string, model: any, schema: any, options?: any) => string;
  
    preShape?: (models: { [model: string]: ModelManager; }, schema: Schema) => boolean;
    autoGenerateShortDbNames: boolean = true;


    requirePackages() {
        return [
         //   'firebase',
        ]
    }

    init() {
        return `
        var app;
        var firestoreDb;

        if (!app) {
            app = initializeApp({});
        }

        if (!firestoreDb) {
            firestoreDb = getFirestore(app);            
        }

        db.db = firestoreDb;      
        `
    }

    getImports() {
        return `
        import { initializeApp } from "firebase/app";
        import { getFirestore, connectFirestoreEmulator,
            doc, setDoc, collection, addDoc, deleteDoc,
            DocumentSnapshot,
            type SnapshotOptions } from "firebase/firestore";
        `
    }

    addModel(type, model, schema, options) {
        return `
        const docRef = await addDoc(
            collection(this.db, "${model.dbName}")
            .withConverter(this.${model.name}Converter), data);

        data.id =  docRef.id;
        return data;
        `
    }

    addModels(type, model, schema, options) {
        return `
        const tasks = data.map(data => addDoc(
            collection(this.db, "${model.dbName}")
            .withConverter(this.${model.name}Converter), data))

          const docRefs = await Promise.all(tasks);
          return docRefs.map(doc=> {
            const data = doc.data();
            data.id = doc.id;
            return data;
          })
        `;
    }

    deleteModel(type: string, model: any, schema: any, options?: any):string{
        return `
        let id = '';
        if( typeof data === 'string' ||  typeof data === 'number'){
            id = String(data);
        }
        else{
            id =  String(data.id);
        }

        await deleteDoc(doc(this.db, "${model.dbName}", id));
       `;
    }

    classBody(models: { [model: string]: ModelManager; }, schema: Schema) {
        let result = '';
        for (const key in models) {
            const model = models[key]
            const t = model.name;
            const dbName = model.dbName;

            let toFirestore = '';
            let fromFirestore = '';
            for (let propKey of model.propsAsKeys) {
                const prop = model.getProp(propKey);
                if (prop) {
                    toFirestore += `
                    ${prop.dbName}: data.${prop.codeName},`;

                    fromFirestore += `
                       ${prop.codeName}: data.${prop.dbName},`;
                }
            }


            result += `
            get ${t}Converter() {
                return {
                    toFirestore: (data:${t}) => {
                        return {
                            ${toFirestore}
                            };
                    },
                    
                    fromFirestore: (snapshot:DocumentSnapshot, options:SnapshotOptions) : ${t}|null => {
                        if(!snapshot.exists()){
                            return null;
                        }

                        const data = snapshot.data(options);
                        return {
                            ${fromFirestore}
                        }
                    }
                };
            } 
            `

        }
        return result;
    }

    checkSchema(models: RootModels, schema: Schema): boolean {

        const byteSize = str => new Blob([str]).size + 1;
        const MIB = 1_048_487;
        //TODO Constraints on field names Must be valid UTF-8 characters
        for (const model of Object.values(models)) {
            if (model.subCollections && !this.checkSchema(model.subCollections, schema)) {
                return false;
            }

            //const model = models[collectionName];
            const collectionName = model.name;
            if (byteSize(model.dbName) > 6_144) {
                console.error(`Maximum size for a document name is 6 KiB. Review collection name: "${collectionName}"`);
                return false;
            }

            const fullPathLength = (m: ModelManager) => {
                return m ? byteSize(m.dbName) + fullPathLength(m.parent) : 0;
            }

            //@see https://firebase.google.com/docs/firestore/storage-size#document-name-size            
            let totalLength = fullPathLength(model) + 16;

            for (let key of model.propsAsKeys) {
                const prop = model.getProp(key);
                const propName = prop['codeName'] || String(key);

                if (byteSize(propName) > 1_500) {
                    console.error(`Maximum size of a field name is 1,500 bytes. Review field name: "${propName}"`);
                    return false;
                }

                totalLength += byteSize(propName);
                switch (prop.propType) {
                    case 'string': {
                        if ('length' in prop) {
                            totalLength = prop.length;
                        }
                        else if ('max' in prop) {
                            totalLength = prop.max;
                        }
                        else {
                            console.error(`Property ${propName} in collection ${collectionName} has no limits. Use "max" or "length"`);
                            return false;
                        }
                        break;
                    }
                    case 'number':                  
                    case 'int': {
                        totalLength += 8;
                        break;
                    }
                    case 'boolean': {
                        totalLength += 1;
                        break;
                    }
    
                    default: {
                    }
                }
            }

            if (!model.getProp('id')) {
                //auto generated id length.
                totalLength += 20;
            }

            //@see https://firebase.google.com/docs/firestore/storage-size#document-size
            totalLength += 32
            if (totalLength > MIB) {
                console.error(`Total limits size of collection ${collectionName} is ${totalLength} bytes and exceeds firestore limit(max document size is 1 MIB.)`);
                return false;
            }
        }
        return true;
    }
}