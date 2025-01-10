import { ModelManager } from "../../../../../Schema";
import ServerProvider from "../../../ServerProvider";

export function get_admin_models_page(serverProvider: ServerProvider, model: ModelManager) {
    return `
        <script lang="ts">
            import { goto } from '$app/navigation';
            import { page } from '$app/stores';
        </script>      
        `
}