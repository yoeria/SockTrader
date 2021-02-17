import {Observable} from "rxjs";
import {BinanceWS} from "binance";
import {filter, share} from "rxjs/operators";
import BinanceRest from "./binanceRest";
import {mapDepthEvent, mapKlineEvent, mapReportEvent} from "../mappers/binanceMapper";
import {KlineEvent, MultiplexedStream, StreamConfig, WSKline, WSRequestEvent, WSResponseEvent} from "./binanceInterfaces";

export default class BinanceStream {

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
    readonly realtimeKlineStream$ = this.multiplexedStream$.pipe(
        filter((data: MultiplexedStream): data is KlineEvent => data.event === WSResponseEvent.kline)
    );

    /**
     * Observable that emits candles only when it's time to start a new one. Meaning that a new candle will
     * be started immediately after the one that has been emitted.
     */
    readonly klineStream$ = this.realtimeKlineStream$.pipe(
        filter((data: KlineEvent) => data.final === true)
    );

    readonly userStream$ = new Observable(subscriber => {
        this.ws.onUserData(
            this.binanceRest._exchange,
            streamEvent => {
                const result = this.mapUserEvent(streamEvent)
                if (result) subscriber.next(result);
            }
        );
    });

    constructor(
        private config: StreamConfig,
        private binanceRest: BinanceRest
    ) {
        this.createStreams(this.config);
    }

    private createStreams(config: StreamConfig) {
        this.streams = config.map(value => {
            switch (value.event) {
                case WSRequestEvent.depth:
                    return this.ws.streams.depth(value.ticker, value.level);
                case WSRequestEvent.trades:
                    return this.ws.streams.trade(value.ticker);
                case WSRequestEvent.ticker:
                    return this.ws.streams.ticker(value.ticker);
                case WSRequestEvent.kline:
                    return this.ws.streams.kline(value.ticker, (<WSKline>value).interval);
                default:
                    throw new Error(`Unknown event: ${JSON.stringify(value)}`)
            }
        })
    }

    private mapStream(stream: any) {
        switch (stream.data.eventType) {
            case 'kline':
                return mapKlineEvent(stream);
            case 'depthUpdate':
                return mapDepthEvent(stream);
            default:
                throw new Error(`Given event type "${stream.data.eventType}" has no associated mapper`);
        }
    }

    private mapUserEvent(stream: any) {
        switch(stream.eventType) {
            case 'executionReport':
                return mapReportEvent(stream);
            default:
                console.warn(`Unmapped user event: ${stream.eventType}`);
                return null;
        }
    }
}
