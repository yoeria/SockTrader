import {AssetCollection} from "../../../../sockTrader/core/wallet/assetCollection";
import {FX_FILLED_SELL_ORDER, FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";
import {ReleaseCommand} from "../../../../sockTrader/core/wallet/command/releaseCommand";

jest.mock("./../../../../config");

describe("apply", () => {
    it("Should add BTC value to wallet and substract USD value from reserved wallet for buy", () => {
        const assets = new AssetCollection({});
        const reservedAssets = new AssetCollection({"USD": 200});
        new ReleaseCommand(assets, reservedAssets).apply(FX_NEW_BUY_ORDER);

        expect(assets.getAssets()).toEqual({"BTC": 1});
        expect(reservedAssets.getAssets()).toEqual({"USD": 98});
    });

    it("Should add USD value to wallet and substract BTC value from reserved wallet for sell", () => {
        const assets = new AssetCollection({});
        const reservedAssets = new AssetCollection({"BTC": 2});
        new ReleaseCommand(assets, reservedAssets).apply(FX_FILLED_SELL_ORDER);

        expect(assets.getAssets()).toEqual({"USD": 98});
        expect(reservedAssets.getAssets()).toEqual({"BTC": 1});
    });
});