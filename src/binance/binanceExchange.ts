import BinanceStream from "./binanceStream";
import BinanceRest from "./binanceRest";
import {OrderCancelRequest, OrderCancelResponse, OrderRequest, OrderResponse} from "./binanceInterfaces";

export default class BinanceExchange {

    readonly klineStream$ = this.binanceStream.klineStream$;

    readonly userStream$ = this.binanceStream.userStream$;

    constructor(
        private readonly binanceRest: BinanceRest,
        private readonly binanceStream: BinanceStream,
    ) {
    }

    async newOrder(order: OrderRequest): Promise<OrderResponse> {
        return await this.binanceRest.newOrder(order);
    }

    async cancelOrder(order: OrderCancelRequest): Promise<OrderCancelResponse> {
        return await this.binanceRest.cancelOrder(order);
    }

    async testOrder(order: OrderRequest): Promise<void> {
        return await this.binanceRest.testOrder(order);
    }

}
