/**
 * Admin website style provider.
 */
export default interface StyleProvider {
    /**
     * Return required imports(like fonts) to be placed inside <head> tag.
     */
    getCSSImports():string;

    /**
     * Return light theme css style for form HTML elements.
     */
    getDarkThemeStyle():string;

    /**
     * Return light theme css style for form HTML elements.
     */
    getLightThemeStyle():string;
}