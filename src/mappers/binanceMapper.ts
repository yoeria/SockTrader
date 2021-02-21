import {
    BinanceEventType,
    BinanceReportEvent, BinanceCandleEvent,
    DepthEvent,
    OrderCancelResponse,
} from "../exchanges/binance/binanceInterfaces";
import {OrderResponse} from "../exchanges/exchangeInterfaces";

export const mapKlineEvent = (event: any): BinanceCandleEvent => {
    return {
        eventType: BinanceEventType.kline,
        stream: event.stream,
        eventTime: new Date(event.data.eventTime),
        candleStart: new Date(event.data.kline.startTime),
        candleEnd: new Date(event.data.kline.endTime),
        symbol: event.data.symbol,
        interval: event.data.kline.interval,
        open: parseFloat(event.data.kline.open),
        high: parseFloat(event.data.kline.high),
        low: parseFloat(event.data.kline.low),
        close: parseFloat(event.data.kline.close),
        volume: parseFloat(event.data.kline.volume),
        final: event.data.kline.final,
        quoteVolume: parseFloat(event.data.kline.quoteVolume),
        volumeActive: parseFloat(event.data.kline.volumeActive),
        quoteVolumeActive: parseFloat(event.data.kline.quoteVolumeActive),
        ignored: event.data.kline.ignored, // @TODO log to sentry if this happens!?
    }
}

export const mapDepthEvent = (event: any): DepthEvent => {
    return {
        eventType: BinanceEventType.depthUpdate,
        stream: event.stream,
        eventTime: new Date(event.data.eventTime),
        symbol: event.data.symbol,
        bidDepthDelta: event.data.bidDepthDelta,
        askDepthDelta: event.data.askDepthDelta
    }
}

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
    }
}

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
    }
}

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
    }
}
