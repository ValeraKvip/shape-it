export default interface ProviderPreprocessor {
    __fileStart__(): string;

    __beforeImport__(): string;
    __afterImport__(): string;

    __beforeClass__(): string;
    __beforeFields__(): string;
    __afterFields__(): string;
    __beforeProps__(): string;
    __afterProps__(): string;
    __beforeConstructor__(): string;
    __afterConstructor__(): string;
    __beforeFunctions__(): string;
    __afterFunctions__(): string;
    __afterClass__(): string;

    __fileEnd__(): string;
}

/**EXAMPLE
 
 //x.ts
__fileStart__();

__beforeImport__();
import x from 'x';
import y from 'y';
__afterImport__();


__beforeClass__();
class X {
    __beforeFields__();
    x = 1;
    ...
    __afterFields__();

    __beforeProps__();
    get x(){
        return '';
    }
    ...
    __afterProps__();

    __beforeConstructor__();
    constructor(){
        ...
    }
    __afterConstructor__();

    __beforeFunctions__();
    x(){
        ...
    }
    __afterFunctions__();
}
__afterClass__();

__fileEnd__();
 */

