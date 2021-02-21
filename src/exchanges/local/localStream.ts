import {Observable, Subscriber} from "rxjs";
import db from "../../db";
import {share} from "rxjs/operators";
import {mapCandleEvent} from "../../mappers/localMapper";
import {Local, LocalCandleEvent} from "./localInterfaces";
import {CandleStreamConfig, DataStream, StreamConfig, StreamEvent} from "../exchangeInterfaces";

export default class LocalStream implements DataStream<Local> {

    /**
     * Observable that emits all candles found in the database for each stream, ordered by candle close time.
     */
    readonly candleStream$: Observable<LocalCandleEvent> = new Observable((subscriber: Subscriber<LocalCandleEvent>) => {
        const streams = this.config.filter(c => c.event === StreamEvent.kline);
        const condition = streams.map((k: CandleStreamConfig<Local>) => `(symbol = '${k.ticker}' AND interval = '${k.interval}')`).join(" OR ");

        db.query(`
            SELECT * 
            FROM candles 
            WHERE ${condition}
            ORDER BY close_time ASC, id ASC
        `, (error, result) => {
            if (error) {
                subscriber.error();
            } else {
                result.rows.forEach(r => subscriber.next(mapCandleEvent(r)));
                subscriber.complete();
            }
        });
    }).pipe(share());

    constructor(
        private config: StreamConfig<Local>,
    ) {
    }
}
