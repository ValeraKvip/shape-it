export default interface MediaProvider{
    requirePackages: () => string[];

    uploadFile()
}