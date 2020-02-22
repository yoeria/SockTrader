import {Order, OrderSide, OrderType} from "../../types/order";
import BaseCommand from "./baseCommand";
import config from "../../../../config";

export class ReleaseCommand extends BaseCommand {

    apply(order: Order): void {
        const {price, quantity, pair: [quote, base]} = order;
        if (order.side === OrderSide.BUY) {
            this.assets.addAsset(quote, quantity);
            this.reservedAssets.subtractAsset(base, price * quantity + this.calculateTradingFee(order));
        } else {
            this.assets.addAsset(base, price * quantity - this.calculateTradingFee(order));
            this.reservedAssets.subtractAsset(quote, quantity);
        }
    }

    calculateTradingFee(order: Order): number {
        const tradingFeePercentage = order.type === OrderType.MARKET ? config.exchanges.hitbtc.takerFee : config.exchanges.hitbtc.makerFee;
        return order.quantity * order.price * (tradingFeePercentage / 100);
    }

    revert(): void {
        throw new Error("Asset release cannot be reverted.");
    }
}
