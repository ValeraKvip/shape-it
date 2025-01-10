//TODO have to remove flowbite.min.css

import { ModelManager, RootModels, Schema } from "../../../../Schema";
import ServerProvider from "../../ServerProvider";


//TODO app.css shouldn't be imported here.
function get_app_layout_svelte(schema:Schema,serverProvider: ServerProvider, models: RootModels) {
 


    return `
    <script>
    let { children } = $props();
    </script>

    {@render children()}
 `
}

export { get_app_layout_svelte };