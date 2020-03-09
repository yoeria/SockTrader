import {Order, OrderSide, OrderType} from "../../types/order";
import BaseCommand from "./baseCommand";
import config from "../../../../config";

export class ReleaseCommand extends BaseCommand {

    apply(order: Order): void {
        const {price, quantity, pair: [quote, base]} = order;
        const loss = this.calculateTradingFee(order) + this.calculateSlippage(order);

        if (order.side === OrderSide.BUY) {
            this.assets.addAsset(quote, quantity);
            this.reservedAssets.subtractAsset(base, price * quantity + loss);
        } else {
            this.assets.addAsset(base, price * quantity - loss);
            this.reservedAssets.subtractAsset(quote, quantity);
        }
    }

    calculateTradingFee(order: Order): number {
        const tradingFeePercentage = order.type === OrderType.MARKET ? this.feeConfig.takerFee : this.feeConfig.makerFee;
        return order.quantity * order.price * (tradingFeePercentage / 100);
    }

    calculateSlippage(order: Order): number {
        const slippage = order.type === OrderType.MARKET ? config.slippage : 0.0;
        return order.quantity * order.price * (slippage / 100);
    }

    revert(): void {
        throw new Error("Asset release cannot be reverted.");
    }
}