import LocalConnection from "../connection/localConnection";
import {Candle} from "../types/candle";
import {CandleInterval} from "../types/candleInterval";
import {Connection} from "../types/connection";
import {OrderbookData} from "../types/orderbookData";
import {Pair} from "../types/pair";
import BaseExchange from "./baseExchange";
import LocalOrderCreator from "./orderCreators/localOrderCreator";
import LocalOrderFiller from "./orderFillers/localOrderFiller";
import Events from "../events";
import {BotStatus} from "../types/botStatus";
import config from "../../../config";

/**
 * The LocalExchange resembles a local dummy marketplace for
 * strategy testing
 */
export default class LocalExchange extends BaseExchange {

    isCurrenciesLoaded = true;
    isAuthenticated = true;
    private chunkSize = 100;

    protected createConnection(): Connection {
        return new LocalConnection();
    }

    protected loadCurrencies(): void {
        return undefined;
    }

    private* generateGrowingCandleList(candles: Candle[]) {
        let intermediateCandles: Candle[] = [];

        for (let i = 0; i < candles.length; i += 1) {
            const maxLength = (config.retentionPeriod > 0 && intermediateCandles.length >= config.retentionPeriod)
                ? config.retentionPeriod - 1
                : undefined;

            intermediateCandles = [candles[i], ...intermediateCandles.slice(0, maxLength)];

            yield intermediateCandles;
        }
    }

    protected* generateCandleChunks(candles: Candle[]) {
        let i = 1;

        let currentChunk = [];
        for (const candleList of this.generateGrowingCandleList(candles)) {
            currentChunk.push(candleList);

            if (i % this.chunkSize === 0) {
                yield currentChunk;
                currentChunk = [];
            }

            i += 1;
        }
    }

    protected processChunk(chunk: Candle[][], pair: Pair) {
        chunk.forEach((candleList) => {
            (this.orderCreator as LocalOrderCreator).setCurrentCandle(candleList[0]);
            (this.orderFiller as LocalOrderFiller).onProcessCandles(candleList);
            Events.emit("core.updateCandles", candleList, pair);
        });
    }

    protected reportProgress(current: number, total: number) {
        Events.emit("core.botStatus", {
            current: current,
            chunks: total,
            type: "progress",
        } as BotStatus);
    }

    /**
     * Emits a collection of candles from a local file as if they were sent from a real exchange.
     * Candles should be ordered during normalization process.
     */
    async emitCandles(candles: Candle[], pair: Pair) {
        const chunks = 182; // @TODO total length?

        Events.emit("core.botStatus", {type: "started", chunks: chunks});

        return new Promise((resolve, reject) => {

            let index = 0;
            for (const chunk of this.generateCandleChunks(candles)) {
                this.reportProgress(index, chunks);
                this.processChunk(chunk, pair);

                index += 1;

                if (index === (chunks - 1)) {
                    Events.emit("core.botStatus", {type: "finished"});
                    resolve(true);
                }
            }
        });
    }

    // Method ignored by localExchange
    onUpdateOrderbook(data: OrderbookData): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeCandles(pair: Pair, interval: CandleInterval): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeOrderbook(pair: Pair): void {
        return undefined;
    }

    // Method ignored by localExchange
    subscribeReports(): void {
        return undefined;
    }
}
