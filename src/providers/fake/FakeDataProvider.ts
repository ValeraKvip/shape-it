import { ModelManager } from "../../Schema";
import SeedDataProvider from "./SeedDataProvider";

export default class FakeDataProvider implements SeedDataProvider{
    
    seed(model: ModelManager, count: number) {
        throw new Error("Method not implemented.");
    }

}