#!/usr/bin/env ts-node
import db from "../src/db";
import {resolve} from "path";
import {createReadStream} from "fs";
import {Transform, TransformCallback} from "stream";
import {from as copyFrom} from "pg-copy-streams";
import {subMilliseconds, subMinutes} from "date-fns";
import {pushWithBackpressure} from "./pushWithBackpressure";

// const fileName = resolve(__dirname, './bitstampUSD_1-min_data_2012-01-01_to_2020-12-31.csv');
const fileName = resolve(__dirname, './bitstampUSD_test.csv');

class BitcoinKlineTransformer extends Transform {

    private lastLine: string = '';

    constructor() {
        super({
            objectMode: true,
        });
    }

    _transform(chunk: any, _: BufferEncoding, callback: TransformCallback) {

        const rows = (this.lastLine + chunk.toString()).split('\n');
        this.lastLine = rows.pop();

        // Skip header row
        if (rows[0] && rows[0].includes('Timestamp')) rows.shift();

        const results = [];

        for (let i = 0; i < rows.length; i++) {
            const currentRow = rows[i];
            if (!currentRow) continue;

            const [timestamp, open, high, low, close, volume, volumeQuote] = currentRow.split(',');

            const closeDate = new Date(parseInt(timestamp) * 1000);
            const result = [
                'BTCUSDT',
                'btcusdt@kline_1m',
                '1m',
                subMinutes(closeDate, 1).toISOString(),
                subMilliseconds(closeDate, 1).toISOString(),
                parseFloat(open),
                parseFloat(high),
                parseFloat(low),
                parseFloat(close),
                parseFloat(volume),
                parseFloat(volumeQuote),
                0,
            ].join(',');

            results.push(result);
        }

        const result = results.join('\n') + '\n';
        pushWithBackpressure(this, result, () => {
            process.stdout.write('.');
            callback();
        });
    }
}

const transform = new BitcoinKlineTransformer();

db.connect((err, client, done) => {
    if(err) console.error('Error connecting to database', err);

    console.log(' -- Start importing candles -- ');
    console.time('Candle import');
    const stream = client.query(copyFrom("COPY candles FROM STDIN WITH CSV DELIMITER ',' "));
    const fileStream = createReadStream(fileName).pipe(transform);

    fileStream.on('error', (e) => {
        console.log('error', e);
        done();
    });

    stream.on('error', (e) => {
        console.log('error', e);
        done();
    });
    stream.on('finish', () => {
        process.stdout.write('\n');
        console.timeEnd('Candle import');
        console.log(' -- Candle import finished -- ');
        done();
    });

    fileStream.pipe(stream);
});
