import winston = require("winston");
import {AssetAware} from "../../types/plugins/assetAware";
// @ts-ignore
import {AssetMap} from "../wallet/wallet";

export default class WalletLogger implements AssetAware {
    private walletLogger!: winston.Logger;

    constructor() {
        import("../../loggerFactory").then(({walletLogger}) => this.walletLogger = walletLogger);
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        this.walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        this.walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }
}
