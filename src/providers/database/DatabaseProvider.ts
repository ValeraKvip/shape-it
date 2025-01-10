//TODO add good docs and comments!!!
import { ModelManager, Schema } from "../../Schema";



export default interface DatabaseProvider{
  autoGenerateShortDbNames: boolean;
  /**
   * All dependencies used by database are defined here.
   * @returns array of required npm packages.
   */
  requirePackages: () => string[];

  /**
   * Initialize database.
   * !IMPORTANT Remember to input: db.db = your_db_instance;
   * @returns database initializations script
   */
  init: () => string;

  /**
   * Import database dependencies
   * @returns required npm package imports for database.
   */
  getImports: () => string;

  /**
   * Prints "add" to database logic.
   * The param "data" - is an object that will be added.
   * @param type model type(model name)
   * @param model to be inserted
   * @param schema current data schema.
   * @param options ...
   * @returns add model to database logic script.
   */
  addModel: (type: string, model: any, schema: any, options?: any) => string

  /**
   * Prints "add multiple" to database logic.
   * The param "data" - is an array of object that will be added.
   * @param type model type(model name)
   * @param model to be inserted
   * @param schema current data schema.
   * @param options ...
   * @returns add multiple models to database logic script.
   */
  addModels: (type: string, model: any, schema: any, options?: any) => string

  /**
  * Prints "delete" from database logic.
  * The param "data" - is an object that will be deleted.
  * @param type model type(model name)
  * @param model to be inserted
  * @param schema current data schema.
  * @param options ...
  * @returns add multiple models to database logic script.
  */
  deleteModel: (type: string, model: any, schema: any, options?: any) => string

  //TODO
  getModel: (type: string, model: any, schema: any, options?: any) => string
  //TODO
  getModels: (type: string, model: any, schema: any, options?: any) => string
  //TODO
  updateModel: (type: string, model: any, schema: any, options?: any) => string

  //TODO
  listModels: (type: string, model: any, schema: any, options?: any) => string

  listSlugs: (type: string, model: any, schema: any, options?: any) => string

  /**
   * Called before generating any file. Used to checkout user schema is valid 
   * for current database.
   * @param models 
   * @param schema 
   * @returns true - to continue; false - stop generating and exit.
   */
  checkSchema?: (models: { [model: string]: ModelManager }, schema: Schema) => boolean;

  /**
  * Requested before generating any file.
  * @param models 
  * @param schema 
  * @returns true - to continue; false - stop generating and exit.
  */
  preShape?: (models: { [model: string]: ModelManager }, schema: Schema) => boolean;


  /**
   * Requested in class body. Used for function or props creation.
   * @param models 
   * @param schema 
   * @returns code to be inserted in class body.
   */
  classBody?: (models: { [model: string]: ModelManager }, schema: Schema) => string;
}