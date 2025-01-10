const crypto = require('crypto');
const detectInstalled = require('detect-installed')


export function multilineComment(comment: string, capitalizeFirst = true): string {
    comment = comment.trim();
    if (!comment.endsWith('.')) {
        comment += '.';
    }

    if (capitalizeFirst) {       
        comment = comment[0].toUpperCase() + comment.slice(1);
    }
   
    const chunks = comment.split(' ');
    comment = '*'
    let currentLen = 3;

    chunks.forEach(word => {
        if (word.length + currentLen + 1 <= 80) {
            comment += ` ${word}`;
            currentLen += word.length + 1;
        }
        else {
            comment += `\n* ${word}`;
            currentLen = word.length + 3;
        }
    });

    return `
    /**
    ${comment}
    */`
}

export function interfaceProperty(name: string, optional: boolean, type: string): string {
    const propOptional = optional ? '?' : '';
    return `${name}${propOptional}: ${type};`
}


export function isPackageInstalled(packageName: string): boolean {
    try {
        return detectInstalled.sync(packageName, { local: true });
    } catch (error) {
        return false;
    }
}

export function hashFile(file: string): string {
    return crypto.createHash('sha1')
        .update(file).digest('hex');
}

export class UniqueShortName {
    index: number = 0;
    usedNames: string[] = [];
    constructor(...names: string[]) {
        this.usedNames = names;
    }

    getUniqueName(): string {
        let name = '';
        let index = this.index++;
        while (index >= 0) {
            name = String.fromCharCode((index % 26) + 97) + name;
            index = Math.floor(index / 26) - 1;
        }


        if (this.usedNames.indexOf(name) > -1) {
            return this.getUniqueName();
        }
        return name;
    }
}


/**
 * Parse kebab-case or snake_case or camelCase to human readable seance like: "Uppercase other words".
 * @param input kebab-case or snake_case or camelCase word.
 * @returns  Human readable seance with white spaces.
 */
export function parseDisplayName(input: string): string {    
    const spacedInput = input.replace(/[-_]/g, ' ');
    
    const withSpaces = spacedInput
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); 


    const words = withSpaces.split(' ').map(word => word.trim().toLowerCase());
    
    if (words.length === 0) {
        return '';
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    return words.join(' ');
}


export function underscoreNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

export function commaNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export function capitalize(word: string) {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}