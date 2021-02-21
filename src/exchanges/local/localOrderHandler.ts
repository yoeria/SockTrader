import {CandleEvent, DataStream, OrderHandler, OrderReportEvent} from "../exchangeInterfaces";
import {ExecutionType, OrderCancelRequest, OrderRequest, OrderSide, OrderStatus, OrderType} from "../orderInterfaces";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {filter, map, mergeMap, share, switchMap} from "rxjs/operators";
import {nanoid} from "nanoid";

interface LocalOrderRequest extends OrderRequest {
    newClientOrderId: string;
}

// noinspection JSUnusedGlobalSymbols
export default class LocalOrderHandler implements OrderHandler {

    private readonly openOrders$: BehaviorSubject<Array<LocalOrderRequest>> = new BehaviorSubject([]);

    readonly candleStream$: Observable<CandleEvent<any>> = this.dataStream.candleStream$;

    readonly orderReport$: Observable<OrderReportEvent> = combineLatest([
        this.openOrders$,
        this.candleStream$,
    ]).pipe(
        filter(([openOrders, candle]) => openOrders.some(o => o.symbol === candle.symbol)),
        switchMap(([openOrders, candle]) =>
            of(openOrders).pipe( // Split multiple orders in a single event stream
                mergeMap(order => order),
                map<LocalOrderRequest, [LocalOrderRequest, CandleEvent<any>]>(order => [order, candle]),
            )),
        map(([order, candle]) => this.fillOrder(order, candle)),
        filter((report): report is OrderReportEvent => report != null),
        share(),
    );

    constructor(
        private readonly dataStream: DataStream<any>,
    ) {
    }

    generateOrderId() {
        return nanoid(10);
    }

    fillOrder(order: LocalOrderRequest, candle: CandleEvent<any>): OrderReportEvent | undefined {
        if (order.type === OrderType.market || order.price == null) {
            return this.createOrderReport(order);
        }

        if (order.side === OrderSide.buy && candle.low <= order.price) {
            return this.createOrderReport(order);
        } else if (order.side === OrderSide.sell && candle.high >= order.price) {
            return this.createOrderReport(order);
        }

        return undefined;
    }

    createOrderReport(order: LocalOrderRequest, overwrite?: Partial<OrderReportEvent>): OrderReportEvent {
        // @TODO wordt er ook een event gegenereerd bij het aanmaken van een order? of enkel bij het vullen van een order?

        return {
            eventTime: new Date(),
            symbol: order.symbol,
            newClientOrderId: order.newClientOrderId ?? this.generateOrderId(),
            side: order.side,
            orderType: order.type,
            cancelType: order.timeInForce,
            quantity: order.quantity,
            price: order.price,
            stopPrice: undefined,
            icebergQuantity: undefined,
            orderListId: undefined,
            originalClientOrderId: undefined,
            executionType: ExecutionType.new,
            orderStatus: OrderStatus.new,
            rejectReason: "",
            orderId: undefined,
            lastTradeQuantity: order.quantity, // Used for partially filled orders
            accumulatedQuantity: order.quantity, // Used for partially filled orders
            lastTradePrice: order.price, // Used for partially filled orders
            commission: undefined,
            commissionAsset: undefined,
            tradeTime: undefined,
            tradeId: undefined,
            ...overwrite,
        };
    }

    cancelOrder(order: OrderCancelRequest): Promise<void> {
        const openOrders = this.openOrders$.getValue().filter(o => o.newClientOrderId !== order.originalClientOrderId);

        this.openOrders$.next(openOrders);
        return Promise.resolve(undefined);
    }

    createOrder(order: OrderRequest): Promise<void> {
        this.openOrders$.next([...this.openOrders$.getValue(), {
            newClientOrderId: order.newClientOrderId ?? this.generateOrderId(),
            ...order,
        }]);

        return Promise.resolve(undefined);
    }
}
