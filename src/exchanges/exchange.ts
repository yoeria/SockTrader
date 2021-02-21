import {CandleEvent, DataStream, ExchangeOptions, OrderHandler, OrderReportEvent} from "./exchangeInterfaces";
import {Observable} from "rxjs";
import {OrderCancelRequest, OrderRequest} from "./orderInterfaces";

export default class Exchange<E extends ExchangeOptions> implements OrderHandler, DataStream<E> {

    readonly candleStream$: Observable<CandleEvent<E>> = this.dataStream.candleStream$;
    readonly orderReport$: Observable<OrderReportEvent> = this.orderHandler.orderReport$;

    constructor(
        private readonly orderHandler: OrderHandler,
        private readonly dataStream: DataStream<E>,
    ) {
    }

    async createOrder(order: OrderRequest): Promise<void> {
        await this.orderHandler.createOrder(order);
    }

    async cancelOrder(order: OrderCancelRequest): Promise<void> {
        await this.orderHandler.cancelOrder(order);
    }

}
