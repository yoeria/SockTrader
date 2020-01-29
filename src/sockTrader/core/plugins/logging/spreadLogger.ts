import winston = require("winston");
import Orderbook, {OrderbookEntry, OrderbookSide} from "../../orderbook/orderbook";
import {OrderbookAware} from "../../types/plugins/orderbookAware";
import OrderbookUtil from "../../utils/orderbookUtil";

export default class SpreadLogger implements OrderbookAware {
    private orderbookLogger!: winston.Logger;
    private lastSpread = 0;

    constructor() {
        import("../../loggerFactory").then(({orderbookLogger}) => this.orderbookLogger = orderbookLogger);
    }

    onUpdateOrderbook(orderbook: Orderbook) {
        const bid: OrderbookEntry = orderbook.getEntries(OrderbookSide.BID, 1)[0];
        const ask: OrderbookEntry = orderbook.getEntries(OrderbookSide.ASK, 1)[0];
        const spread: number = OrderbookUtil.getBidAskSpreadPerc(bid.price, ask.price);

        if (spread !== this.lastSpread) {
            this.orderbookLogger.info({type: "Orderbook", spread, bid: bid.price, ask: ask.price});
        }

        this.lastSpread = spread;
    }
}
