import { Model, ModelManager } from "../../Schema";

export default interface SeedDataProvider{
    seed(model:ModelManager, count:number);
}