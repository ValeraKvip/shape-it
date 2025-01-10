//TODO have to remove flowbite.min.css

import { ModelManager, RootModels, Schema } from "../../../../Schema";
import ServerProvider from "../../ServerProvider";


//TODO app.css shouldn't be imported here.
function get_app_page_svelte(schema: Schema, serverProvider: ServerProvider, models: RootModels) {

    let _links = '';

    for (const key in models) {
        const model = models[key];
        _links += `
            <li>
                <a href="/${schema.$appRoute}/${model.names}" >           
                    ${model.Names}
                </a>
            </li>      
        `
    }


    return `
    <script>
  
    </script>

     <ul>
        ${_links}                    
     </ul>    
 `
}

export { get_app_page_svelte };