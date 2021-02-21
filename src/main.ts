import "./sentry";
import {StreamEvent} from "./exchanges/exchangeInterfaces";
import Exchange from "./exchanges/exchange";
import LocalOrderHandler from "./exchanges/local/localOrderHandler";
import BinanceStream from "./exchanges/binance/binanceStream";

const exchange = new Exchange(
    new LocalOrderHandler(),
    new BinanceStream([
        {event: StreamEvent.kline, interval: "5m", ticker: "ETHUSDT"},
    ]),
);

exchange.orderReport$.subscribe(orders => console.log("orders: ", orders));
exchange.candleStream$.subscribe(candles => console.log("candles: ", candles));
