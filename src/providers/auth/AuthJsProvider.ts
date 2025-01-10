import ServerProvider from "../server/ServerProvider";
import AuthProvider from "./AuthProvider";

export default class AuthJsProvider implements AuthProvider {
    requirePackages(): string[] {
        return [
           // '@auth/sveltekit'
        ]
    }

    getImport(serverProvider: ServerProvider){
        return `export { handle } from "${serverProvider.getPathForAuth()}/auth"`
    }


    get_auth_ts() {
        return `
        import { SvelteKitAuth } from "@auth/sveltekit"
 
        export const { handle } = SvelteKitAuth({
        providers: [],
        })
        `
    }
}