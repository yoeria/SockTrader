import {Observable} from "rxjs";
import {BinanceWS} from "binance";
import {filter, share} from "rxjs/operators";
import {mapDepthEvent, mapKlineEvent, mapReportEvent} from "../../mappers/binanceMapper";
import {Binance, BinanceCandleEvent, BinanceEventType, MultiplexedStream} from "./binanceInterfaces";
import {CandleStreamConfig, DataStream, StreamConfig, StreamEvent} from "../exchangeInterfaces";
import ExchangeInstance, {BinanceRest} from "./binanceRest";

export default class BinanceStream implements DataStream<Binance> {

    readonly binanceRest: BinanceRest = ExchangeInstance;

    private readonly ws = new BinanceWS(true);

    private streams = [];

    /**
     * A multiplexed observable that emits all events as they come in from the server.
     * Note that this is an hot observable and will share its results with multiple subscribers
     */
    readonly multiplexedStream$ = new Observable(subscriber => {
        this.ws.onCombinedStream(this.streams, streamEvent => {
            try {
                const result = this.mapStream(streamEvent);
                subscriber.next(result);
            } catch (e) {
                subscriber.error(e);
            }
        });
    }).pipe(share());

    /**
     * Observable that emits realtime candles as they come in from the Binance server
     */
    readonly realtimeCandleStream$ = this.multiplexedStream$.pipe(
        filter((data: MultiplexedStream): data is BinanceCandleEvent => data.eventType === BinanceEventType.kline),
    );

    /**
     * Observable that emits candles only when it's time to start a new one. Meaning that a new candle will
     * be started immediately after the one that has been emitted.
     */
    readonly candleStream$ = this.realtimeCandleStream$.pipe(
        filter((data: BinanceCandleEvent) => data.final === true),
    );

    readonly userStream$ = new Observable(subscriber => {
        this.ws.onUserData(
            this.binanceRest._exchange,
            streamEvent => {
                const result = this.mapUserEvent(streamEvent);
                if (result) subscriber.next(result);
            },
        );
    });

    constructor(
        private config: StreamConfig<Binance>,
    ) {
        this.createStreams(this.config);
    }

    private createStreams(config: StreamConfig<Binance>) {
        this.streams = config.map(value => {
            switch (value.event) {
                case StreamEvent.depth:
                    return this.ws.streams.depth(value.ticker, value.level);
                case StreamEvent.trades:
                    return this.ws.streams.trade(value.ticker);
                case StreamEvent.ticker:
                    return this.ws.streams.ticker(value.ticker);
                case StreamEvent.kline:
                    return this.ws.streams.kline(value.ticker, (<CandleStreamConfig<Binance>>value).interval);
                default:
                    throw new Error(`Unknown event: ${JSON.stringify(value)}`);
            }
        });
    }

    private mapStream(stream: any) {
        switch (stream.data.eventType) {
            case "kline":
                return mapKlineEvent(stream);
            case "depthUpdate":
                return mapDepthEvent(stream);
            default:
                throw new Error(`Given event type "${stream.data.eventType}" has no associated mapper`);
        }
    }

    private mapUserEvent(stream: any) {
        switch (stream.eventType) {
            case "executionReport":
                return mapReportEvent(stream);
            default:
                console.warn(`Unmapped user event: ${stream.eventType}`);
                return null;
        }
    }
}
