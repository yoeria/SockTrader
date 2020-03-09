import {Order} from "../../types/order";
import {AssetCollection} from "../assetCollection";
import {FeeConfig} from "../../types/feeConfig";

export default abstract class BaseCommand {

    abstract apply(order: Order): void;

    abstract revert(order: Order): void;

    constructor(protected assets: AssetCollection, protected reservedAssets: AssetCollection, protected feeConfig: FeeConfig) {
    }
}
