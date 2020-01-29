import winston = require("winston");
import {orderLogger} from "../../loggerFactory";
import {Order} from "../../types/order";
import {ReportAware} from "../../types/plugins/reportAware";

export default class OrderLogger implements ReportAware {
    private orderLogger!: winston.Logger;

    constructor() {
        import("../../loggerFactory").then(({walletLogger}) => this.orderLogger = orderLogger);
    }

    onReport(order: Order) {
        this.orderLogger.info({type: "Order", payload: order});
    }
}
