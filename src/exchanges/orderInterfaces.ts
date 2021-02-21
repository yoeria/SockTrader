/*
    Contains all generic order interfaces
 */

export enum OrderType {
    limit = "LIMIT",
    market = "MARKET",
    stopLoss = "STOP_LOSS",
    stopLossLimit = "STOP_LOSS_LIMIT",
    takeProfit = "TAKE_PROFIT",
    takeProfitLimit = "TAKE_PROFIT_LIMIT",
    limitMaker = "LIMIT_MAKER",
}

export enum OrderSide {
    buy = "BUY",
    sell = "SELL",
}

export enum TimeInForce {
    goodTillCanceled = "GTC",
    immediateOrCancel = "IOC",
    fillOrKill = "FOK",
}

export enum OrderStatus {
    new = "NEW",
    partiallyFilled = "PARTIALLY_FILLED",
    filled = "FILLED",
    canceled = "CANCELED",
    pendingCancel = "PENDING_CANCEL",
    rejected = "REJECTED",
    expired = "EXPIRED",
}

export enum ExecutionType {
    new = "NEW",
    canceled = "CANCELED",
    replaced = "REPLACED",
    rejected = "REJECTED",
    trade = "TRADE",
    expired = "EXPIRED",
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
