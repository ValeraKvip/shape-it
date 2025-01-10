export type $String = 'string' | 'password' | 'email' | 'url' | 'phone'; //TODO  | 'phone'| 'crypto' | 'credit-card' | 'pin-code' | 'regex';
export type $Number = 'number' | 'int' | 'float';//TODO bigint and all types of prisma
export type $Boolean = 'boolean';

export type $Flag = 'flag'; //TODO
export type Select = 'select' | 'enum'; //TODO
export type $File = 'file' | 'image' | 'files' | 'images'; //TODO
export type $Date = 'date';
export type $Array = 'array' | 'string[]' | 'password[]' | 'email[]' | 'url[]' | 'phone[]'
|  'number[]' | 'int[]'  | 'float[]'
| 'boolean[]' | 'flag[]' | 'select[]'
 | 'enum[]' | 'file[]' | 'image[]' | 'files[]' | 'images[]'| 'date[]';
//TODO file input

export type $PropType = $String | $Number | $Boolean | $Array | $Flag | Select | $File | $Date;

export function propTypeToHtmlInputType(propType: $PropType): string {

    switch (propType) {
        case 'number':
        case 'int':      
        case 'float':
            return 'number';
        case 'boolean':
            return 'checkbox';    
        case "string":
            return 'text';
        case "image":
            return 'file';
        case "file":
            return 'file';
        case "password":
            return 'password';
        case "email":
            return 'email';
        case "url":
            return 'url';
        case "phone":
            return 'tel';
        case "date":
            return 'date';
        default:
            return 'text';
    }
}

export function propTypeTypescriptType(propType: $PropType): string {

    switch (propType) {
        case 'number':
        case 'int':     
        case 'float':
            return 'number';
        case 'boolean':
            return 'boolean';
        case "string":
        case "password":
        case "email":
        case "url":
        case "phone":
            return 'string';
        case 'flag':
            return 'number';
        case 'file':
            return 'File';
        case 'image':
            return 'File';
        case 'select':
            return 'string';
        case 'enum':
            return 'number';
        case 'date':
            return 'Date';

        case 'number[]':
        case 'int[]':       
        case 'float[]':
            return 'number[]';
        case 'boolean[]':
            return 'boolean[]';     
        case "string[]":
        case "password[]":
        case "email[]":
        case "url[]":
        case "phone[]":
            return 'string[]';
        case 'flag[]':
            return 'number[]';
        case 'file[]':
            return 'File[]';
        case 'image[]':
            return 'File[]';
        case 'select[]':
            return 'string[]';
        case 'enum[]':
            return 'number[]';
        case 'date[]':
            return 'Date[]';
        default:
            return propType;
    }
}

export function isPrimitiveType(propType: string): boolean {

    switch (propType) {
        case 'number':
        case 'int':      
        case 'float':
        case 'boolean':      
        case "string":
        case "password":
        case "email":
        case "url":
        case "phone":
        case 'flag':
        case 'file':
        case 'image':
        case 'select':
        case 'enum':
        case 'date':
            return true;
        default:
            return false;
    }
}