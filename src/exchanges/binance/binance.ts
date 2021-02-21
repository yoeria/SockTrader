import * as Binance from "node-binance-api";
import {config} from "../../socktrader.config";

const binance: Binance = new Binance().options({
    APIKEY: config.exchanges.binance.key,
    APISECRET: config.exchanges.binance.secret
});

export default binance;
