
import { DefaultDatabaseProvider } from "./providers/database/DefaultDatabaseProvider";
import { DefaultStyleProvider } from "./providers/style/DefaultStyleProvider";
import { $Number, $PropType, $String, propTypeTypescriptType } from "./PropTypes";
import { SveltekitProvider } from "./providers/server/SveltekitProvider";
import DatabaseProvider from "./providers/database/DatabaseProvider";
import ServerProvider from "./providers/server/ServerProvider";
import StyleProvider from "./providers/style/StyleProvider";
import { parseDisplayName } from "./utils";
import ValidatorProvider from "./providers/validator/ValidatorProvider";
import ZodValidator from "./providers/validator/ZodProvider";
import AuthProvider from "./providers/auth/AuthProvider";
import AuthJsProvider from "./providers/auth/AuthJsProvider";
const pluralize = require('pluralize');
const term = require('terminal-kit').terminal;


type SchemaBase = {
    $dbProvider: DatabaseProvider;
    $serverProvider: ServerProvider;//TODO remove it is only svelte is supported.
    $styleProvider: StyleProvider;
    $validatorProvider: ValidatorProvider;
    $authProvider: AuthProvider;
    /**
     * Specify whether to generate admin pages. True by default.
     */
    $generateAdminPages?: boolean;

     /**
     * Specify whether to generate API pages. True by default.
     */
     $generateAPI?: boolean;

    /**
    * Specify whether to generate a sitemap or not. If set to generate, a domain is required.
    */
    $sitemap?: {
        /**
         * App domain, such as 'https://svelte.dev.'
         * Any random domain can be used if the actual domain is not ready yet.
         */
        domain: string
        /**
        * maxAge - Cache header applied to the sitemap page. Default is same as sMaxAge.
        */
        maxAge?: number;
        /**
         * sMaxAge - Cache header applied to the sitemap page.
         */
        sMaxAge: number;
    };
    /**
     * Define the admin route; the default is 'admin'. Can't be empty.
     */
    $adminRoute: string;
    /**
     * Define the app route; the default is 'app'. Can be empty.
     */
    $appRoute: string;
    /**
     * Define the api route; the default is 'api'. Can't be empty.
     */
    $apiRoute: string;

    /**
     * Project title. This will be used in the documentation title and other related contexts. 
     */
    $title?: string;

    /**
    * Project description. This will be used in the documentation description and other related contexts. 
    */
    $description?: string;
}

export type Schema = SchemaBase & {
    [model: string]: Model;
}

export type RootModels = {
    [key: string]: ModelManager;
}

export type Sitemap = {
    exclude?: boolean,
    priority?: number,
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    lastmod?: boolean//TODO
}

export type Model = {
    /**
     * Whether to generate an API for this model. true by default.
     */
    $api?: boolean;//TODO generate api endpoints? true by default.
    $admin?: boolean;//TODO generate admin route? true by default.    
    /**
     * The model description will be used as a comment in the code and as a description in the documentation.
     */
    $description?: string;
    /**
     * Ignore for now
     */
    $dbName?: string;
    /**
     * By default, only the 'id' of linked models is displayed.
     * Use this property to define a custom display pattern.
     * Example:
     * $previewPattern:`#$id The "$name" by "$author.name" $price USD`
     */
    $previewPattern?: string,
    /**
     * Define a human-readable name, which by default is the same as the property name.
     */
    $displayName?: string;

     /**
     * Ignore for now
     */
    $queries?: {},

    /**
     * 
     */
    $id: {
        type: 'number' | 'uuid' | 'cuid' | 'string',
        autoIncrement?: boolean,
    },

     /**
     * Ignore for now
     */
    $derivatives?: {
        [key: string]: Model
    };
    $sitemap?: Sitemap
} & {
    [prop: string]: Prop
};

export type PropConstrains = {
    /**
     * The minimum string length or minimum number.
     */
    min?: number;
    /**
     * The maximum string length or maximum number.
     */
    max?: number;
    /**
     * Exact string length. For `type:'string'` only.
     */
    length?: number;
    /**
     * Whether to trim the string. For `type:'string'` only.
     */
    trim?: boolean;
    rule?: string;
    positive?: boolean;
    /**
     * The prop description will be used as a comment in the code and as a description in the documentation.
     */
    description?: string;
    /**
     * Whether the property is optional and may be null. All properties are required by default.
     */
    optional?: boolean;
    readonly?: boolean;
    /**
     * Step in HTML form input. For `type:'float'` and `type:'number'` types only. @see https://www.w3schools.com/tags/att_input_step.asp
     */
    step?: number; 
    /**
     * accept in HTML form input. For `type:'file'` an `type:'image'` only. @see https://www.w3schools.com/TAGS/att_input_accept.asp
     */
    accept?: string,
    options?: string[],
    /**
     * Define array constraints .Only if the property is declared as an array.
     */
    array?: {
        /**
         * Array max length.
         */
        max?: number;
        /**
         * Array max length.
         */
        min?: number;
        /**
         * Array exact length.
         */
        length?: number;
    },
    /**
     *  Whether to convert the string to lowercase.
     */
    toLowerCase?: boolean;
    /**
     * Whether to convert the string to uppercase.
     */
    toUpperCase?: boolean;
}
export type Prop = PropConstrains & {
    type: $PropType;

    /** Define a human-readable name, which by default is the same as the property name. */
    displayName?: string;
    /**Database column name */
    dbName?: string;
    /**How name used in scripts */
    codeName?: string;
    /**default value */
    defaultValue?: number | string | any[];//TODO find propr type and implement.
    displayAs?: DisplayAs,

}

type PropBase = {
    type: $PropType;
    rule?: string;
    description?: string;
    optional?: boolean;

}

type PropNumber = {
    type: $Number;
    min?: number;
    max?: number;
    positive?: boolean;//     > 0
    nonnegative?: boolean;//  >= 0
    negative?: boolean;//     < 0
    nonpositive?: boolean;//  <= 0
}

type PropString = {
    type: $String;
    min?: number;
    max?: number;
    length?: number;
    trim?: boolean;
    email?: boolean;
    url?: boolean;
    emoji?: boolean;
    uuid?: boolean;
    cuid?: boolean;
    cuid2?: boolean;
    ulid?: boolean;
    regex?: string;
    includes?: string;
    startsWith?: string;
    endsWith?: string;
    datetime: boolean;
    ip: boolean;
}

type DisplayAs = 'input' | 'textarea' | 'wisiwig' | 'toggle' | 'radio' | 'checkbox';//TODO step buttons for number.
//TODO slider

export class PropManager {
    public readonly model: ModelManager

    public constrains: PropConstrains;
    /**
    * Display name in Forms (e.g "breakBegin" => "Break begin")
    * By default splits camelCase or kebab-case or snake_case to word with white spaces.
    */
    public displayName: string;
    /**
     * Prop`s name in the database, column name(by default same as key)
     */
    public dbName: string;
    /**
     * The name of the prop in scripts.(by default same as key)
     */
    public codeName: string;
    /**
     * Default value for the prop.
     */
    public defaultValue: string;//TODO
    /**
   * Type as it declared in config.
   *  For example type for "Book[]" would be "Book[]", "int" would be "int"
   */
    public declaredType: string;//TODO
    /**
    * Prop type(name) may be primitive or points to another model.
    *  For example type for "Book[]" would be "Book", "int" would be "int", "int[]" would be "int"
    */
    public propType: $PropType;//TODO
    //public propTypeNonArray: $PropType;//TODO
    /**
   * Prop type(name) in typescript.
   * For example type for "Book[]" would be "Book[]", "int" would be "number","int[]" would be "number[]"
   */
    public tsType: string;//TODO
    /**
     * Prop description, displayed to the multiline comment.
     */
    public description: string;
    /**
     * Whether display as input or texteara or wisiwig  in form.
     */
    public displayAs: DisplayAs;

    /**
     * Is prop an array.
     */
    public isArray: boolean;



    /**
     * If type is not primitive and points to another model.
     */
    public isRefToAnotherModel: boolean;

    public refersToModel: ModelManager;

    public get required() {
        if (this.tsType === 'boolean') {
            return false;

        }
        return !this.constrains.optional;
    }

    public get needUpload() {
        return this.propType === 'file'
            || this.propType === 'files'
            || this.propType === 'image'
            || this.propType === 'images'
    }


    constructor(name: string, prop: Prop, model: ModelManager) {
        //this.prop = prop;
        this.model = model;

        const { type, displayName, codeName, dbName, defaultValue,
            description, displayAs, ...constrains } = prop;

        if (!type) {
            const error = `The 'type' of the property '${name}' is required to be declared.`;
            console.error(error);
            throw error;
        }

        this.declaredType = type.trim().replaceAll(' ', '');
        this.isArray = type.includes('[]');
        this.constrains = constrains;
        this.tsType = propTypeTypescriptType(type);
        // this.propType = this.declaredType as  $PropType;
        // this.propTypeNonArray = (this.isArray ? this.propType.replace('[]', '') : this.propType) as $PropType;
        this.propType = (this.isArray ? this.declaredType.replace('[]', '') : this.declaredType) as $PropType;
        this.displayName = displayName || parseDisplayName(name);
        this.codeName = codeName || name;
        this.dbName = dbName || name;


        if (this.tsType === 'File') {
            this.description = description || "Public path to the file"
        } else {
            this.description = description || `The property ${this.codeName} of the ${model.Name}`;
        }

        this.displayAs = displayAs || 'input';
        if (defaultValue) {
            if (this.tsType === 'string') {
                this.defaultValue = `'${defaultValue}'`;
            } else {
                this.defaultValue = String(defaultValue);
            }
        } else {
            this.defaultValue = this.getPropDefault(this);
        }

        // this.isRefToAnotherModel = false;
        // if (model.models[this.tsType]) {
        //     this.refersToModel = model.models[this.propType]
        //     this.isRefToAnotherModel = true;


        // }

       // this.fillUpWithDefaultConstrains();
    }

    // public connectRefs(){
    //     if (this.refersToModel.propsAsKeys.findIndex(key => this.refersToModel.propsAsKeys[key] == this.model.Name) === -1
    //             && this.refersToModel.propsAsKeys.findIndex(key => this.refersToModel.propsAsKeys[key] == this.model.name) === -1
    //             && this.refersToModel.propsAsKeys.findIndex(key => this.refersToModel.propsAsKeys[key] == this.model.Names) === -1
    //             && this.refersToModel.propsAsKeys.findIndex(key => this.refersToModel.propsAsKeys[key] == this.model.names) === -1) {
    //                 this.refersToModel.appendWithRef(this);
    //         }
    // }

    private getPropDefault(prop: PropManager): string {
        if (prop.isArray) {
            return "[]";
        }
        switch (prop.propType) {
            case "string":
            case "password":
            case "email":
            case "url":
            case "phone": {
                return "''";
            }
            case "number":
            case "int":
            case "float": {
                return String(prop.constrains.min || 0);
            }

            case "boolean": {
                return 'false';
            }

            case "select":
                return "''";
            case "enum":
                return '0';

            case "array":
                return '[]';

            case "file":
                return '[]'
            case "image":
                return '[]'
            default:
                return 'null';
        }
    }

    public fillUpWithDefaultConstrains() {
        const constrains = this.constrains;
        if (this.isArray) {
            if (!('array' in constrains) || (!('max' in constrains.array) && !('length' in constrains.array))) {
                constrains.array = constrains.array || {}
                constrains.array.max = 256;
                term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yThe maximum or exact length of the array is unspecified. The default size of ^b256 items ^yhas been applied. To override this, set the 'max' or 'length' property.`)
            }

            if (!('array' in constrains) || (('array' in constrains) && !('length' in constrains.array) && !('min' in constrains.array) && this.required)) {
                constrains.array = constrains.array || {}
                constrains.array.min = this.required? 1 : 0;
                term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yThe 'min' or exact 'length' of the array is unspecified, but array is required. The default size of ^bmin = 1 ^yhas been applied. To override this, set the 'min' or 'length' property.`)
            }

            //TODO check array min > max etc.
        }


        switch (this.propType) {
            case "email": {
                if (!('max' in constrains)) {
                    constrains.max = 256;
                    term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yMax email length is unspecified. The default value of ^b256 chars ^yhas been applied. Set the property 'max' to override.`)
                }
                if (!('min' in constrains)) {
                    constrains.min = 7;
                    term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yMin email length is unspecified. The default value of ^b7 chars ^yhas been applied. Set the property 'min' to override.`)
                }
                break;
            }
            case "string":
            case "password":
            case "url":
            case "phone": {
                return "''";
            }
            case "int":{
                if (!('max' in constrains)) {
                    constrains.max = Number.MAX_SAFE_INTEGER;                   
                }
                if (!('min' in constrains)) {
                    constrains.min = Number.MIN_SAFE_INTEGER;                   
                }
                return '';
            }
            case "number":           
            case "float": {                
                if (!('max' in constrains)) {
                    constrains.max = Number.MAX_VALUE;                   
                }
                if (!('min' in constrains)) {
                    constrains.min = Number.MIN_VALUE;                   
                }
                return '';
            }

            case "boolean": {
                return 'false';
            }
            case "date": {
                return 'new Date()';
            }

            case "array":
                return '[]';

            case "file":
            case "files": {
                if (!('max' in constrains)) {
                    constrains.max = 52_428_800;//50 MB
                    term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yMax file size is unspecified. The default value of ^b50 MB ^yhas been applied. Set the property 'max' to override.`)
                }

                break;
            }
            case "image":
            case "images": {
                if (!('max' in constrains)) {
                    constrains.max = 10_485_760;//10 MB
                    term(`\n^#^y WARN ^ ^b[${this.model.Name}.${this.codeName}]^: ^yMax image size is unspecified. The default value of ^b10 MB ^yhas been applied. Set the property 'max' to override.`)
                }

                break;
            }
            default:
                return 'null';
        }
    }
}


export class ModelManager {
    private model: Model;
    public models: RootModels;
    public readonly generateApi: boolean = true;
    public id: any;
    /**
     * Model`s description. Will be served as multiline comment ove interface head.
     */
    public description: string;
    /**
     * Model`s name in the database(by default same as key)
     */
    public dbName: string;
    /**
     * The name of the model started Lowercase. (e.g "book")
     */
    public name: string;
    /**
    * The name of the model started uppercase. (e.g "Book")
    */
    public Name: string;
    /**
    * The plural name of the model started Lowercase. (e.g "books")
    */
    public names: string;
    /**
    * The plural name of the model started Uppercase. (e.g "Books")
    */
    public Names: string;

    /**
     * The sitemap settings
     */
    public sitemap: Sitemap;

    /**
    * The original name is the same as declared in the configuration.
    */
    public originalName: string;
    /**
    * Display name in Forms (e.g "breakBegin" => "Break begin")
    * By default splits camelCase or CebabCase to word with white spaces.
    */
    public displayName: string;

    /**
     * All props except started with '$' sign.
     */
    public propsAsKeys: string[];

    /**
     * Type of the id. One of: string | number
     */
    public idType: string = 'undefined';

    /**
     * By default, only the 'id' of linked models is displayed.
     * Use this property to define a custom display pattern.
     * Example:
     * $previewPattern:`#$id The "$name" by "$author.name" $price USD`
     */
    public previewPattern: string;


    /**
     * Props that refers to other models.
     * **/
    private _refersToLinkedModelsCache: PropManager[] | null = null;


    public get refersToLinkedModels(): PropManager[] {
        if (!this._refersToLinkedModelsCache) {
            this._refersToLinkedModelsCache = this.propsAsKeys
                .filter(x => this.props[x].isRefToAnotherModel).map(x => this.props[x]) || [];
        }

        return this._refersToLinkedModelsCache
    }

    /**
     * Whether has props that are lins to other models
     * **/
    public get hasRefersToLinkedModel() {
        return this.refersToLinkedModels.length > 0;
    }

    public props: {
        [prop: string]: PropManager;
    } = {};

    public get enctype() {
        const filter = this.keysOmitId.filter(key => {
            return this.props[key].needUpload
        });

        if (filter.length) {
            return `enctype="multipart/form-data"`
        }

        return ''
    }

    public connectRefs() {

        this.propsAsKeys.forEach(key => {
            const prop = this.props[key];
            prop.isRefToAnotherModel = false;
            if (prop.model.models[prop.propType]) {
                prop.refersToModel = prop.model.models[prop.propType]
                prop.isRefToAnotherModel = true;
            }


            if (prop.isRefToAnotherModel
                && prop.refersToModel.propsAsKeys.findIndex(key => key == this.name) === -1
                && prop.refersToModel.propsAsKeys.findIndex(key => key == this.Name) === -1
                && prop.refersToModel.propsAsKeys.findIndex(key => key == this.names) === -1
                && prop.refersToModel.propsAsKeys.findIndex(key => key == this.Names) === -1) {
                prop.refersToModel.appendWithRef(prop, this);
            }
        });
    }

    public appendWithRef(ref: PropManager, refToModel: ModelManager) {
        term(`\n^#^y WARN ^ ^yYou have not provided a proper connection between models ^b[${refToModel.Name}.${ref.codeName}] ^yand ^b[${this.Name}.^r${refToModel.name}?^b]`)
            (`^y, so a default ^b${ref.isArray ? "many-to-one" : " one-to-one"} ^yconnection has been created.`)
            (`^yTo fix this, update model ^b${this.Name} ^yin the config in one of the following ways:\n`)
        if (ref.isArray) {
            term(`^gmany-to-one:\n`)
                (`^b${refToModel.Name} {\n   ${ref.codeName}: ${this.Name}[]\n}\n`)
                (`^b${this.Name}{\n   ${refToModel.name}: ${refToModel.Name}\n}\n`)
            term(`^g\nmany-to-many:\n`)
                (`^b${refToModel.Name} {\n   ${ref.codeName}: ${this.Name}[]\n}\n`)
                (`^b${this.Name}{\n   ${refToModel.names}: ${refToModel.Name}[]\n}\n`)
        } else {
            term(`^gone-to-one:\n`)
                (`^b${refToModel.Name} {\n   ${ref.codeName}: ${this.Name}\n}\n`)
                (`^b${this.Name}{\n   ${refToModel.name}: ${refToModel.Name}\n}\n`)
            term(`^g\one-to-many:\n`)
                (`^b${refToModel.Name} {\n   ${ref.codeName}: ${this.Name}\n}\n`)
                (`^b${this.Name}{\n   ${refToModel.names}: ${refToModel.Name}[]\n}\n`)
        }


        const prop = this.props[ref.model.name] = new PropManager(refToModel.name, {
            type: (refToModel.Name) as any,
            optional: !ref.required
        }, this);
        this.propsAsKeys.push(refToModel.name);
        prop.refersToModel = refToModel
        prop.isRefToAnotherModel = true;
    }

    public getProp(key: string) {
        return this.props[key];
    }


    //TODO remove.
    public get keysOmitId() {
        return this.propsAsKeys.filter(x => x !== 'id');
    }
    public readonly subCollections: RootModels = {};
    public readonly parent: ModelManager;
    constructor(model: Model, name: string, models: RootModels, parent?: ModelManager) {
        this.models = models;
        this.model = model;
        this.parent = parent;
        this.generateApi = model.$api || this.generateApi;
        this.description = model.$description || '';//TODO add default        
        this.originalName = name.trim();
        this.name = this.originalName[0].toLowerCase() + this.originalName.slice(1);
        this.Name = this.originalName[0].toUpperCase() + this.originalName.slice(1);
        this.displayName = model.$displayName || parseDisplayName(name);
        this.dbName = model.$dbName || this.name;
        //TODO use eng rules
        this.names = pluralize.plural(this.name);
        this.Names = pluralize.plural(this.Name);
        this.sitemap = {
            exclude: model.$sitemap?.exclude || false,
            priority: model.$sitemap?.priority,
            changefreq: model.$sitemap?.changefreq,
            lastmod: model.$sitemap?.lastmod
        }


        if (!model.$id) {
            const error = `$id unspecified, but required(${name})`;
            console.error(error);
            throw error;
        }

        if (!model.$id.type) {
            const error = `$id.type unspecified, but required(${name})`;
            console.error(error);
            throw error;
        }

        this.idType = model.$id.type === 'number' ? 'number' : 'string';

        this.propsAsKeys = Object.keys(model).filter(p => p[0] !== '$')
        this.propsAsKeys.forEach(key => {
            this.props[key] = new PropManager(key, this.model[key], this);
        });


        if (model.$previewPattern) {
            this.previewPattern = model.$previewPattern;
            this.propsAsKeys.forEach(key => {
                this.previewPattern = this.previewPattern.replaceAll(`$${key}`, `\${item.${key}}`)
            });
            this.previewPattern = this.previewPattern.replaceAll(`$id`, `\${item.id}`)
        }


        //`#$id The "$title" $price USD`
        //        format={(item:Book)=> `#${item.id} The "${item.title}" ${item.price} USD`}

        // if ('$derivatives' in model) {
        //     const derivatives = model.$derivatives;
        //     for (const der_key in derivatives) {
        //         const der = derivatives[der_key];
        //         const child = new ModelManager(der, der_key, this);
        //         this.subCollections[der_key] = (child);
        //     }
        // }

    }
}



export const defaultSchema: SchemaBase = {
    $serverProvider: new SveltekitProvider(),
    $dbProvider: new DefaultDatabaseProvider(),
    $styleProvider: new DefaultStyleProvider(),
    $validatorProvider: new ZodValidator(),
    $authProvider: new AuthJsProvider(),
    $generateAdminPages: true,
    $generateAPI:true,
    // $sitemap: {
    //     domain:null,
    //     maxAge:86400,
    //     sMaxAge:86400
    // },
    $adminRoute: "admin",
    $appRoute: "app",
    $apiRoute: 'api'
}