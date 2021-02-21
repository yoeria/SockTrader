import * as Sentry from '@sentry/node';
import {config} from "./socktrader.config";

Sentry.init({
    dsn: config.sentry.dsn,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: config.sentry.tracesSampleRate,
});
