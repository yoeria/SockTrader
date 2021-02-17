import {Observable, Subject, Subscriber} from "rxjs";
import db from "../db";
import {share} from "rxjs/operators";
import {KlineEvent, ReportEvent, StreamConfig, WSKline, WSRequestEvent} from "../binance/binanceInterfaces";
import {mapKlineEvent} from "../mappers/localMapper";

export default class LocalStream {

    /**
     * Observable that emits all candles found in the database for each stream, ordered by candle close time.
     */
    readonly klineStream$: Observable<KlineEvent> = new Observable((subscriber: Subscriber<KlineEvent>) => {
        const klines = this.config.filter(c => c.event === WSRequestEvent.kline)
        const condition = klines.map((k: WSKline) => `(symbol = '${k.ticker}' AND interval = '${k.interval}')`).join(' OR ');

        db.query(`
            SELECT * 
            FROM candles 
            WHERE ${condition}
            ORDER BY close_time ASC, id ASC
        `, (error, result) => {
            if (error) {
                subscriber.error()
            } else {
                result.rows.forEach(r => subscriber.next(mapKlineEvent(r)));
                subscriber.complete();
            }
        });
    }).pipe(share());

    readonly userStream$: Subject<ReportEvent> = new Subject();

    constructor(
        private config: StreamConfig,
    ) {
        // this.createStreams(this.config);
    }

}
