import Events from "../../events";
import {Order, OrderSide, OrderStatus, ReportType} from "../../types/order";

export interface AssetMap {
    [key: string]: number;
}

type AssetCalc = (asset: string, priceQty: number) => void;

/**
 * The wallet keeps track of all assets
 * strategy testing
 */
export default class Wallet {

    private readonly assets!: AssetMap;
    private readonly reservedAssets!: AssetMap;

    /**
     * Creates a new LocalExchange
     */
    constructor(assets: AssetMap) {
        this.assets = this.getAssetProxy(assets);
        this.reservedAssets = this.getAssetProxy({});

        this.addAsset = this.addAsset.bind(this);
        this.subtractAsset = this.subtractAsset.bind(this);
        this.addReservedAsset = this.addReservedAsset.bind(this);
        this.subtractReservedAsset = this.subtractReservedAsset.bind(this);
    }

    /**
     * Checks if funds are sufficient for a buy
     * @param {Order} order the order to verify
     * @returns {boolean} is buy allowed
     */
    isBuyAllowed(order: Order): boolean {
        return this.assets[order.pair[1]] >= this.getOrderPrice(order);
    }

    /**
     * Checks if current quantity of currency in possession
     * if sufficient for given sell order
     * @param {Order} order the order to verify
     * @returns {boolean} is sell allowed
     */
    isSellAllowed(order: Order): boolean {
        return this.assets[order.pair[0]] >= order.quantity;
    }

    /**
     * Validates if the wallet has sufficient funds to cover the given order.
     * @param order
     */
    isOrderAllowed(order: Order): boolean {
        return order.side === OrderSide.BUY ? this.isBuyAllowed(order) : this.isSellAllowed(order);
    }

    private getAssetProxy(assets: AssetMap) {
        return new Proxy<AssetMap>(assets, {
            get: (target: AssetMap, p: PropertyKey): any => {
                return p in target ? target[p.toString()] : 0;
            },
        });
    }

    /**
     * Calculates total price of order
     * @param {Order} order the order
     * @returns {number} total price
     */
    private getOrderPrice(order: Order) {
        return order.price * order.quantity;
    }

    private createCalculator(orderSide: OrderSide, side: OrderSide) {
        return (asset: string, calc: AssetCalc, priceQty: number) => {
            if (orderSide === side) calc(asset, priceQty);
        };
    }

    private createCalculators(order: Order) {
        return {
            ifBuy: this.createCalculator(order.side, OrderSide.BUY),
            ifSell: this.createCalculator(order.side, OrderSide.SELL),
        };
    }

    private addAsset(asset: string, priceQty: number): number {
        return this.assets[asset] += priceQty;
    }

    private subtractAsset(asset: string, priceQty: number): number {
        return this.assets[asset] -= priceQty;
    }

    private addReservedAsset(asset: string, priceQty: number): number {
        return this.reservedAssets[asset] += priceQty;
    }

    private subtractReservedAsset(asset: string, priceQty: number): number {
        return this.reservedAssets[asset] -= priceQty;
    }

    /**
     * Revert asset reservation
     * @param order
     */
    private revertAssetReservation(order: Order): void {
        const [quote, base] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(base, this.addAsset, this.getOrderPrice(order));
        ifSell(quote, this.addAsset, order.quantity);
        ifBuy(base, this.subtractReservedAsset, this.getOrderPrice(order));
        ifSell(quote, this.subtractReservedAsset, order.quantity);
    }

    /**
     * Reserve assets. This will prevent a trader from spending the same amount twice.
     * Ofc the exchange would throw an error at some point.
     * @param order
     */
    private reserveAsset(order: Order): void {
        const [quote, base] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(base, this.subtractAsset, this.getOrderPrice(order));
        ifSell(quote, this.subtractAsset, order.quantity);
        ifBuy(base, this.addReservedAsset, this.getOrderPrice(order));
        ifSell(quote, this.addReservedAsset, order.quantity);
    }

    /**
     * Assets will be released on the other side of the trade.
     * @param order
     */
    private releaseAsset(order: Order): void {
        const [quote, base] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(quote, this.addAsset, order.quantity);
        ifSell(base, this.addAsset, this.getOrderPrice(order));
        ifBuy(base, this.subtractReservedAsset, this.getOrderPrice(order));
        ifSell(quote, this.subtractReservedAsset, order.quantity);
    }

    /**
     * Updates the assets on the exchange for given new order
     * @param {Order} order new order
     * @param {Order} oldOrder old order
     */
    updateAssets(order: Order, oldOrder?: Order) {
        if (ReportType.REPLACED === order.reportType && oldOrder) {
            this.revertAssetReservation(oldOrder);
            this.reserveAsset(order);
        } else if (ReportType.NEW === order.reportType) {
            this.reserveAsset(order);
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            // @TODO what if order is partially filled?
            this.releaseAsset(order);
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.revertAssetReservation(order);
        }

        Events.emit("core.updateAssets", this.assets, this.reservedAssets);
    }
}