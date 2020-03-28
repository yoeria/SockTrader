import {AssetCollection} from "../../../../sockTrader/core/wallet/assetCollection";
import {FX_FILLED_SELL_ORDER, FX_NEW_BUY_MARKET_ORDER, FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";
import {ReleaseCommand} from "../../../../sockTrader/core/wallet/command/releaseCommand";
import {FeeConfig} from "../../../../sockTrader/core/types/feeConfig";

jest.mock("./../../../../config");

const feeConfig: FeeConfig = {
    makerFee: 2,
    takerFee: 2,
};

describe("apply", () => {
    it("Should add BTC value to wallet and substract USD value from reserved wallet for buy", () => {
        const assets = new AssetCollection({});
        const reservedAssets = new AssetCollection({"USD": 200});
        new ReleaseCommand(assets, reservedAssets, feeConfig).apply(FX_NEW_BUY_ORDER);

        expect(assets.getAssets()).toEqual({"BTC": 1});
        expect(reservedAssets.getAssets()).toEqual({"USD": 98});
    });

    it("Should add USD value to wallet and substract BTC value from reserved wallet for sell", () => {
        const assets = new AssetCollection({});
        const reservedAssets = new AssetCollection({"BTC": 2});
        new ReleaseCommand(assets, reservedAssets, feeConfig).apply(FX_FILLED_SELL_ORDER);

        expect(assets.getAssets()).toEqual({"USD": 98});
        expect(reservedAssets.getAssets()).toEqual({"BTC": 1});
    });

    it("Should take slippage into account for market buy order", () => {
        const assets = new AssetCollection({});
        const reservedAssets = new AssetCollection({"USD": 200});
        new ReleaseCommand(assets, reservedAssets, feeConfig).apply(FX_NEW_BUY_MARKET_ORDER);

        expect(assets.getAssets()).toEqual({"BTC": 1});
        expect(reservedAssets.getAssets()).toEqual({"USD": 97});
    });
});