import {BinanceRest as _BinanceRest} from "binance";
import {Subject, timer} from "rxjs";
import {tap} from "rxjs/operators";
import {config} from "../../socktrader.config";

export class BinanceRest {

    _exchange: _BinanceRest;

    _exchangeInfo;

    isReady$ = new Subject();

    exchangeInfo$ = timer(0, 1000 * 60).pipe(
        tap(async () => {
            await this.updateExchangeInfo();
            this.isReady$.next(true);
            this.isReady$.complete();
        }),
    );

    constructor(config) {
        this._exchange = new _BinanceRest({
            baseUrl: "https://api.binance.com/",
            ...config,
        });

        this.exchangeInfo$.subscribe(() => {
            console.log("exchange info updated!");
        });
    }


    private async updateExchangeInfo() {
        this._exchangeInfo = await this._exchange.exchangeInfo();
        return this._exchangeInfo;
    }
}

export default new BinanceRest({
    ...config.exchanges.binance
});
