import {
    BinanceCandleEvent,
    BinanceEventType,
    BinanceReportEvent,
    DepthEvent,
    OrderCancelResponse,
} from "../exchanges/binance/binanceInterfaces";
import {OrderResponse} from "../exchanges/exchangeInterfaces";

export const mapKlineEvent = (candlesticks: any): BinanceCandleEvent => {
    let {E: eventTime, s: symbol, k: ticks} = candlesticks;
    let {
        o: open,
        h: high,
        l: low,
        c: close,
        v: volume,
        t: startTime,
        T: endTime,
        i: interval,
        x: isFinal,
        q: quoteVolume,
        V: takerVolume,
        Q: takerVolumeQuote,
    } = ticks;

    return {
        eventType: BinanceEventType.kline,
        stream: `${symbol.toString().toLowerCase()}@kline_${interval}`,
        eventTime: new Date(eventTime),
        candleStart: new Date(startTime),
        candleEnd: new Date(endTime),
        symbol: symbol,
        interval: interval,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume),
        final: isFinal,
        quoteVolume: parseFloat(quoteVolume),
        takerVolume: parseFloat(takerVolume),
        takerVolumeQuote: parseFloat(takerVolumeQuote),
    };
};

export const mapDepthEvent = (event: any): DepthEvent => {
    return {
        eventType: BinanceEventType.depthUpdate,
        stream: event.stream,
        eventTime: new Date(event.data.eventTime),
        symbol: event.data.symbol,
        bidDepthDelta: event.data.bidDepthDelta,
        askDepthDelta: event.data.askDepthDelta,
    };
};

export const mapOrderCancelResponse = (event: any): OrderCancelResponse => {
    return {
        symbol: event.symbol,
        originalClientOrderId: event.origClientOrderId,
        orderId: event.orderId,
        orderListId: event.orderListId,
        clientOrderId: event.clientOrderId,
        price: parseFloat(event.price),
        originalQuantity: parseFloat(event.origQty),
        executedQuantity: parseFloat(event.executedQty),
        cumulativeQuoteQuantity: parseFloat(event.cummulativeQuoteQty),
        status: event.status,
        type: event.type,
        side: event.side,
    };
};

export const mapOrderResponse = (event: any): OrderResponse => {
    return {
        symbol: event.symbol,
        orderId: event.orderId,
        orderListId: event.orderListId,
        clientOrderId: event.clientOrderId,
        transactionTime: new Date(event.transactTime),
        price: parseFloat(event.price),
        originalQuantity: parseFloat(event.origQty),
        executedQuantity: parseFloat(event.executedQty),
        cumulativeQuoteQuantity: parseFloat(event.cummulativeQuoteQty),
        status: event.status,
        timeInForce: event.timeInForce,
        type: event.type,
        side: event.side,
    };
};

export const mapReportEvent = (event: any): BinanceReportEvent => {
    return {
        eventType: event.eventType,
        eventTime: new Date(event.eventTime),
        symbol: event.symbol,
        newClientOrderId: event.newClientOrderId,
        side: event.side,
        orderType: event.orderType,
        cancelType: event.cancelType,
        quantity: parseFloat(event.quantity),
        price: parseFloat(event.price),
        stopPrice: parseFloat(event.stopPrice),
        icebergQuantity: parseFloat(event.icebergQuantity),
        orderListId: event.g,
        originalClientOrderId: event.originalClientOrderId,
        executionType: event.executionType,
        orderStatus: event.orderStatus,
        rejectReason: event.rejectReason,
        orderId: event.orderId,
        lastTradeQuantity: event.lastTradeQuantity,
        accumulatedQuantity: event.accumulatedQuantity,
        lastTradePrice: event.lastTradePrice,
        commission: event.commission,
        commissionAsset: event.commissionAsset,
        tradeTime: new Date(event.tradeTime),
        tradeId: event.tradeId,
    };
};
