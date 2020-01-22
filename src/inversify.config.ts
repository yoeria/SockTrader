import {EventEmitter} from "events";
import {Container, interfaces} from "inversify";
import {makeLoggerMiddleware} from "inversify-logger-middleware";
import config from "./config";
import {exchanges} from "./sockTrader/core/exchanges";
import LocalOrderCreator from "./sockTrader/core/exchanges/orderCreators/localOrderCreator";
import OrderTracker from "./sockTrader/core/order/orderTracker";
import Wallet from "./sockTrader/core/plugins/wallet/wallet";
import {OrderCreator} from "./sockTrader/core/types/orderCreator";
import {AssetMap} from "./sockTrader/core/types/wallet";

const logger = makeLoggerMiddleware();

const container = new Container({skipBaseClassChecks: true});
container.applyMiddleware(logger);

// @TODO change injection type to config
container.bind<AssetMap>("AssetMap").toConstantValue(config.assets);

container.bind<EventEmitter>(EventEmitter).toSelf();
container.bind<LocalOrderCreator>(LocalOrderCreator).toSelf();
container.bind<OrderTracker>(OrderTracker).toSelf().inSingletonScope();
container.bind<Wallet>(Wallet).toSelf().inSingletonScope();

container.bind<interfaces.Factory<OrderCreator>>("Factory<OrderCreator>").toFactory<OrderCreator>((context: interfaces.Context) => {
    return (exchangeName: string) => {
        const isLive = process.env.SOCKTRADER_TRADING_MODE === "LIVE";

        const {orderCreator} = exchanges[exchangeName];

        return isLive
            ? context.container.resolve(orderCreator)
            : context.container.get<OrderCreator>(LocalOrderCreator);
    };
});

// export type WalletProvider = (param1: string) => Promise<Wallet>;

// container.bind<WalletProvider>("WalletProvider").toProvider<Wallet>(context => {
//    return (param1: string) => {
//        return new Promise(resolve => {
//            const wallet = context.container.get<Wallet>(Wallet);
//            console.log("Wallet provider..", param1, wallet);
//
//            resolve(wallet);
//        });
//    };
// });

export default container;
