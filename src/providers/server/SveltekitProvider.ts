import { ModelManager, Prop, PropManager, RootModels, Schema } from "../../Schema";
import ServerProvider from "./ServerProvider";
import { get_admin_layout_svelte } from './pages/admin/layout.svelte';
import { get_admin_models_layout_server } from "./pages/admin/models/layout.server";
import { get_admin_models_layout_svelte } from "./pages/admin/models/layout.svelte";
import { get_admin_models_model_page_server } from "./pages/admin/models/model/page.server";
import { get_admin_models_model_page_svelte } from "./pages/admin/models/model/page.svelte";
import { get_admin_models_page_server } from "./pages/admin/models/page.server";
import { get_admin_models_page } from "./pages/admin/models/page.svelte";
import { get_api_model_id_server } from "./pages/api/model/id/server";
import { get_api_model_server } from "./pages/api/model/server";
import { get_api_models_server } from "./pages/api/models/server";
import { get_swagger_docs } from "./pages/api/swagger";
import { get_app_layout_svelte } from "./pages/app/layout.svelte";
import { get_app_models_model_page_server } from "./pages/app/models/model/page.server";
import { get_app_models_model_page_svelte } from "./pages/app/models/model/page.svelte";
import { get_app_models_page_server } from "./pages/app/models/page.server";
import { get_app_models_page_svelte } from "./pages/app/models/page.svelte";
import { get_app_page_svelte } from "./pages/app/page.svelte";
import { get_hooks_server } from "./pages/hooks.server";
import { get_sitemap } from "./pages/sitemap";


export class SveltekitProvider implements ServerProvider {


    getImportPathForModels(): string {
        return "$lib/models";
    }
    getDatabaseImport(): string {
        return `import {database} from "$lib/database"`;
    }
    getPathForModels(): string {
        return "src/lib/models";
    }
    getPathForDatabase(): string {
        return "src/lib";
    }
    getPathForAuth(): string {
        return "src/lib";
    }
    requirePackages(): string[] {
        return []
    }

    generateSitemap(schema: Schema, models: RootModels) {
        return {
            code: get_sitemap(schema, models),
            path: `src/routes/sitemap.xml`,
            filename: '+server.ts',
            formatter: 'typescript'
        }

    }

    processModels(schema: Schema, models: RootModels) {
        return [
            //hooks.server
            {
                code: get_hooks_server(schema, this, models),
                path: `src`,
                filename: 'hooks.server.ts',
                formatter: 'typescript'
            },
            //admin
            {
                code: get_admin_layout_svelte(schema, this, models),
                path: `src/routes/${schema.$adminRoute}`,
                filename: '+layout.svelte',
                formatter: 'svelte'
            },
            {
                code: '',
                path: `src/routes/${schema.$adminRoute}`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },

            //app
            {
                code: get_app_layout_svelte(schema, this, models),
                path: `src/routes/${schema.$appRoute}`,
                filename: '+layout.svelte',
                formatter: 'svelte'
            },
            {
                code: get_app_page_svelte(schema, this, models),
                path: `src/routes/${schema.$appRoute}`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },

            //docs
            {
                code: get_swagger_docs(schema, this, models),
                path: `docs`,
                filename: 'swagger.json',
                formatter: 'json'
            },

        ]
    }


    processModel(schema: Schema, model: ModelManager) {
        return [
            // {
            //     code: get_admin_layout_svelte(this, model),
            //     path: `src/routes/admin`,
            //     filename: '+layout.svelte',
            //     formatter: 'svelte'
            // },
            // {
            //     code: '',
            //     path: `src/routes/admin`,
            //     filename: '+page.svelte',
            //     formatter: 'svelte'
            // },

            //admin
            {
                code: get_admin_models_model_page_svelte(schema, this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}/[${model.name}]`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },
            {
                code: get_admin_models_model_page_server(this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}/[${model.name}]`,
                filename: '+page.server.ts',
                formatter: 'typescript'
            },
            {
                code: get_admin_models_page(this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },
            {
                code: get_admin_models_layout_svelte(schema, this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}`,
                filename: '+layout.svelte',
                formatter: 'svelte'
            },
            {
                code: get_admin_models_page_server(this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}`,
                filename: '+page.server.ts',
                formatter: 'typescript'
            },
            {
                code: get_admin_models_layout_server(this, model),
                path: `src/routes/${schema.$adminRoute}/${model.names}`,
                filename: '+layout.server.ts',
                formatter: 'typescript'
            },


            //app
            {
                code: get_app_models_page_svelte(schema, this, model),
                path: `src/routes/${schema.$appRoute}/${model.names}`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },
            {
                code: get_app_models_page_server(this, model),
                path: `src/routes/${schema.$appRoute}/${model.names}`,
                filename: '+page.server.ts',
                formatter: 'typescript'
            },

            {
                code: get_app_models_model_page_svelte(schema, this, model),
                path: `src/routes/${schema.$appRoute}/${model.names}/[${model.name}]`,
                filename: '+page.svelte',
                formatter: 'svelte'
            },
            {
                code: get_app_models_model_page_server(this, model),
                path: `src/routes/${schema.$appRoute}/${model.names}/[${model.name}]`,
                filename: '+page.server.ts',
                formatter: 'typescript'
            },

            //api
            {
                code: get_api_models_server(schema, this, model),
                path: `src/routes/${schema.$apiRoute}/${model.names}`,
                filename: '+server.ts',
                formatter: 'typescript'
            },
            {
                code: get_api_model_server(schema, this, model),
                path: `src/routes/${schema.$apiRoute}/${model.names}/${model.name}`,
                filename: '+server.ts',
                formatter: 'typescript'
            },
            {
                code: get_api_model_id_server(schema, this, model),
                path: `src/routes/${schema.$apiRoute}/${model.names}/${model.name}/[id]`,
                filename: '+server.ts',
                formatter: 'typescript'
            },
        ];
    }
}