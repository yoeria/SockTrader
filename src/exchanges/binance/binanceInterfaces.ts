import {CandleEvent, ExchangeOptions, OrderReportEvent, WithOrderResponse} from "../exchangeInterfaces";

export interface Binance extends ExchangeOptions {
    interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
}

export interface DepthEntry {
    price: number;
    quantity: number;
}

export interface DepthEvent {
    eventType: BinanceEventType;
    stream: string;
    eventTime: Date;
    symbol: string;
    bidDepthDelta: DepthEntry[];
    askDepthDelta: DepthEntry[];
}

export enum BinanceReportEventType {
    executionReport = "executionReport",
    outboundAccountPosition = "outboundAccountPosition",
    balanceUpdate = "balanceUpdate",
    listStatus = "listStatus",
}

export type MultiplexedStream = BinanceCandleEvent | DepthEvent;

export type OrderCancelResponse = WithOrderResponse<{
    originalClientOrderId: string;
}>;

export enum BinanceEventType {
    kline = "kline",
    depthUpdate = "depthUpdate",
}

export interface BinanceReportEvent extends OrderReportEvent {
    eventType: BinanceReportEventType;
}

export interface BinanceCandleEvent extends CandleEvent<Binance> {
    eventType: BinanceEventType;
    takerVolume: number;
    takerVolumeQuote: number;
}
