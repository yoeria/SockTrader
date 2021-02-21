import {CandleEvent, DataStream, ExchangeOptions, OrderHandler, OrderReportEvent} from "./exchangeInterfaces";
import {Observable} from "rxjs";
import {OrderCancelRequest, OrderRequest, OrderType} from "./orderInterfaces";

export default class Exchange<E extends ExchangeOptions> implements OrderHandler, DataStream<E> {

    readonly candleStream$: Observable<CandleEvent<E>> = this.dataStream.candleStream$;
    readonly orderReport$: Observable<OrderReportEvent> = this.orderHandler.orderReport$;

    constructor(
        private readonly orderHandler: OrderHandler,
        private readonly dataStream: DataStream<E>,
    ) {
    }

    isOrderTypeSupported = (order: OrderRequest): boolean => {
        switch (order.type) {
            case OrderType.limit:
            case OrderType.market:
                return true;
            default:
                return false;
        }
    };

    async createOrder(order: OrderRequest): Promise<void> {
        if (this.isOrderTypeSupported(order)) {
            await this.orderHandler.createOrder(order);
        }
    }

    async createMarginOrder(order: OrderRequest): Promise<void> {
        if (this.isOrderTypeSupported(order)) {
            await this.orderHandler.createMarginOrder(order);
        }
    }

    async cancelOrder(order: OrderCancelRequest): Promise<void> {
        await this.orderHandler.cancelOrder(order);
    }

    async cancelMarginOrder(order: OrderCancelRequest): Promise<void> {
        await this.orderHandler.cancelMarginOrder(order);
    }

}
