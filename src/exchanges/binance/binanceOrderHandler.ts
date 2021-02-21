import {ValueProcessor} from "binance";
import {OrderHandler, OrderReportEvent} from "../exchangeInterfaces";
import {Observable} from "rxjs";
import {OrderCancelRequest, OrderRequest} from "../orderInterfaces";
import ExchangeInstance, {BinanceRest} from "./binanceRest";

export default class BinanceOrderHandler implements OrderHandler {
    readonly orderReport$: Observable<OrderReportEvent>;

    readonly binanceRest: BinanceRest = ExchangeInstance;

    private validateOrder(order: OrderRequest): { price: string, quantity: string } {
        const symbolInfo = this.binanceRest._exchangeInfo.symbols.find(s => s.symbol === order.symbol);
        if (!symbolInfo) {
            throw new Error(`symbol info for "${order.symbol}" could not be found on binance exchange. `);
        }

        return ValueProcessor.processFilters(symbolInfo, {
            price: order.price,
            quantity: order.quantity,
        });
    }

    async createOrder(order: OrderRequest): Promise<void> {
        try {
            const orderRequest = {
                ...order,
                ...this.validateOrder(order),
            };

            const orderResponse = await this.binanceRest._exchange.newOrder(<any>orderRequest);
            if (orderResponse.msg) throw new Error(orderResponse.msg);

            // return mapOrderResponse(orderResponse);
        } catch (e) {
            console.error("Error creating new order", e);
            throw e;
        }
    }

    async cancelOrder(order: OrderCancelRequest): Promise<void> {
        try {
            const orderCancelResponse = await this.binanceRest._exchange.cancelOrder(order);
            if (orderCancelResponse.msg) throw new Error(orderCancelResponse.msg);

            // return mapOrderCancelResponse(orderCancelResponse);
        } catch (e) {
            console.error(`Error cancelling order ${order.orderId ?? order.originalClientOrderId}`, e);
            throw e;
        }
    }

    async testOrder(order: OrderRequest): Promise<void> {
        try {
            const orderRequest = {
                ...order,
                ...this.validateOrder(order),
            };

            const orderResponse = await this.binanceRest._exchange.testOrder(<any>orderRequest);
            if (orderResponse.msg) throw new Error(orderResponse.msg);

            return orderResponse;
        } catch (e) {
            console.error("Error creating new order", e);
            throw e;
        }
    }
}
