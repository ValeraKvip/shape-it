import { ModelManager, PropManager, RootModels } from "../../Schema";

/**
 * forms input validation.
 */
export default interface ValidatorProvider {
      /**
   * All dependencies used by validator are defined here.
   * @returns array of required npm packages.
   */
  requirePackages: () => string[];

    /**
     * Return required import. Example: import x from '...';
     */
    _import_(): string;


    /**
     * Return validation body to property. Example:
     * name: _validate_();
     */
    _validate_(models:RootModels, model:ModelManager, prop:PropManager): string;

    /**
     * Return validation body for whole object.    
     * Example: 
     * Joi.object({ content}); // Joi.
     * z.object({ content });  // Zod.
     */
    _wrap_(content:string): string;

}