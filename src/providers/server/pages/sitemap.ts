import { RootModels, Schema } from "../../../Schema"

export function get_sitemap(schema: Schema, models: RootModels) {
    const keys = Object.keys(models).filter(key => !models[key].sitemap.exclude);
    return `
    import { database } from '$lib/database';

    /** @type {import('./$types').RequestHandler} */
    export async function GET({ url }) {
        const body = await sitemap();
        const response = new Response(body);
        response.headers.set('Cache-Control', 'max-age=${schema.$sitemap.maxAge || schema.$sitemap.sMaxAge}, s-maxage=${schema.$sitemap.sMaxAge}');
        response.headers.set('Content-Type', 'application/xml');
        return response;
    }

    async function sitemap() 
    {
    const [${keys.map(key => `${models[key].names}`).join(',')}] = 
    await Promise.all([
        ${keys.map(key => `database.slug${models[key].Names}()`).join(',')}
    
    ]);

    
        return \`<?xml version="1.0" encoding="UTF-8" ?>
            <urlset
            xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
            xmlns:xhtml="https://www.w3.org/1999/xhtml"
            xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="https://www.google.com/schemas/sitemap-video/1.1">
            ${keys.map(key => {
                let _priority = '';
                let _changefreq = '';
                if(models[key].sitemap.priority){
                    _priority = ` <priority>${models[key].sitemap.priority}</priority>`;
                }

                if(models[key].sitemap.changefreq){
                    _changefreq = ` <changefreq>${models[key].sitemap.changefreq}</changefreq>`;
                }


            return `
                    \${
                        ${models[key].names}.map((page) => \`
                        <url>
                            <loc>${schema.$sitemap.domain}/${models[key].names}/\${page}</loc>
                            ${_priority}
                            ${_changefreq}
                            </url>
                        \`
                        ).join('')
                    }
                    `;
            }).join('')}
            
            </urlset>\`;
    }
    `
}