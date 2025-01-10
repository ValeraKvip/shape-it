export default interface AuthProvider {
    /**
     * All dependencies required by Auth provider.
     * @returns array of required npm packages.
     */
    requirePackages: () => string[];

    get_auth_ts(): string;
}