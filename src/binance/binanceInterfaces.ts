export interface ResponseEvent {
    event: WSResponseEvent;
    stream: string;
}

export interface KlineEvent extends ResponseEvent {
    eventTime: Date;
    candleStart: Date;
    candleEnd: Date;
    symbol: string;
    interval: WSKline['interval'];
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    final: boolean,
    quoteVolume: number;
    volumeActive: number;
    quoteVolumeActive: number;
    ignored: '0' | '1';
}

export interface DepthEntry {
    price: number;
    quantity: number;
}

export interface DepthEvent extends ResponseEvent {
    eventTime: Date;
    symbol: string;
    bidDepthDelta: DepthEntry[];
    askDepthDelta: DepthEntry[];
}

export enum WSRequestEvent {
    kline = 'kline',
    trades = 'trades',
    ticker = 'ticker',
    depth = 'depth',
}

export enum WSResponseEvent {
    kline = 'kline',
    depthUpdate = 'depthUpdate',
}

export interface WSKline {
    event: WSRequestEvent.kline;
    ticker: string;
    interval: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
}

export interface WSTrades {
    event: WSRequestEvent.trades;
    ticker: string;
}

export interface WSTicker {
    event: WSRequestEvent.ticker;
    ticker: string;
}

export interface WSDepth {
    event: WSRequestEvent.depth;
    ticker: string;
    level?: 5 | 10 | 20;
}

export enum WSUserDataEvent {
    executionReport = 'executionReport',
    outboundAccountPosition = 'outboundAccountPosition',
    balanceUpdate = 'balanceUpdate',
    listStatus = 'listStatus',
}

export type MultiplexedStream = KlineEvent | DepthEvent;
export type StreamConfig = Array<WSKline | WSTrades | WSTicker | WSDepth>;

export enum OrderType {
    limit = 'LIMIT',
    market = 'MARKET',
    stopLoss = 'STOP_LOSS',
    stopLossLimit = 'STOP_LOSS_LIMIT',
    takeProfit = 'TAKE_PROFIT',
    takeProfitLimit = 'TAKE_PROFIT_LIMIT',
    limitMaker = 'LIMIT_MAKER',
}

export enum OrderSide {
    buy = 'BUY',
    sell = 'SELL',
}

export enum TimeInForce {
    goodTillCanceled = 'GTC',
    immediateOrCancel = 'IOC',
    fillOrKill = 'FOK',
}

export enum OrderStatus {
    filled = 'FILLED',
    canceled = 'CANCELED',
}

export enum ExecutionType {
    new = 'NEW',
    filled = 'FILLED',
    canceled = 'CANCELED',
}

export interface OrderRequest {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    timeInForce: TimeInForce;
    quantity?: number;
    quoteOrderQty?: number;
    price?: number;
}

export interface OrderCancelRequest {
    symbol: string;
    orderId?: number;
    originalClientOrderId?: string;
    newClientOrderId?: string;
    recvWindow?: number;
}

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

export type OrderCancelResponse = WithOrderResponse<{
    originalClientOrderId: string;
}>;

export type OrderResponse = WithOrderResponse<{
    transactionTime: Date;
    timeInForce: TimeInForce;
}>;

export interface ReportEvent {
    eventType: 'executionReport';
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
    lastTradeQuantity: number;
    accumulatedQuantity: number;
    lastTradePrice: number;
    commission: number;
    commissionAsset: string;
    tradeTime: Date;
    tradeId: number;
}
