import {Observable} from "rxjs";
import {
    ExecutionType,
    OrderCancelRequest,
    OrderRequest,
    OrderSide,
    OrderStatus,
    OrderType,
    TimeInForce,
} from "./orderInterfaces";

export type WithOrderResponse<T> = {
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    price: number;
    originalQuantity: number;
    executedQuantity: number;
    cumulativeQuoteQuantity: number;
    status: OrderStatus;
    type: OrderType;
    side: OrderSide;
} & T;

export type OrderResponse = WithOrderResponse<{
    transactionTime: Date;
    timeInForce: TimeInForce;
}>;

export interface ExchangeOptions {
    interval: string;
}

export interface CandleEvent<E extends ExchangeOptions> {
    stream: string;
    eventTime: Date;
    candleStart?: Date;
    candleEnd: Date;
    symbol: string;
    interval: E["interval"];
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    final: boolean,
    quoteVolume: number;
}

export interface OrderReportEvent {
    eventTime: Date;
    symbol: string;
    newClientOrderId: string;
    side: OrderSide;
    orderType: OrderType;
    cancelType: TimeInForce;
    quantity: number;
    price: number;
    stopPrice: number;
    icebergQuantity: number;
    orderListId: number;
    originalClientOrderId: string;
    executionType: ExecutionType;
    orderStatus: OrderStatus;
    rejectReason: string;
    orderId: number;
    lastTradeQuantity: number; // Used for partially filled orders
    accumulatedQuantity: number; // Used for partially filled orders
    lastTradePrice: number; // Used for partially filled orders
    commission: number;
    commissionAsset: string;
    tradeTime: Date;
    tradeId: number;
}

export enum StreamEvent {
    kline = "kline",
    trades = "trades",
    ticker = "ticker",
    depth = "depth",
}

export interface CandleStreamConfig<E extends ExchangeOptions> {
    event: StreamEvent.kline;
    ticker: string;
    interval: E["interval"];
}

export interface TradesStreamConfig {
    event: StreamEvent.trades;
    ticker: string;
}

export interface TickerStreamConfig {
    event: StreamEvent.ticker;
    ticker: string;
}

export interface OrderbookStreamConfig {
    event: StreamEvent.depth;
    ticker: string;
    level?: 5 | 10 | 20;
}

export type StreamConfig<E extends ExchangeOptions> = Array<CandleStreamConfig<E> | TradesStreamConfig | TickerStreamConfig | OrderbookStreamConfig>;

export interface OrderHandler {
    createOrder(order: OrderRequest): Promise<void>;

    cancelOrder(order: OrderCancelRequest): Promise<void>;

    readonly orderReport$: Observable<OrderReportEvent>;
}

export interface DataStream<E extends ExchangeOptions> {

    readonly orderbookStream$?: never; // @TODO implement later on

    readonly tradeStream$?: never; // @TODO implement later on

    readonly candleStream$: Observable<CandleEvent<E>>;
}
