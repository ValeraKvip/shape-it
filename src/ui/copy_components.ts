const fs = require('fs');
const path = require('path');
//const copyfiles = require('copyfiles');

export function copy_components() {
    const components = [
        './Array.svelte',
        './Drawer.svelte',
        './Dropzone.svelte',
        './LinkModel.svelte',
        './Table.svelte',
    ];

    const results = [];


    for(const component of components){
        const filePath = path.join(__dirname, component);

        try {
            const code = fs.readFileSync(filePath, 'utf8');
          

            results.push(  {
                code: code,
                path: `src/lib/components`,
                filename: component,
                formatter: 'svelte'
            });
        } catch (err) {
            console.error(`Error reading file: ${err}`);
        }
    }

    return results;
}