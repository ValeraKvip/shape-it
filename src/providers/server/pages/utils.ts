import { ModelManager } from "../../../Schema";

export function getMediaCreate(model: ModelManager) {
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);

    if (!media?.length) {
        return '';
    }

    return `
        // Upload files.
        const uploads:(() => Promise<void>)[] = [];
        ${media.map(key => {
        const prop = model.props[key];
        if (prop.isArray) {
            return `
                if(${model.name}.${prop.codeName}Upload){
                    ${model.name}.${prop.codeName} = ${model.name}.${prop.codeName} || [];
                    ${model.name}.${prop.codeName}Upload.forEach(item=>
                        uploads.push(async()=>{
                            ${model.name}.${prop.codeName}!.push(await media.upload(item as File));
                        }));                        
                }               
                `;
        } else {
            return `
                if(${model.name}.${prop.codeName}Upload){
                    uploads.push(async()=>{
                        ${model.name}.${prop.codeName} = await media.upload(${model.name}.${prop.codeName}Upload as File);
                    });                        
                }`;
        }

    }).join('\n')}

        
        await Promise.all(uploads.map(upload=>upload()));
        // Files have been uploaded.     
        `
}


export function getMediaUpdate(model: ModelManager) {
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);

    if (!media?.length) {
        return '';
    }


    return `
        // Upload or delete files.
        const uploads:(() => Promise<void>)[] = [];
        const deletes: Promise<boolean>[] = [];
        ${media.map(key => {
        const prop = model.props[key];
        if (prop.isArray) {
            return `
                if(${model.name}.${prop.codeName}Upload){
                    ${model.name}.${prop.codeName} = ${model.name}.${prop.codeName} || [];
                    ${model.name}.${prop.codeName}Upload.forEach(item=>
                        uploads.push(async()=>{
                            ${model.name}.${prop.codeName}!.push(await media.upload(item as File));
                        }));                        
                }
                if(${model.name}.${prop.codeName}Delete){                    
                    ${model.name}.${prop.codeName}Delete.forEach(item=>
                        deletes.push( media.delete(item as string)));                        
                }        
                `;
        } else {
            return `
                if(${model.name}.${prop.codeName}Upload){
                    uploads.push(async()=>{
                        ${model.name}.${prop.codeName} = await media.upload(${model.name}.${prop.codeName}Upload as File);
                    });                        
                }
                if(${model.name}.${prop.codeName}Delete){
                    deletes.push(media.delete(${model.name}.${prop.codeName}Delete as string));                        
                }`;
        }

    }).join('\n')}

        
        await Promise.all(uploads.map(upload=>upload()));
        // Files have been uploaded.
        await Promise.all(deletes);
        // Files have been deleted.
        `
}

export function getMediaDelete(model: ModelManager) {
    const media = model.propsAsKeys.filter(key => model.props[key].needUpload);
    if (!media?.length) {
        return '';
    }

    return `
        //Delete related media.
         const deletes: Promise<boolean>[] = [];

         ${media.map(key => {
        const prop = model.props[key];
        if (prop.isArray) {
            return `
                    ${model.name}.${prop.codeName}.forEach(item=>{
                         deletes.push(media.delete(item));
                    });`
        } else {
            return `
                        deletes.push(media.delete( ${model.name}.${prop.codeName}));
                     `
        }
    }).join('\n')
        }


        await Promise.all(deletes);
        // All related uploads has been removed.
        `
}