import { ModelManager, PropManager, Schema } from "../../../../../../Schema";
import ServerProvider from "../../../../ServerProvider";



export function get_admin_models_model_page_svelte(schema:Schema, serverProvider: ServerProvider, model: ModelManager) {
    let form = '';
    let _import = '';
    let iframe = '';
    for (const key of model.propsAsKeys) {
        const prop: PropManager = model.props[key];
        const { constrains } = prop;

        let printRestrictions = '';
        printRestrictions += ['required', 'readonly', 'multiple'].filter(x => constrains[x]).join(' ') + ' ';
        printRestrictions += ['max', 'min', 'step', 'alt', 'accept'].filter(x => constrains[x]).map(x => `${x} = "${constrains[x]}"`).join(' ') + ' '

        let _input = '';
        let _error = `<div class="error">{form?.errors?.["${prop.codeName}"]}</div>`;
        



        if (prop.isRefToAnotherModel) {
            //type="hidden"

            let format = '';
            if (prop.refersToModel.previewPattern) {
                format = `format={(item:${prop.refersToModel.Name})=>\`${prop.refersToModel.previewPattern}\`}\n`
            }
            //TODO input must have a type(same as id)
           
            if (prop.isArray) {
                
                _input = `
                {#each ${model.name}.${prop.codeName} as item (item.id)}
                    <input  name="${prop.codeName}Ids" value={item.id} hidden />
                {/each}

                <LinkModel
                    path="/${schema.$adminRoute}/${model.models[prop.propType].names}"
                    max={${prop.isArray? constrains.array.max || constrains.array.length || 1: 1}}
                    title="Link ${prop.refersToModel.displayName} to ${model.displayName}"
                    ${format}
                    bind:selected={${model.name}.${prop.codeName}}>
                </LinkModel>
                `
                _error = `<div class="error">{form?.errors?.["${prop.codeName}Ids"]}</div>`;

            } else {
                _input = `
                <input  name="${prop.codeName}Id" value={${model.name}.${prop.codeName}?.id} hidden />
                
                <LinkModel
                    path="/${schema.$adminRoute}/${model.models[prop.propType].names}"                   
                    title="Link ${prop.refersToModel.displayName} to ${model.displayName}"
                    ${format}
                    bind:selected={${model.name}.${prop.codeName}}>
                </LinkModel>
                `
                _error = `<div class="error">{form?.errors?.["${prop.codeName}Id"]}</div>`;
            }


        }
        else if (prop.propType === 'string') {
            if (prop.displayAs === 'textarea') {
                printRestrictions = printRestrictions.replace('min', 'minlength').replace('max', 'maxlength')
            }

            if (prop.isArray) {
                if (prop.displayAs === 'input') {
                    _input = `                       
                        <input name="${prop.codeName}" type="text" bind:value={${model.name}.${prop.codeName}[index]} ${printRestrictions}/>                        
                   `
                } else if (prop.displayAs === 'textarea') {                    
                    _input = `                       
                        <textarea name="${prop.codeName}"  bind:value={${model.name}.${prop.codeName}[index]} ${printRestrictions}></textarea>                       
                    `
                } else {
                    //TODO implement WISIWIG
                }

                _input = `
                    <Array  bind:values={${model.name}.${prop.codeName}} max = {50}>
                        {#snippet input(index)}
                            ${_input}
                        {/snippet}
                    </Array>
                `
            } else {
                if (prop.displayAs === 'input') {
                    _input = `<input name="${prop.codeName}" type="text" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
                } else if (prop.displayAs === 'textarea') {
                    _input = `<textarea name="${prop.codeName}"  value={${model.name}.${prop.codeName}} ${printRestrictions}></textarea>`
                } else {
                    //TODO implement WISIWIG
                }
            }
        }
        else if (prop.propType === 'email') {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="email" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'password') {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="password" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'url') {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="url" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'number' || prop.propType === 'int' || prop.propType === 'float') {
            if (!printRestrictions.includes('step')) {
                if (prop.propType === 'float') {
                    printRestrictions += ' step="0.01" '
                } else {
                    printRestrictions += ' step="1" '
                }
            }

            if (prop.isArray) {
                _input = `
                    <Array  bind:values={${model.name}.${prop.codeName}} max = {50}>
                        {#snippet input(index)}
                            <input name="${prop.codeName}" type="number" bind:value={${model.name}.${prop.codeName}[index]} ${printRestrictions}/> 
                        {/snippet}
                    </Array>
                `
            } else {
                _input = `<input name="${prop.codeName}" type="number" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
            }
        }
        else if (prop.propType === 'file') {
            const multiple = prop.isArray ? `multiple={true}` : '';
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="file" ${multiple} value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'image') {            
            const accept = constrains.accept ? `accept={"${constrains.accept}"}` : '';
            const multiple = prop.isArray ? `multiple={true}` : '';
            const files = prop.isArray? `files={${model.name}.${prop.codeName}}` :  `files={[${model.name}.${prop.codeName}]}`;
            _input = `<Dropzone name={"${prop.codeName}"} ${files} ${accept} ${multiple}></Dropzone>`
        }
        else if (prop.propType === 'boolean') {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="checkbox" checked={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'date') {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="date" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }
        else if (prop.propType === 'select') {
            _input = `
                <select id="${prop.codeName}" name="${prop.codeName}" value={${model.name}.${prop.codeName}}>
                    ${prop.constrains.options.map(option => `<option value="${option}">${option}</option>`).join('\n')}                    
                </select>
                `
        }
        else if (prop.propType === 'enum') {
            let num = 0;
            _input = `
                <select id="${prop.codeName}" name="${prop.codeName}" value={${model.name}.${prop.codeName}}>
                    ${prop.constrains.options.map(option => `<option value="${++num}">${option}</option>`).join('\n')}                    
                </select>
                `
        }

        else {
            _input = `<input id="${prop.codeName}" name="${prop.codeName}" type="text" value={${model.name}.${prop.codeName}} ${printRestrictions}/>`
        }


        const _required = prop.required ? '<sup>*</sup>' : '';


        form += `
              <div>
                  <label for="${prop.codeName}">
                        ${prop.displayName}${_required}                       
                  </label>
                  ${_input}
                  ${_error}
              </div>           
              `
    }


    return `
    <script lang="ts">
        import { enhance } from '$app/forms';
        import { goto } from '$app/navigation';
        import { page } from '$app/stores';
        import { onMount, type Snippet } from 'svelte';
        import type { ActionData } from './$types.js';
        import type { ${model.Name} } from '$lib/models/${model.Name}';
        import Drawer from '$lib/components/Drawer.svelte';
        ${_import}
        ${model.refersToLinkedModels.map(x => `import type {${x.propType}} from '$lib/models/${x.refersToModel.Name}'`).join('\n')}
        ${model.hasRefersToLinkedModel ? "import LinkModel from '$lib/components/LinkModel.svelte';\n" : ''}
        ${model.propsAsKeys.findIndex(x => model.props[x].isArray) >= 0 ? "import Array from '$lib/components/Array.svelte';\n" : ''}
        ${model.propsAsKeys.findIndex(x => model.props[x].needUpload) >= 0 ? "import Dropzone from '$lib/components/Dropzone.svelte';" : ''}
        
      

        type Props = {
            data: {
            ${model.names} : ${model.Name}[];
            ${model.name} : ${model.Name};
            };
            children: Snippet;
            form:ActionData
        };

        let { data, form } : Props = $props();
        const isCreateMode = $derived($page.params.${model.name} === 'create');

        let ${model.name} : ${model.Name} = $state(getDefault(data.${model.name}));
        $effect(()=>{           
            ${model.name} =  isCreateMode? getDefault(): getDefault(data.${model.name});          
        });
              
        $inspect(${model.name})
       
        

        let deleteButtonRef: HTMLButtonElement;
        let updateButtonRef: HTMLButtonElement;

        function getDefault(${model.name}?:${model.Name}){
            const _default = {
                ${model.propsAsKeys.map(key => `${key} : ${model.props[key].defaultValue}`).join(',\n')} 
            }

            if(${model.name}){
                return {..._default,...${model.name}};
            }

            return _default;
        }

        async function submitDelete() {
            deleteButtonRef.click();
        }

        async function submitUpdate() {
            updateButtonRef.click();
        }

        async function onCancel() {
            //TODO ask to save changes.
            goto('/${schema.$adminRoute}/${model.names}');
        }

        function onBeforeUnload(){
        }



        onMount(()=>{
            window.addEventListener('beforeunload', onBeforeUnload);           

            return ()=>{
                window.removeEventListener('beforeunload', onBeforeUnload);               
            }
        })
    </script>

    {#snippet drawForm()}
        <form 
            method="POST"
            ${model.enctype}               
            action={isCreateMode ? '?/create':'?/update'} use:enhance={()=>{
                return async({update, result})=>{
                    await update();
                    if (result.type === 'success') {
                        data.${model.names}.push(result.data);
                        goto('/${schema.$adminRoute}/${model.names}');
                    }else{
                        //TODO show error
                    }                        
                };
            }}
        > 

            {#if !isCreateMode}
                <div>
                    <label for="id">
                        id                            
                    </label>
                    <input name="id" type="text" value={${model.name}.id} readonly/>
                </div>                  
            {/if}

            ${form}     
                        
            <button bind:this={updateButtonRef} type="submit" hidden>Create</button>            
        </form>
    {/snippet}

    <Drawer {drawForm} title={'${model.Name}'} {submitDelete} {submitUpdate} {onCancel} {isCreateMode}></Drawer>
   ${iframe}
 

    {#if form?.error}
        <div class="error">{form.error}</div>
    {/if}

    <form
        hidden
        method="POST"
        action="?/delete"
            use:enhance={() => {
                return async ({ update, result }) => {
                    await update();
                    if (result.type === 'success') {       
                        data.${model.names} = data.${model.names}.filter(x=>x.id === ${model.name}.id);
                         goto('/${schema.$adminRoute}/${model.names}');
                    }else{
                        //TODO show error.
                    }					
                };
            }}
        >

        <input type="hidden" name="id" value={${model.name}.id} />		
        <button type="submit" bind:this={deleteButtonRef}>Delete</button>
    </form>

    <style>
        .error{
            color:red;
            padding:5px;
        }
    </style>
    `
}


function wrapArray(input: string) {
    return `
    <div class="space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">

    </div>
    `
}