create database socktrader
    with
    owner = pi
    encoding = 'utf8'
    connection limit = -1;

create table candles
(
    id            serial,
    symbol        varchar,
    stream        varchar,
    interval      varchar,
    open_time     timestamp,
    close_time    timestamp,
    open          double precision,
    high          double precision,
    low           double precision,
    close         double precision,
    volume        numeric,
    quote_volume  numeric
);

create unique index candles_id_uindex
    on candles (id);

alter table candles
    add constraint candles_pk
        primary key (id);

create table orders
(
    id                        serial,
    symbol                    varchar,
    order_id                  numeric,
    client_order_id           varchar,
    price                     double precision,
    original_quantity         double precision,
    executed_quantity         double precision,
    cumulative_quote_quantity double precision,
    status                    varchar,
    type                      varchar,
    side                      varchar,
    fk_trading_session        varchar
);

create unique index orders_id_uindex
    on orders (id);

alter table orders
    add constraint orders_pk
        primary key (id);

create table trades
(
);

create table trading_session
(
    id         serial,
    session_id varchar(255) not null
);

create unique index trading_session_id_uindex
    on trading_session (id);

create unique index trading_session_session_id_uindex
    on trading_session (session_id);

alter table trading_session
    add constraint trading_session_pk
        primary key (id);


