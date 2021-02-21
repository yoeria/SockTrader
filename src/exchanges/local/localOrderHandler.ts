import {OrderHandler, OrderReportEvent} from "../exchangeInterfaces";
import {OrderCancelRequest, OrderRequest} from "../orderInterfaces";
import {Observable, Subject} from "rxjs";

export default class LocalOrderHandler implements OrderHandler {

    private readonly orders$: Observable<OrderReportEvent> = new Subject();

    readonly orderReport$: Observable<OrderReportEvent> = this.orders$;

    cancelOrder(order: OrderCancelRequest): Promise<void> {
        console.log('cancel order', order);
        return Promise.resolve(undefined);
    }

    createOrder(order: OrderRequest): Promise<void> {
        console.log('create order', order);
        return Promise.resolve(undefined);
    }

}
