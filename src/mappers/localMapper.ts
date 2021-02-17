import {KlineEvent, WSResponseEvent} from "../binance/binanceInterfaces";

export const mapKlineEvent = (event: any): KlineEvent => {
    return {
        event: WSResponseEvent.kline,
        stream: event.stream,
        eventTime: event.close_time,
        candleStart: event.open_time,
        candleEnd: event.close_time,
        symbol: event.symbol,
        interval: event.interval,
        open: event.open,
        high: event.high,
        low: event.low,
        close: event.close,
        volume: event.volume,
        final: true,
        quoteVolume: event.quote_volume,
        volumeActive: event.volume_active,
        quoteVolumeActive: 0,
        ignored: '0',
    }
}
