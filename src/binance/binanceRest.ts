import {BinanceRest as _BinanceRest, ValueProcessor} from "binance";
import {OrderCancelRequest, OrderCancelResponse, OrderRequest, OrderResponse} from "./binanceInterfaces";
import {mapOrderCancelResponse, mapOrderResponse} from "../mappers/binanceMapper";
import {Subject, timer} from "rxjs";
import {tap} from "rxjs/operators";

export interface RestConfig {
    key: string;
    secret: string
    timeout: number;
    recvWindow: number;
    handleDrift: boolean;
    baseUrl?: string;
}

export default class BinanceRest {

    _exchange;

    private _exchangeInfo;

    isReady$ = new Subject();

    exchangeInfo$ = timer(0, 1000 * 60).pipe(
        tap(async () => {
            await this.updateExchangeInfo();
            this.isReady$.next(true);
            this.isReady$.complete();
        })
    );

    constructor(config: RestConfig) {
        this._exchange = new _BinanceRest({
            baseUrl: 'https://api.binance.com/',
            ...config
        });

        this.exchangeInfo$.subscribe(() => {
            console.log('exchange info updated!');
        });
    }

    validateOrder(order: OrderRequest): { price: string, quantity: string } {
        const symbolInfo = this._exchangeInfo.symbols.find(s => s.symbol === order.symbol);
        if (!symbolInfo) {
            throw new Error(`symbol info for "${order.symbol}" could not be found on binance exchange. `);
        }

        return ValueProcessor.processFilters(symbolInfo, {
            price: order.price,
            quantity: order.quantity,
        })
    }

    private async updateExchangeInfo() {
        this._exchangeInfo = await this._exchange.exchangeInfo();
        return this._exchangeInfo;
    }

    async newOrder(order: OrderRequest): Promise<OrderResponse> {
        try {
            const orderRequest = {
                ...order,
                ...this.validateOrder(order)
            };

            const orderResponse = await this._exchange.newOrder(<any>orderRequest);
            if (orderResponse.msg) throw new Error(orderResponse.msg);

            return mapOrderResponse(orderResponse);
        } catch (e) {
            console.error('Error creating new order', e)
            throw e;
        }
    }

    async cancelOrder(order: OrderCancelRequest): Promise<OrderCancelResponse> {
        try {
            const orderCancelResponse = await this._exchange.cancelOrder(order);
            if (orderCancelResponse.msg) throw new Error(orderCancelResponse.msg);

            return mapOrderCancelResponse(orderCancelResponse);
        } catch (e) {
            console.error(`Error cancelling order ${order.orderId ?? order.originalClientOrderId}`, e)
            throw e;
        }
    }

    async testOrder(order: OrderRequest): Promise<void> {
        try {
            const orderRequest = {
                ...order,
                ...this.validateOrder(order)
            };

            const orderResponse = await this._exchange.testOrder(<any>orderRequest);
            if (orderResponse.msg) throw new Error(orderResponse.msg);

            return orderResponse;
        } catch (e) {
            console.error('Error creating new order', e)
            throw e;
        }
    }
}
