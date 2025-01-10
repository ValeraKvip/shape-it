const fs = require('fs');
const path = require('path');


export function copy_styles() {
    const styles = [
        './admin.css',       
    ];

    const results = [];


    for(const style of styles){
        const filePath = path.join(__dirname, style);

        try {
            const code = fs.readFileSync(filePath, 'utf8');
          

            results.push(  {
                code: code,
                path: `src`,
                filename: style,
                formatter: 'css'
            });
        } catch (err) {
            console.error(`Error reading file: ${err}`);
        }
    }

    return results;
}