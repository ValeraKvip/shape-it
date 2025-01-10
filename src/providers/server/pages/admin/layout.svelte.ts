//TODO have to remove flowbite.min.css

import { ModelManager, RootModels, Schema } from "../../../../Schema";
import ServerProvider from "../../ServerProvider";


//TODO app.css shouldn't be imported here.
function get_admin_layout_svelte(schema:Schema,serverProvider: ServerProvider, models: RootModels) {
    let _links = '';

    for (const key in models) {
        const model = models[key];
        _links += `
            <li>
                <a href="/${schema.$adminRoute}/${model.names}" >           
                    ${model.Names}
                </a>
            </li>      
        `
    }


    return `
    <script>   
    import '../../admin.css';   

    let { children } = $props();
    </script>

        <header>                    
            <ul>
                ${_links}                    
            </ul>       
        </header>

    {@render children()}

  



    <svelte:head>
    <link
        href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css"
        rel="stylesheet"
    />
    </svelte:head>


    <style>
        header{
            z-index: 40;
            overflow-y: auto;
            transition: transform;
            width: 100%;
            background-color: #1f2937;
        }
        ul{
            margin-right: 0.5rem;
            font-weight: 500;
            display: flex;
        }
        li {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            color: #1a202c;
            border-radius: 0.5rem;
            color: #ffffff;
            margin:0;
        }
        a{
            padding: 2px;    
        }
        a:hover {
            color: rgb(22 163 74);
        }
    </style>
    
 `
}

export { get_admin_layout_svelte };