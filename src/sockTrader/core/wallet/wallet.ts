import Events from "../events";
import {Order, OrderSide} from "../types/order";
import {AssetMap} from "../types/wallet";
import {AssetCollection} from "./assetCollection";
import {ReleaseCommand} from "./command/releaseCommand";
import {ReserveCommand} from "./command/reserveCommand";
import {isCanceled, isFilled, isNew, isReplaced} from "../utils/order";
import {FeeConfig} from "../types/feeConfig";

/**
 * The wallet keeps track of all assets
 */
export default class Wallet {

    private readonly assets: AssetCollection;
    private readonly reservedAssets: AssetCollection;
    private readonly feeConfig: FeeConfig;

    constructor(assets: AssetMap, feeConfig: FeeConfig) {
        this.assets = new AssetCollection(assets);
        this.reservedAssets = new AssetCollection({});
        this.feeConfig = feeConfig;
        this.emitUpdate();
    }

    /**
     * Validates if the wallet has sufficient funds to cover the given order.
     * @param order
     */
    isOrderAllowed(order: Order): boolean {
        return order.side === OrderSide.BUY ? this.assets.isBuyAllowed(order) : this.assets.isSellAllowed(order);
    }

    private emitUpdate() {
        return Events.emit("core.updateAssets", this.assets.getAssets(), this.reservedAssets.getAssets());
    }

    /**
     * Updates the assets on the exchange for given new order
     * @param {Order} order new order
     * @param {Order} oldOrder old order
     */
    updateAssets(order: Order, oldOrder?: Order) {
        if (isReplaced(order) && oldOrder) {
            new ReserveCommand(this.assets, this.reservedAssets, this.feeConfig).revert(oldOrder);
            new ReserveCommand(this.assets, this.reservedAssets, this.feeConfig).apply(order);
            this.emitUpdate();
        } else if (isNew(order)) {
            new ReserveCommand(this.assets, this.reservedAssets, this.feeConfig).apply(order);
            this.emitUpdate();
        } else if (isFilled(order)) {
            // @TODO what if order is partially filled?
            new ReleaseCommand(this.assets, this.reservedAssets, this.feeConfig).apply(order);
            this.emitUpdate();
        } else if (isCanceled(order)) {
            new ReserveCommand(this.assets, this.reservedAssets, this.feeConfig).revert(order);
            this.emitUpdate();
        }
    }
}
