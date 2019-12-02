import moment, {Moment} from "moment";
import OrderTracker from "../../order/orderTracker";
import Wallet from "../../plugins/wallet/wallet";
import {ICandle} from "../../types/ICandle";
import {IOrderCreator} from "../../types/IOrderCreator";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../../types/order";
import {Pair} from "../../types/pair";
import {generateOrderId} from "../../utils/utils";

export default class LocalOrderCreator implements IOrderCreator {

    currentCandle?: ICandle = undefined;

    constructor(private readonly orderTracker: OrderTracker, private readonly wallet: Wallet) {
    }

    setCurrentCandle(candle: ICandle) {
        this.currentCandle = candle;
    }

    cancelOrder(order: IOrder) {
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process({...order, reportType: ReportType.CANCELED});
    }

    createOrder(pair: Pair, price: number, qty: number, side: OrderSide) {
        const candleTime = this.getTimeOfOrder();

        const order: IOrder = {
            createdAt: candleTime,
            updatedAt: candleTime,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            id: generateOrderId(pair),
            type: OrderType.LIMIT,
            reportType: ReportType.NEW,
            side,
            pair,
            quantity: qty,
            price,
        };

        if (!this.wallet.isOrderAllowed(order)) return; // @TODO remove dependency

        this.wallet.updateAssets(order); // @TODO remove dependency
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process(order);
    }

    adjustOrder(order: IOrder, price: number, qty: number) {
        const newOrder: IOrder = {
            ...order,
            id: generateOrderId(order.pair),
            updatedAt: this.getTimeOfOrder(),
            reportType: ReportType.REPLACED,
            type: OrderType.LIMIT,
            originalId: order.id,
            quantity: qty,
            price,
        };

        if (!this.wallet.isOrderAllowed(newOrder, order)) return; // @TODO remove dependency

        this.wallet.updateAssets(newOrder, order); // @TODO remove dependency
        this.orderTracker.setOrderUnconfirmed(order.id);
        this.orderTracker.process(newOrder);
    }

    /**
     * Will return the timestamp of the current candle if it has been set.
     * Otherwise it will return the actual server time.
     *
     * PaperTrading: create order based on the actual server time
     * BackTesting: create order based on the current candle time
     */
    private getTimeOfOrder(): Moment {
        return this.currentCandle ? this.currentCandle.timestamp : moment();
    }
}
