import {
        MarketState,
        ParGoodState,
        GoodState,
        ParGoodData,
} from "../../generated/schema";

import {
        Address,
        BigDecimal,
        BigInt,
        bigDecimal,
        bigInt,
} from "@graphprotocol/graph-ts";

import {
        MARKET_ADDRESS,
        BI_128,
        ZERO_BI,
        ONE_BI,
        compareprice,
} from "./constants";

export function log_ParGoodData(
        normal_pargood: ParGoodState,
        modifiedTime: BigInt
): void {
        let data_hour = modifiedTime
                .mod(BigInt.fromU32(3660))
                .div(BigInt.fromU32(60));
        let pargoodData_hour = ParGoodData.load(
                normal_pargood.id + "h" + data_hour.toString()
        );
        let price = normal_pargood.currentValue
                .times(BI_128)
                .plus(normal_pargood.currentQuantity);
        if (pargoodData_hour === null) {
                pargoodData_hour = new ParGoodData(
                        normal_pargood.id + "h" + data_hour.toString()
                );
                pargoodData_hour.modifiedTime = ZERO_BI;

                pargoodData_hour.timetype = "h";
                pargoodData_hour.open = price;
                pargoodData_hour.high = price;
                pargoodData_hour.low = price;
                pargoodData_hour.close = price;
        }
        pargoodData_hour.timetype = "h";
        pargoodData_hour.pargood = normal_pargood.id;
        pargoodData_hour.decimals = normal_pargood.tokendecimals;
        pargoodData_hour.currentValue = normal_pargood.currentValue;
        pargoodData_hour.currentQuantity = normal_pargood.currentQuantity;
        pargoodData_hour.investValue = normal_pargood.investValue;
        pargoodData_hour.investQuantity = normal_pargood.investQuantity;
        pargoodData_hour.feeQuantity = normal_pargood.feeQuantity;
        pargoodData_hour.contructFee = normal_pargood.contructFee;
        pargoodData_hour.totalTradeQuantity = normal_pargood.totalTradeQuantity;
        pargoodData_hour.totalInvestQuantity =
                normal_pargood.totalInvestQuantity;
        pargoodData_hour.totalDisinvestQuantity =
                normal_pargood.totalDisinvestQuantity;
        pargoodData_hour.totalProfit = normal_pargood.totalProfit;
        pargoodData_hour.totalTradeCount = normal_pargood.totalTradeCount;
        pargoodData_hour.totalInvestCount = normal_pargood.totalInvestCount;
        pargoodData_hour.totalDisinvestCount =
                normal_pargood.totalDisinvestCount;

        if (
                pargoodData_hour.modifiedTime
                        .mod(BigInt.fromU32(3660))
                        .div(BigInt.fromU32(60)) <
                modifiedTime.mod(BigInt.fromU32(3660)).div(BigInt.fromU32(60))
        ) {
                pargoodData_hour.open = price;
        }
        if (compareprice(pargoodData_hour.high, price)) {
                pargoodData_hour.high = price;
        }

        if (compareprice(price, pargoodData_hour.low)) {
                pargoodData_hour.low = price;
        }
        if (
                modifiedTime.mod(BigInt.fromU32(3660)).div(BigInt.fromU32(60)) <
                modifiedTime
                        .plus(ONE_BI)
                        .mod(BigInt.fromU32(3660))
                        .div(BigInt.fromU32(60))
        ) {
                pargoodData_hour.close = price;
        }
        pargoodData_hour.modifiedTime = modifiedTime;
        pargoodData_hour.save();

        let data_day = modifiedTime
                .mod(BigInt.fromU32(174000))
                .div(BigInt.fromU32(1200));
        let pargoodData_day = ParGoodData.load(
                normal_pargood.id + "d" + data_day.toString()
        );
        if (pargoodData_day === null) {
                pargoodData_day = new ParGoodData(
                        normal_pargood.id + "d" + data_day.toString()
                );
                pargoodData_day.timetype = "d";
                pargoodData_day.modifiedTime = ZERO_BI;
                pargoodData_day.open = price;
                pargoodData_day.high = price;
                pargoodData_day.low = price;
                pargoodData_day.close = price;
        }
        if (
                pargoodData_day.modifiedTime.plus(BigInt.fromU32(60)) <=
                pargoodData_hour.modifiedTime
        ) {
                pargoodData_day.timetype = "d";
                pargoodData_day.pargood = pargoodData_hour.pargood;
                pargoodData_day.decimals = pargoodData_hour.decimals;
                pargoodData_day.currentValue = pargoodData_hour.currentValue;
                pargoodData_day.currentQuantity =
                        pargoodData_hour.currentQuantity;
                pargoodData_day.investValue = pargoodData_hour.investValue;
                pargoodData_day.investQuantity =
                        pargoodData_hour.investQuantity;
                pargoodData_day.feeQuantity = pargoodData_hour.feeQuantity;
                pargoodData_day.contructFee = pargoodData_hour.contructFee;
                pargoodData_day.totalTradeQuantity =
                        pargoodData_hour.totalTradeQuantity;
                pargoodData_day.totalInvestQuantity =
                        pargoodData_hour.totalInvestQuantity;
                pargoodData_day.totalDisinvestQuantity =
                        pargoodData_hour.totalDisinvestQuantity;
                pargoodData_day.totalProfit = pargoodData_hour.totalProfit;
                pargoodData_day.totalTradeCount =
                        pargoodData_hour.totalTradeCount;
                pargoodData_day.totalInvestCount =
                        pargoodData_hour.totalInvestCount;
                pargoodData_day.totalDisinvestCount =
                        pargoodData_hour.totalDisinvestCount;

                if (
                        pargoodData_day.modifiedTime
                                .mod(BigInt.fromU32(87600))
                                .div(BigInt.fromU32(1200)) <
                        modifiedTime
                                .mod(BigInt.fromU32(87600))
                                .div(BigInt.fromU32(1200))
                ) {
                        pargoodData_day.open = price;
                }

                if (compareprice(pargoodData_day.high, pargoodData_hour.high)) {
                        pargoodData_day.high = pargoodData_hour.high;
                }

                if (compareprice(pargoodData_hour.low, pargoodData_day.low)) {
                        pargoodData_day.low = pargoodData_hour.low;
                }
                if (
                        modifiedTime
                                .mod(BigInt.fromU32(87600))
                                .div(BigInt.fromU32(1200)) <
                        modifiedTime
                                .plus(BigInt.fromU32(1200))
                                .mod(BigInt.fromU32(87600))
                                .div(BigInt.fromU32(1200))
                ) {
                        pargoodData_day.close = price;
                }
                pargoodData_day.modifiedTime = modifiedTime;
                pargoodData_day.save();
        }

        let data_week = modifiedTime
                .mod(BigInt.fromU32(615600))
                .div(BigInt.fromU32(10800));
        let pargoodData_week = ParGoodData.load(
                normal_pargood.id + "w" + data_week.toString()
        );
        if (pargoodData_week === null) {
                pargoodData_week = new ParGoodData(
                        normal_pargood.id + "w" + data_week.toString()
                );
                pargoodData_week.timetype = "w";
                pargoodData_week.modifiedTime = ZERO_BI;
                pargoodData_week.open = price;
                pargoodData_week.high = price;
                pargoodData_week.low = price;
                pargoodData_week.close = price;
        }
        if (
                pargoodData_week.modifiedTime.plus(BigInt.fromU32(1200)) <=
                pargoodData_day.modifiedTime
        ) {
                pargoodData_week.timetype = "w";
                pargoodData_week.pargood = pargoodData_day.pargood;
                pargoodData_week.decimals = pargoodData_day.decimals;
                pargoodData_week.currentValue = pargoodData_day.currentValue;
                pargoodData_week.currentQuantity =
                        pargoodData_day.currentQuantity;
                pargoodData_week.investValue = pargoodData_day.investValue;
                pargoodData_week.investQuantity =
                        pargoodData_day.investQuantity;
                pargoodData_week.feeQuantity = pargoodData_day.feeQuantity;
                pargoodData_week.contructFee = pargoodData_day.contructFee;
                pargoodData_week.totalTradeQuantity =
                        pargoodData_day.totalTradeQuantity;
                pargoodData_week.totalInvestQuantity =
                        pargoodData_day.totalInvestQuantity;
                pargoodData_week.totalDisinvestQuantity =
                        pargoodData_day.totalDisinvestQuantity;
                pargoodData_week.totalProfit = pargoodData_day.totalProfit;
                pargoodData_week.totalTradeCount =
                        pargoodData_day.totalTradeCount;
                pargoodData_week.totalInvestCount =
                        pargoodData_day.totalInvestCount;
                pargoodData_week.totalDisinvestCount =
                        pargoodData_day.totalDisinvestCount;

                if (
                        pargoodData_week.modifiedTime
                                .mod(BigInt.fromU32(615600))
                                .div(BigInt.fromU32(10800)) <
                        modifiedTime
                                .mod(BigInt.fromU32(615600))
                                .div(BigInt.fromU32(10800))
                ) {
                        pargoodData_week.open = price;
                }
                if (compareprice(pargoodData_week.high, pargoodData_day.high)) {
                        pargoodData_week.high = pargoodData_day.high;
                }

                if (compareprice(pargoodData_day.low, pargoodData_week.low)) {
                        pargoodData_week.low = pargoodData_day.low;
                }
                if (
                        modifiedTime
                                .mod(BigInt.fromU32(615600))
                                .div(BigInt.fromU32(10800)) <
                        modifiedTime
                                .plus(BigInt.fromU32(1200))
                                .mod(BigInt.fromU32(615600))
                                .div(BigInt.fromU32(10800))
                ) {
                        pargoodData_week.close = price;
                }
                pargoodData_week.modifiedTime = modifiedTime;
                pargoodData_week.save();
        }

        let data_month = modifiedTime
                .mod(BigInt.fromU32(2721600))
                .div(BigInt.fromU32(43200));
        let pargoodData_month = ParGoodData.load(
                normal_pargood.id + "m" + data_month.toString()
        );
        if (pargoodData_month === null) {
                pargoodData_month = new ParGoodData(
                        normal_pargood.id + "m" + data_month.toString()
                );
                pargoodData_month.modifiedTime = ZERO_BI;

                pargoodData_month.timetype = "m";
                pargoodData_month.open = price;
                pargoodData_month.high = price;
                pargoodData_month.low = price;
                pargoodData_month.close = price;
        }
        if (
                pargoodData_month.modifiedTime.plus(BigInt.fromU32(10800)) <=
                pargoodData_week.modifiedTime
        ) {
                pargoodData_month.timetype = "m";
                pargoodData_month.pargood = pargoodData_week.pargood;
                pargoodData_month.decimals = pargoodData_week.decimals;
                pargoodData_month.currentValue = pargoodData_week.currentValue;
                pargoodData_month.currentQuantity =
                        pargoodData_week.currentQuantity;
                pargoodData_month.investValue = pargoodData_week.investValue;
                pargoodData_month.investQuantity =
                        pargoodData_week.investQuantity;
                pargoodData_month.feeQuantity = pargoodData_week.feeQuantity;
                pargoodData_month.contructFee = pargoodData_week.contructFee;
                pargoodData_month.totalTradeQuantity =
                        pargoodData_week.totalTradeQuantity;
                pargoodData_month.totalInvestQuantity =
                        pargoodData_week.totalInvestQuantity;
                pargoodData_month.totalDisinvestQuantity =
                        pargoodData_week.totalDisinvestQuantity;
                pargoodData_month.totalProfit = pargoodData_week.totalProfit;
                pargoodData_month.totalTradeCount =
                        pargoodData_week.totalTradeCount;
                pargoodData_month.totalInvestCount =
                        pargoodData_week.totalInvestCount;
                pargoodData_month.totalDisinvestCount =
                        pargoodData_week.totalDisinvestCount;

                if (
                        pargoodData_month.modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(43200)) <
                        modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(43200))
                ) {
                        pargoodData_month.open = price;
                }
                if (
                        compareprice(
                                pargoodData_month.high,
                                pargoodData_week.high
                        )
                ) {
                        pargoodData_month.high = pargoodData_week.high;
                }

                if (compareprice(pargoodData_week.low, pargoodData_month.low)) {
                        pargoodData_month.low = pargoodData_week.low;
                }
                if (
                        modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(43200)) <
                        modifiedTime
                                .plus(BigInt.fromU32(10800))
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(43200))
                ) {
                        pargoodData_month.close = price;
                }
                pargoodData_month.modifiedTime = modifiedTime;
                pargoodData_month.save();
        }

        let data_year = modifiedTime.div(BigInt.fromU32(432000));
        let pargoodData_year = ParGoodData.load(
                normal_pargood.id + "y" + data_year.toString()
        );
        if (pargoodData_year === null) {
                pargoodData_year = new ParGoodData(
                        normal_pargood.id + "y" + data_year.toString()
                );
                pargoodData_year.modifiedTime = ZERO_BI;

                pargoodData_year.timetype = "y";
                pargoodData_year.open = price;
                pargoodData_year.high = price;
                pargoodData_year.low = price;
                pargoodData_year.close = price;
        }
        if (
                pargoodData_year.modifiedTime.plus(BigInt.fromU32(43200)) <=
                pargoodData_month.modifiedTime
        ) {
                pargoodData_year.timetype = "y";
                pargoodData_year.pargood = pargoodData_month.pargood;
                pargoodData_year.decimals = pargoodData_month.decimals;
                pargoodData_year.currentValue = pargoodData_month.currentValue;
                pargoodData_year.currentQuantity =
                        pargoodData_month.currentQuantity;
                pargoodData_year.investValue = pargoodData_month.investValue;
                pargoodData_year.investQuantity =
                        pargoodData_month.investQuantity;
                pargoodData_year.feeQuantity = pargoodData_month.feeQuantity;
                pargoodData_year.contructFee = pargoodData_month.contructFee;
                pargoodData_year.totalTradeQuantity =
                        pargoodData_month.totalTradeQuantity;
                pargoodData_year.totalInvestQuantity =
                        pargoodData_month.totalInvestQuantity;
                pargoodData_year.totalDisinvestQuantity =
                        pargoodData_month.totalDisinvestQuantity;
                pargoodData_year.totalProfit = pargoodData_month.totalProfit;
                pargoodData_year.totalTradeCount =
                        pargoodData_month.totalTradeCount;
                pargoodData_year.totalInvestCount =
                        pargoodData_month.totalInvestCount;
                pargoodData_year.totalDisinvestCount =
                        pargoodData_month.totalDisinvestCount;

                if (
                        pargoodData_year.modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(432000)) <
                        modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(432000))
                ) {
                        pargoodData_year.open = price;
                }
                if (
                        compareprice(
                                pargoodData_year.high,
                                pargoodData_month.high
                        )
                ) {
                        pargoodData_year.high = pargoodData_month.high;
                }

                if (compareprice(pargoodData_month.low, pargoodData_year.low)) {
                        pargoodData_year.low = pargoodData_month.low;
                }
                if (
                        modifiedTime
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(432000)) <
                        modifiedTime
                                .plus(BigInt.fromU32(43200))
                                .mod(BigInt.fromU32(2721600))
                                .div(BigInt.fromU32(432000))
                ) {
                        pargoodData_year.close = price;
                }
                pargoodData_year.modifiedTime = modifiedTime;
                pargoodData_year.save();
        }
}
