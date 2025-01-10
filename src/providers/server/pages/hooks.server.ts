import { ModelManager, RootModels, Schema } from "../../../Schema";
import ServerProvider from "../ServerProvider";


export function get_hooks_server(schema:Schema,serverProvider: ServerProvider, models: RootModels) {

    let _api = '';

    if(schema.$generateAPI){
        _api = `
            // Apply CORS header for API routes
            if (event.url.pathname.startsWith('/${schema.$apiRoute}')) {
                // Required for CORS to work
                if(event.request.method === 'OPTIONS') {
                    return new Response(null, {
                        headers: {
                            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*'
                        }
                    });
                }
            }
        `;
    }


    let _admin1 = '';
    let _admin2 = '';
    if(schema.$generateAdminPages){
        _admin1 = `
            import { ADMINS } from '$env/static/private';

            type AuthUser = {
                username: string;
                password: string;
            };

            const users: AuthUser[] = JSON.parse(ADMINS);
        `;

        _admin2 = `
            if (url.pathname.startsWith("/${schema.$adminRoute}")) {
                const authorization = event.request.headers.get('Authorization');

                if (!authorization || !authorization.startsWith('Basic '))
                    return new Response('Unauthorized', {
                        status: 401,
                        headers: {
                            'WWW-Authenticate': 'Basic realm="Protected"',
                        },
                    });

                const token = authorization.replace('Basic ', '');

                const [username, password] = Buffer.from(token, 'base64')
                    .toString()
                    .split(':');

                const user: AuthUser | undefined = users.find(
                    (u) => u.username === username && u.password === password,
                );

                if (!user)
                    return new Response('Unauthorized', {
                        status: 401,
                        headers: {
                            'WWW-Authenticate': 'Basic realm="Protected"',
                        },
                    });

                event.locals.user = {
                    username: user.username,
                };
            }
        `
    }

    return `
        import type { Handle } from '@sveltejs/kit';
   
        ${_admin1}
        export const handle: Handle = ({ event, resolve }) => {
            const url = new URL(event.request.url);
            
            ${_admin2}
            ${_api}


            return resolve(event);
        };
 `
}

