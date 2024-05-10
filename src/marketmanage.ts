import { Address, BigDecimal, BigInt, bigInt } from "@graphprotocol/graph-ts";

import {
        MarketState,
        ParGoodState,
        GoodState,
        ProofState,
        GoodData,
        MarketData,
        Transaction,
        Customer,
} from "../generated/schema";

import {
        InitMetaGoodCall,
        SetMarketConfigCall,
        InitNormalGoodCall,
        InvestValueGoodCall,
        DisinvestValueGoodCall,
        DisinvestValueProofCall,
        InvestNormalGoodCall,
        DisinvestNormalGoodCall,
        DisinvestNormalProofCall,
        UpdatetoValueGoodCall,
        UpdatetoNormalGoodCall,
        UpdateGoodConfigCall,
        AddbanlistCall,
        RemovebanlistCall,
        AddrefererCall,
        MarketManager,
        e_proof,
        e_buyGood,
        e_buyGoodForPay,
} from "../generated/MarketManager/MarketManager";

import { MARKET_ADDRESS, BI_128, ZERO_BI, ONE_BI } from "./util/constants";

import {
        fetchTokenSymbol,
        fetchTokenName,
        fetchTokenTotalSupply,
        fetchTokenDecimals,
} from "./util/token";

import { log_GoodData } from "./util/goodData";
import { log_ParGoodData } from "./util/pargoodData";
import { log_MarketData } from "./util/marketData";
//ok
export function handle_fn_setMarketConfig(call: SetMarketConfigCall): void {
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        marketstate.marketCreator = call.transaction.from.toHexString();
        marketstate.marketConfig = call.inputs._marketconfig;
        marketstate.save();
}

//ok
export function handle_fn_initMetaGood(call: InitMetaGoodCall): void {
        let addresserc = call.from;
        let erc20address = call.inputs._erc20address.toHexString();
        let metaowner = call.from.toHexString();
        let metaid = call.outputs.value0.toString();
        let proofid = call.outputs.value1.toString();
        let modifiedTime = call.block.timestamp;
        let trade_value = call.inputs._initial.div(BI_128);
        let trade_quantity = call.inputs._initial.mod(BI_128);

        let newcustomer = new Customer(metaowner);
        newcustomer.refer = "#";
        newcustomer.tradeValue = ZERO_BI;
        newcustomer.investValue = trade_value;
        newcustomer.disinvestValue = ZERO_BI;
        newcustomer.tradeCount = ZERO_BI;
        newcustomer.investCount = BigInt.fromU32(1);
        newcustomer.disinvestCount = ZERO_BI;
        newcustomer.isBanlist = false;
        newcustomer.save();

        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        marketstate.totalInvestValue = trade_value;
        marketstate.userCount = BigInt.fromU32(1);
        marketstate.txCount = BigInt.fromU32(1);
        marketstate.goodCount = BigInt.fromU32(1);
        marketstate.pargoodCount = BigInt.fromU32(1);
        marketstate.totalInvestCount = BigInt.fromU32(1);
        marketstate.save();

        let goodConfig = call.inputs._goodConfig;
        let meta_pargood = new ParGoodState(erc20address);
        meta_pargood.tokenname = fetchTokenName(addresserc);
        meta_pargood.tokensymbol = fetchTokenSymbol(addresserc);
        meta_pargood.tokentotalsuply = fetchTokenTotalSupply(addresserc);
        meta_pargood.tokendecimals = fetchTokenDecimals(addresserc);
        meta_pargood.erc20Address = erc20address;
        meta_pargood.currentValue = trade_value;
        meta_pargood.currentQuantity = trade_quantity;
        meta_pargood.investValue = trade_value;
        meta_pargood.investQuantity = trade_quantity;
        meta_pargood.feeQuantity = ZERO_BI;
        meta_pargood.contructFee = ZERO_BI;
        meta_pargood.totalTradeQuantity = ZERO_BI;
        meta_pargood.totalInvestQuantity = trade_quantity;
        meta_pargood.totalDisinvestQuantity = ZERO_BI;
        meta_pargood.totalProfit = ZERO_BI;
        meta_pargood.totalTradeCount = ZERO_BI;
        meta_pargood.totalInvestCount = ONE_BI;
        meta_pargood.totalDisinvestCount = ZERO_BI;
        meta_pargood.goodCount = BigInt.fromU32(1);
        meta_pargood.txCount = ONE_BI;
        meta_pargood.save();

        let meta_good = new GoodState(metaid);
        meta_good.pargood = meta_pargood.id;
        meta_good.tokenname = fetchTokenName(addresserc);
        meta_good.tokensymbol = fetchTokenSymbol(addresserc);
        meta_good.tokentotalsuply = fetchTokenTotalSupply(addresserc);
        meta_good.tokendecimals = fetchTokenDecimals(addresserc);
        meta_good.owner = metaowner;
        meta_good.erc20Address = erc20address;
        meta_good.goodConfig = goodConfig;
        meta_good.currentValue = trade_value;
        meta_good.currentQuantity = trade_quantity;
        meta_good.investValue = trade_value;
        meta_good.investQuantity = trade_quantity;
        meta_good.feeQuantity = ZERO_BI;
        meta_good.contructFee = ZERO_BI;
        meta_good.totalTradeQuantity = ZERO_BI;
        meta_good.totalInvestQuantity = ZERO_BI;
        meta_good.totalDisinvestQuantity = ZERO_BI;
        meta_good.totalProfit = ZERO_BI;
        meta_good.totalTradeCount = ZERO_BI;
        meta_good.totalInvestCount = ONE_BI;
        meta_good.totalDisinvestCount = ZERO_BI;
        meta_good.modifiedTime = call.block.timestamp;
        meta_good.txCount = ONE_BI;
        meta_good.save();

        let null_good = new GoodState("#");
        null_good.tokenname = "#";
        null_good.tokensymbol = "#";
        null_good.tokentotalsuply = ZERO_BI;
        null_good.tokendecimals = ZERO_BI;
        null_good.owner = "#";
        null_good.erc20Address = "#";
        null_good.goodConfig = ZERO_BI;
        null_good.currentValue = ZERO_BI;
        null_good.currentQuantity = ZERO_BI;
        null_good.investValue = ZERO_BI;
        null_good.investQuantity = ZERO_BI;
        null_good.feeQuantity = ZERO_BI;
        null_good.contructFee = ZERO_BI;
        null_good.totalTradeQuantity = ZERO_BI;
        null_good.totalInvestQuantity = ZERO_BI;
        null_good.totalDisinvestQuantity = ZERO_BI;
        null_good.totalProfit = ZERO_BI;
        null_good.totalTradeCount = ZERO_BI;
        null_good.totalInvestCount = ZERO_BI;
        null_good.totalDisinvestCount = ZERO_BI;
        null_good.modifiedTime = modifiedTime;
        null_good.txCount = ZERO_BI;
        null_good.save();

        let proof = new ProofState(proofid);
        proof.owner = metaowner;
        proof.good1 = meta_good.id;
        proof.good2 = null_good.id;
        proof.proofValue = trade_value;
        proof.good1ContructFee = ZERO_BI;
        proof.good1Quantity = trade_quantity;
        proof.good2ContructFee = ZERO_BI;
        proof.good2Quantity = ZERO_BI;
        proof.createTime = modifiedTime;
        proof.save();

        let transid =
                meta_good.id.toString() +
                meta_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = meta_good.id;
                tx.togood = null_good.id;
                tx.frompargood = meta_pargood.id;
                tx.topargood = null_good.id;
                tx.fromgoodQuanity = trade_quantity;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "metagood";
        tx.fromgood = meta_good.id;
        tx.togood = meta_good.id;
        tx.frompargood = meta_pargood.id;
        tx.topargood = meta_pargood.id;
        tx.fromgoodQuanity = trade_quantity;
        tx.fromgoodfee = ZERO_BI;
        tx.togoodQuantity = ZERO_BI;
        tx.togoodfee = ZERO_BI;
        tx.timestamp = call.block.timestamp;
        tx.save();

        let data_hour = modifiedTime
                .mod(BigInt.fromU32(3600))
                .div(BigInt.fromU32(60));
        let goodData_hour = GoodData.load(
                meta_good.id + "h" + data_hour.toString()
        );
        if (goodData_hour === null) {
                goodData_hour = new GoodData(
                        meta_good.id + "h" + data_hour.toString()
                );
                goodData_hour.modifiedTime = ZERO_BI;
        }
        goodData_hour.good = meta_good.id;
        goodData_hour.decimals = meta_good.tokendecimals;
        goodData_hour.currentValue = meta_good.currentValue;
        goodData_hour.currentQuantity = meta_good.currentQuantity;
        goodData_hour.investValue = meta_good.investValue;
        goodData_hour.investQuantity = meta_good.investQuantity;
        goodData_hour.feeQuantity = meta_good.feeQuantity;
        goodData_hour.contructFee = meta_good.contructFee;
        goodData_hour.totalTradeQuantity = meta_good.totalTradeQuantity;
        goodData_hour.totalInvestQuantity = meta_good.totalInvestQuantity;
        goodData_hour.totalDisinvestQuantity = meta_good.totalDisinvestQuantity;
        goodData_hour.totalProfit = meta_good.totalProfit;
        goodData_hour.totalTradeCount = meta_good.totalTradeCount;
        goodData_hour.totalInvestCount = meta_good.totalInvestCount;
        goodData_hour.totalDisinvestCount = meta_good.totalDisinvestCount;
        let price = (goodData_hour.open = goodData_hour.currentValue
                .toBigDecimal()
                .div(goodData_hour.currentQuantity.toBigDecimal()));
        if (
                goodData_hour.modifiedTime
                        .mod(BigInt.fromU32(3600))
                        .div(BigInt.fromU32(60)) <
                modifiedTime.mod(BigInt.fromU32(3600)).div(BigInt.fromU32(60))
        ) {
                goodData_hour.open = price;
        }
        if (goodData_hour.high < price) {
                goodData_hour.high = price;
        }

        if (goodData_hour.low > price) {
                goodData_hour.low = price;
        }
        if (
                modifiedTime.mod(BigInt.fromU32(3600)).div(BigInt.fromU32(60)) <
                modifiedTime
                        .plus(ONE_BI)
                        .mod(BigInt.fromU32(3600))
                        .div(BigInt.fromU32(60))
        ) {
                goodData_hour.close = price;
        }
        goodData_hour.modifiedTime = modifiedTime;
        goodData_hour.save();

        let pargoodData_hour = GoodData.load(
                meta_pargood.id + "h" + data_hour.toString()
        );
        if (pargoodData_hour === null) {
                pargoodData_hour = new GoodData(
                        meta_pargood.id + "h" + data_hour.toString()
                );
                pargoodData_hour.modifiedTime = ZERO_BI;
        }
        pargoodData_hour.good = meta_pargood.id;
        pargoodData_hour.decimals = meta_good.tokendecimals;
        pargoodData_hour.currentValue = meta_good.currentValue;
        pargoodData_hour.currentQuantity = meta_good.currentQuantity;
        pargoodData_hour.investValue = meta_good.investValue;
        pargoodData_hour.investQuantity = meta_good.investQuantity;
        pargoodData_hour.feeQuantity = meta_good.feeQuantity;
        pargoodData_hour.contructFee = meta_good.contructFee;
        pargoodData_hour.totalTradeQuantity = meta_good.totalTradeQuantity;
        pargoodData_hour.totalInvestQuantity = meta_good.totalInvestQuantity;
        pargoodData_hour.totalDisinvestQuantity =
                meta_good.totalDisinvestQuantity;
        pargoodData_hour.totalProfit = meta_good.totalProfit;
        pargoodData_hour.totalTradeCount = meta_good.totalTradeCount;
        pargoodData_hour.totalInvestCount = meta_good.totalInvestCount;
        pargoodData_hour.totalDisinvestCount = meta_good.totalDisinvestCount;
        let parprice = (pargoodData_hour.open = pargoodData_hour.currentValue
                .toBigDecimal()
                .div(pargoodData_hour.currentQuantity.toBigDecimal()));
        if (
                pargoodData_hour.modifiedTime
                        .mod(BigInt.fromU32(3600))
                        .div(BigInt.fromU32(60)) <
                modifiedTime.mod(BigInt.fromU32(3600)).div(BigInt.fromU32(60))
        ) {
                pargoodData_hour.open = parprice;
        }
        if (pargoodData_hour.high < parprice) {
                pargoodData_hour.high = parprice;
        }

        if (pargoodData_hour.low > parprice) {
                pargoodData_hour.low = parprice;
        }
        if (
                modifiedTime.mod(BigInt.fromU32(3600)).div(BigInt.fromU32(60)) <
                modifiedTime
                        .plus(ONE_BI)
                        .mod(BigInt.fromU32(3600))
                        .div(BigInt.fromU32(60))
        ) {
                pargoodData_hour.close = parprice;
        }
        pargoodData_hour.modifiedTime = modifiedTime;
        pargoodData_hour.save();

        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
        log_MarketData(marketstate, modifiedTime);
}

//ok
export function handle_fn_initNormalGood(call: InitNormalGoodCall): void {
        let marketmanage = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        );
        let addresserc = call.inputs._erc20address;
        let erc20address = call.inputs._erc20address.toHexString();
        let valuegoodid = call.inputs._valuegood;
        let normalgoodid = call.outputs.value0.toString();
        let proofid_BG = call.outputs.value1;
        let proofstate = marketmanage.try_getProofState(proofid_BG);
        let trade_value = ZERO_BI;
        let trade_valuegood_quantity = ZERO_BI;
        let trade_valuegood_contruct = ZERO_BI;
        let trade_normalgood_quantity = ZERO_BI;
        let trade_normalgood_contruct = ZERO_BI;
        if (!proofstate.reverted) {
                trade_value = proofstate.value.state.div(BI_128);
                trade_normalgood_quantity = proofstate.value.invest.mod(BI_128);
                trade_normalgood_contruct = proofstate.value.invest.div(BI_128);
                trade_valuegood_quantity =
                        proofstate.value.valueinvest.mod(BI_128);
                trade_valuegood_contruct =
                        proofstate.value.valueinvest.div(BI_128);
        }
        let valuegoodfee = call.inputs._initial
                .mod(BI_128)
                .minus(trade_valuegood_quantity);
        let modifiedTime = call.block.timestamp;
        let goodConfig = call.inputs._goodConfig;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }

        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }
        newcustomer.investValue = newcustomer.investValue.plus(trade_value);
        newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);
        newcustomer.save();

        let normal_pargood = ParGoodState.load(erc20address);
        if (normal_pargood === null) {
                normal_pargood = new ParGoodState(erc20address);
                normal_pargood.tokenname = fetchTokenName(addresserc);
                normal_pargood.tokensymbol = fetchTokenSymbol(addresserc);
                normal_pargood.tokentotalsuply =
                        fetchTokenTotalSupply(addresserc);
                normal_pargood.tokendecimals = fetchTokenDecimals(addresserc);
                normal_pargood.erc20Address = erc20address;
                normal_pargood.currentValue = ZERO_BI;
                normal_pargood.currentQuantity = ZERO_BI;
                normal_pargood.investValue = ZERO_BI;
                normal_pargood.investQuantity = ZERO_BI;
                normal_pargood.feeQuantity = ZERO_BI;
                normal_pargood.contructFee = ZERO_BI;
                normal_pargood.totalTradeQuantity = ZERO_BI;
                normal_pargood.totalInvestQuantity = ZERO_BI;
                normal_pargood.totalDisinvestQuantity = ZERO_BI;
                normal_pargood.totalProfit = ZERO_BI;
                normal_pargood.totalTradeCount = ZERO_BI;
                normal_pargood.totalInvestCount = ZERO_BI;
                normal_pargood.totalDisinvestCount = ZERO_BI;
                normal_pargood.goodCount = ZERO_BI;
                normal_pargood.txCount = ZERO_BI;
                marketstate.pargoodCount =
                        marketstate.pargoodCount.plus(ONE_BI);
        }

        normal_pargood.currentValue =
                normal_pargood.currentValue.plus(trade_value);
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.plus(
                trade_normalgood_quantity
        );
        normal_pargood.investValue =
                normal_pargood.investValue.plus(trade_value);
        normal_pargood.investQuantity = normal_pargood.investQuantity.plus(
                trade_normalgood_quantity
        );
        // normal_pargood.feeQuantity = ZERO_BI;
        // normal_pargood.contructFee = ZERO_BI;
        normal_pargood.totalInvestQuantity =
                normal_pargood.totalInvestQuantity.plus(
                        trade_normalgood_quantity
                );
        normal_pargood.totalInvestCount =
                normal_pargood.totalInvestCount.plus(ONE_BI);
        normal_pargood.goodCount = normal_pargood.goodCount.plus(ONE_BI);
        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.modifiedTime = modifiedTime;
                normal_good.pargood = normal_pargood.id;
                normal_good.tokenname = fetchTokenName(addresserc);
                normal_good.tokensymbol = fetchTokenSymbol(addresserc);
                normal_good.tokentotalsuply = fetchTokenTotalSupply(addresserc);
                normal_good.tokendecimals = fetchTokenDecimals(addresserc);
                normal_good.owner = "#";
                normal_good.erc20Address = "#";
                normal_good.goodConfig = ZERO_BI;
                normal_good.currentValue = ZERO_BI;
                normal_good.currentQuantity = ZERO_BI;
                normal_good.investValue = ZERO_BI;
                normal_good.investQuantity = ZERO_BI;
                normal_good.feeQuantity = ZERO_BI;
                normal_good.contructFee = ZERO_BI;
                normal_good.totalTradeQuantity = ZERO_BI;
                normal_good.totalInvestQuantity = ZERO_BI;
                normal_good.totalDisinvestQuantity = ZERO_BI;
                normal_good.totalProfit = ZERO_BI;
                normal_good.totalTradeCount = ZERO_BI;
                normal_good.totalInvestCount = ZERO_BI;
                normal_good.totalDisinvestCount = ZERO_BI;
                normal_good.modifiedTime = ZERO_BI;
                normal_good.txCount = ZERO_BI;
                marketstate.goodCount = marketstate.goodCount.plus(ONE_BI);
        }

        normal_good.goodConfig = goodConfig;
        normal_good.currentValue = trade_value;
        normal_good.currentQuantity = trade_normalgood_quantity;
        normal_good.investValue = trade_value;
        normal_good.investQuantity = trade_normalgood_quantity;
        normal_good.totalInvestQuantity = trade_normalgood_quantity;
        normal_good.totalInvestCount = ONE_BI;
        normal_good.modifiedTime = modifiedTime;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

        let transaction = Transaction.load(call.transaction.hash.toHexString());
        if (transaction === null) {
                transaction = new Transaction(
                        call.transaction.hash.toHexString()
                );
        }
        transaction.blockNumber = call.block.number;
        transaction.timestamp = call.block.timestamp;
        transaction.save();

        let value_pargood = ParGoodState.load(valuegoodid.toString());
        if (value_pargood === null) {
                value_pargood = new ParGoodState(valuegoodid.toString());
                value_pargood.tokenname = fetchTokenName(addresserc);
                value_pargood.tokensymbol = fetchTokenSymbol(addresserc);
                value_pargood.tokentotalsuply =
                        fetchTokenTotalSupply(addresserc);
                value_pargood.tokendecimals = fetchTokenDecimals(addresserc);
                value_pargood.erc20Address = erc20address;
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
                value_pargood.txCount = ZERO_BI;
        }
        let value_good = GoodState.load(valuegoodid.toString());
        if (value_good === null) {
                value_good = new GoodState(valuegoodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }
        value_pargood.currentValue = value_pargood.currentValue.minus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.minus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.minus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.minus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.minus(
                value_good.contructFee
        );
        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(valuegoodid);
        if (!goodcurrentstate.reverted) {
                value_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                value_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                value_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                value_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                value_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                value_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }

        value_pargood.currentValue = value_pargood.currentValue.plus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.plus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.plus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.plus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.plus(
                value_good.contructFee
        );

        value_good.totalInvestQuantity = value_good.totalInvestQuantity.plus(
                call.inputs._initial.mod(BI_128)
        );
        value_good.totalInvestCount = value_good.totalInvestCount.plus(ONE_BI);
        value_good.modifiedTime = modifiedTime;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        value_pargood.totalInvestQuantity =
                value_pargood.totalInvestQuantity.plus(
                        trade_normalgood_quantity
                );
        value_pargood.totalInvestCount =
                value_pargood.totalInvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();

        let proof = new ProofState(proofid_BG.toString());
        proof.owner = call.from.toHexString();
        proof.good1 = normal_good.id;
        proof.good2 = value_good.id;
        proof.proofValue = trade_value;
        proof.good1ContructFee = trade_normalgood_contruct;
        proof.good1Quantity = trade_normalgood_quantity;
        proof.good2ContructFee = trade_valuegood_contruct;
        proof.good2Quantity = trade_valuegood_quantity;
        proof.createTime = modifiedTime;
        proof.save();

        marketstate.totalInvestValue =
                marketstate.totalInvestValue.plus(trade_value);
        marketstate.totalInvestValue =
                marketstate.totalInvestValue.plus(trade_value);
        marketstate.totalInvestCount =
                marketstate.totalInvestCount.plus(ONE_BI);
        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.proofCount = marketstate.proofCount.plus(ONE_BI);
        marketstate.save();

        let transid =
                normal_good.id.toString() +
                normal_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = normal_good.id;
                tx.togood = value_good.id;
                tx.frompargood = normal_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "initnormalgood";
        tx.fromgood = normal_good.id;
        tx.togood = value_good.id;
        tx.frompargood = normal_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = trade_normalgood_quantity;
        tx.togoodQuantity = trade_valuegood_quantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(value_good, modifiedTime);
        log_ParGoodData(value_pargood, modifiedTime);

        log_GoodData(normal_good, modifiedTime);
        log_ParGoodData(normal_pargood, modifiedTime);
        log_MarketData(marketstate, modifiedTime);
}
//trade
export function handle_e_buyGood(event: e_buyGood): void {
        let fromgood = event.params.sellgood;
        let togood = event.params.forgood;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }

        let from_good = GoodState.load(fromgood.toString());
        if (from_good === null) {
                from_good = new GoodState(fromgood.toString());
                from_good.pargood = "#";
                from_good.tokenname = "#";
                from_good.tokensymbol = "#";
                from_good.tokentotalsuply = ZERO_BI;
                from_good.tokendecimals = ZERO_BI;
                from_good.owner = "#";
                from_good.erc20Address = "#";
                from_good.goodConfig = ZERO_BI;
                from_good.currentValue = ZERO_BI;
                from_good.currentQuantity = ZERO_BI;
                from_good.investValue = ZERO_BI;
                from_good.investQuantity = ZERO_BI;
                from_good.feeQuantity = ZERO_BI;
                from_good.contructFee = ZERO_BI;
                from_good.totalTradeQuantity = ZERO_BI;
                from_good.totalInvestQuantity = ZERO_BI;
                from_good.totalDisinvestQuantity = ZERO_BI;
                from_good.totalProfit = ZERO_BI;
                from_good.totalTradeCount = ZERO_BI;
                from_good.totalInvestCount = ZERO_BI;
                from_good.totalDisinvestCount = ZERO_BI;
                from_good.modifiedTime = ZERO_BI;
                from_good.txCount = ZERO_BI;
        }

        let from_pargood = ParGoodState.load(from_good.erc20Address);
        if (from_pargood === null) {
                from_pargood = new ParGoodState(from_good.erc20Address);
                from_pargood.tokenname = "#";
                from_pargood.tokensymbol = "#";
                from_pargood.tokentotalsuply = ZERO_BI;
                from_pargood.tokendecimals = ZERO_BI;
                from_pargood.erc20Address = "#";
                from_pargood.currentValue = ZERO_BI;
                from_pargood.currentQuantity = ZERO_BI;
                from_pargood.investValue = ZERO_BI;
                from_pargood.investQuantity = ZERO_BI;
                from_pargood.feeQuantity = ZERO_BI;
                from_pargood.contructFee = ZERO_BI;
                from_pargood.totalTradeQuantity = ZERO_BI;
                from_pargood.totalInvestQuantity = ZERO_BI;
                from_pargood.totalDisinvestQuantity = ZERO_BI;
                from_pargood.totalProfit = ZERO_BI;
                from_pargood.totalTradeCount = ZERO_BI;
                from_pargood.totalInvestCount = ZERO_BI;
                from_pargood.totalDisinvestCount = ZERO_BI;
                from_pargood.goodCount = ZERO_BI;
                from_pargood.txCount = ZERO_BI;
        }
        from_pargood.currentValue = from_pargood.currentValue.minus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.minus(
                from_good.currentQuantity
        );
        from_pargood.investValue = from_pargood.investValue.minus(
                from_good.investValue
        );
        from_pargood.investQuantity = from_pargood.investQuantity.minus(
                from_good.investQuantity
        );
        from_pargood.feeQuantity = from_pargood.feeQuantity.minus(
                from_good.feeQuantity
        );
        from_pargood.contructFee = from_pargood.contructFee.minus(
                from_good.contructFee
        );

        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(fromgood);
        if (!goodcurrentstate.reverted) {
                from_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                from_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                from_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                from_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                from_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                from_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        from_pargood.currentValue = from_pargood.currentValue.plus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.plus(
                from_good.currentQuantity
        );
        from_pargood.investValue = from_pargood.investValue.plus(
                from_good.investValue
        );
        from_pargood.investQuantity = from_pargood.investQuantity.plus(
                from_good.investQuantity
        );
        from_pargood.feeQuantity = from_pargood.feeQuantity.plus(
                from_good.feeQuantity
        );
        from_pargood.contructFee = from_pargood.contructFee.plus(
                from_good.contructFee
        );

        from_good.totalTradeCount = from_good.totalTradeCount.plus(ONE_BI);
        from_good.totalTradeQuantity =
                from_good.totalTradeQuantity.plus(BI_128);

        from_good.txCount = from_good.txCount.plus(ONE_BI);
        from_good.modifiedTime = event.block.timestamp;
        from_good.save();

        from_pargood.totalTradeQuantity = from_pargood.totalTradeQuantity.plus(
                event.params.sellgoodstate.div(BI_128)
        );
        from_pargood.totalTradeCount =
                from_pargood.totalTradeCount.plus(ONE_BI);
        from_pargood.txCount = from_pargood.txCount.plus(ONE_BI);
        from_pargood.save();

        let to_good = GoodState.load(togood.toString());
        if (to_good === null) {
                to_good = new GoodState(togood.toString());
                to_good.pargood = "#";
                to_good.tokenname = "#";
                to_good.tokensymbol = "#";
                to_good.tokentotalsuply = ZERO_BI;
                to_good.tokendecimals = ZERO_BI;
                to_good.owner = "#";
                to_good.erc20Address = "#";
                to_good.goodConfig = ZERO_BI;
                to_good.currentValue = ZERO_BI;
                to_good.currentQuantity = ZERO_BI;
                to_good.investValue = ZERO_BI;
                to_good.investQuantity = ZERO_BI;
                to_good.feeQuantity = ZERO_BI;
                to_good.contructFee = ZERO_BI;
                to_good.totalTradeQuantity = ZERO_BI;
                to_good.totalInvestQuantity = ZERO_BI;
                to_good.totalDisinvestQuantity = ZERO_BI;
                to_good.totalProfit = ZERO_BI;
                to_good.totalTradeCount = ZERO_BI;
                to_good.totalInvestCount = ZERO_BI;
                to_good.totalDisinvestCount = ZERO_BI;
                to_good.modifiedTime = ZERO_BI;
                to_good.txCount = ZERO_BI;
        }

        let to_pargood = ParGoodState.load(to_good.erc20Address);
        if (to_pargood === null) {
                to_pargood = new ParGoodState(to_good.erc20Address);
                to_pargood.tokenname = "#";
                to_pargood.tokensymbol = "#";
                to_pargood.tokentotalsuply = ZERO_BI;
                to_pargood.tokendecimals = ZERO_BI;
                to_pargood.erc20Address = "#";
                to_pargood.currentValue = ZERO_BI;
                to_pargood.currentQuantity = ZERO_BI;
                to_pargood.investValue = ZERO_BI;
                to_pargood.investQuantity = ZERO_BI;
                to_pargood.feeQuantity = ZERO_BI;
                to_pargood.contructFee = ZERO_BI;
                to_pargood.totalTradeQuantity = ZERO_BI;
                to_pargood.totalInvestQuantity = ZERO_BI;
                to_pargood.totalDisinvestQuantity = ZERO_BI;
                to_pargood.totalProfit = ZERO_BI;
                to_pargood.totalTradeCount = ZERO_BI;
                to_pargood.totalInvestCount = ZERO_BI;
                to_pargood.totalDisinvestCount = ZERO_BI;
                to_pargood.goodCount = ZERO_BI;
                to_pargood.txCount = ZERO_BI;
        }
        to_pargood.totalTradeCount = to_pargood.totalTradeCount.plus(ONE_BI);
        to_pargood.currentValue = to_pargood.currentValue.minus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.minus(
                to_good.currentQuantity
        );
        to_pargood.investValue = to_pargood.investValue.minus(
                to_good.investValue
        );
        to_pargood.investQuantity = to_pargood.investQuantity.minus(
                to_good.investQuantity
        );
        to_pargood.feeQuantity = to_pargood.feeQuantity.minus(
                to_good.feeQuantity
        );
        to_pargood.contructFee = to_pargood.contructFee.minus(
                to_good.contructFee
        );

        let togoodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(togood);
        if (!togoodcurrentstate.reverted) {
                to_good.currentValue =
                        togoodcurrentstate.value.currentState.div(BI_128);
                to_good.currentQuantity =
                        togoodcurrentstate.value.currentState.mod(BI_128);
                to_good.investValue =
                        togoodcurrentstate.value.investState.div(BI_128);
                to_good.investQuantity =
                        togoodcurrentstate.value.investState.mod(BI_128);
                to_good.feeQuantity =
                        togoodcurrentstate.value.feeQunitityState.div(BI_128);
                to_good.contructFee =
                        togoodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        to_pargood.currentValue = to_pargood.currentValue.plus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.plus(
                to_good.currentQuantity
        );
        to_pargood.investValue = to_pargood.investValue.plus(
                to_good.investValue
        );
        to_pargood.investQuantity = to_pargood.investQuantity.plus(
                to_good.investQuantity
        );
        to_pargood.feeQuantity = to_pargood.feeQuantity.plus(
                to_good.feeQuantity
        );
        to_pargood.contructFee = to_pargood.contructFee.plus(
                to_good.contructFee
        );

        to_good.totalTradeCount = to_good.totalTradeCount.plus(ONE_BI);
        to_good.totalTradeQuantity = to_good.totalTradeQuantity.plus(
                event.params.forgoodstate.div(BI_128)
        );

        to_good.modifiedTime = event.block.timestamp;
        to_good.txCount = to_good.txCount.plus(ONE_BI);
        to_good.save();

        to_pargood.totalTradeQuantity = to_pargood.totalTradeQuantity.plus(
                event.params.forgoodstate.div(BI_128)
        );
        to_pargood.totalTradeCount = to_pargood.totalTradeCount.plus(ONE_BI);
        to_pargood.txCount = to_pargood.txCount.plus(ONE_BI);
        to_pargood.save();

        let newcustomer = Customer.load(event.transaction.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(
                        event.transaction.from.toHexString()
                );
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }

        newcustomer.tradeValue = newcustomer.tradeValue.plus(
                event.params.swapvalue
        );
        newcustomer.tradeCount = newcustomer.tradeCount.plus(ONE_BI);
        newcustomer.save();

        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.totalTradeCount = marketstate.totalTradeCount.plus(ONE_BI);
        marketstate.totalTradeValue = marketstate.totalTradeValue.plus(
                event.params.swapvalue
        );
        marketstate.save();

        let transid =
                from_good.id.toString() +
                from_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = from_good.id;
                tx.togood = to_good.id;
                tx.frompargood = from_pargood.id;
                tx.topargood = to_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = event.block.number;
        tx.transtype = "buy";
        tx.fromgood = from_good.id;
        tx.togood = to_good.id;
        tx.frompargood = from_pargood.id;
        tx.topargood = to_pargood.id;
        tx.fromgoodQuanity = event.params.sellgoodstate.div(BI_128);
        tx.togoodQuantity = event.params.forgoodstate.div(BI_128);
        tx.timestamp = event.block.timestamp;
        tx.save();

        log_GoodData(from_good, event.block.timestamp);
        log_ParGoodData(from_pargood, event.block.timestamp);
        log_GoodData(to_good, event.block.timestamp);
        log_ParGoodData(to_pargood, event.block.timestamp);
        log_MarketData(marketstate, event.block.timestamp);
}
// ok
export function handle_e_buyGoodForPay(event: e_buyGoodForPay): void {
        let fromgood = event.params.buygood;
        let togood = event.params.usegood;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }

        let from_good = GoodState.load(fromgood.toString());
        if (from_good === null) {
                from_good = new GoodState(fromgood.toString());
                from_good.pargood = "#";
                from_good.tokenname = "#";
                from_good.tokensymbol = "#";
                from_good.tokentotalsuply = ZERO_BI;
                from_good.tokendecimals = ZERO_BI;
                from_good.owner = "#";
                from_good.erc20Address = "#";
                from_good.goodConfig = ZERO_BI;
                from_good.currentValue = ZERO_BI;
                from_good.currentQuantity = ZERO_BI;
                from_good.investValue = ZERO_BI;
                from_good.investQuantity = ZERO_BI;
                from_good.feeQuantity = ZERO_BI;
                from_good.contructFee = ZERO_BI;
                from_good.totalTradeQuantity = ZERO_BI;
                from_good.totalInvestQuantity = ZERO_BI;
                from_good.totalDisinvestQuantity = ZERO_BI;
                from_good.totalProfit = ZERO_BI;
                from_good.totalTradeCount = ZERO_BI;
                from_good.totalInvestCount = ZERO_BI;
                from_good.totalDisinvestCount = ZERO_BI;
                from_good.modifiedTime = ZERO_BI;
                from_good.txCount = ZERO_BI;
        }

        let from_pargood = ParGoodState.load(from_good.erc20Address);
        if (from_pargood === null) {
                from_pargood = new ParGoodState(from_good.erc20Address);
                from_pargood.tokenname = "#";
                from_pargood.tokensymbol = "#";
                from_pargood.tokentotalsuply = ZERO_BI;
                from_pargood.tokendecimals = ZERO_BI;
                from_pargood.erc20Address = "#";
                from_pargood.currentValue = ZERO_BI;
                from_pargood.currentQuantity = ZERO_BI;
                from_pargood.investValue = ZERO_BI;
                from_pargood.investQuantity = ZERO_BI;
                from_pargood.feeQuantity = ZERO_BI;
                from_pargood.contructFee = ZERO_BI;
                from_pargood.totalTradeQuantity = ZERO_BI;
                from_pargood.totalInvestQuantity = ZERO_BI;
                from_pargood.totalDisinvestQuantity = ZERO_BI;
                from_pargood.totalProfit = ZERO_BI;
                from_pargood.totalTradeCount = ZERO_BI;
                from_pargood.totalInvestCount = ZERO_BI;
                from_pargood.totalDisinvestCount = ZERO_BI;
                from_pargood.goodCount = ZERO_BI;
                from_pargood.txCount = ZERO_BI;
        }

        from_pargood.currentValue = from_pargood.currentValue.minus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.minus(
                from_good.currentQuantity
        );
        from_pargood.investValue = from_pargood.investValue.minus(
                from_good.investValue
        );
        from_pargood.investQuantity = from_pargood.investQuantity.minus(
                from_good.investQuantity
        );
        from_pargood.feeQuantity = from_pargood.feeQuantity.minus(
                from_good.feeQuantity
        );
        from_pargood.contructFee = from_pargood.contructFee.minus(
                from_good.contructFee
        );

        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(fromgood);
        if (!goodcurrentstate.reverted) {
                from_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                from_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                from_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                from_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                from_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                from_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        from_pargood.currentValue = from_pargood.currentValue.plus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.plus(
                from_good.currentQuantity
        );
        from_pargood.investValue = from_pargood.investValue.plus(
                from_good.investValue
        );
        from_pargood.investQuantity = from_pargood.investQuantity.plus(
                from_good.investQuantity
        );
        from_pargood.feeQuantity = from_pargood.feeQuantity.plus(
                from_good.feeQuantity
        );
        from_pargood.contructFee = from_pargood.contructFee.plus(
                from_good.contructFee
        );

        from_good.totalTradeCount = from_good.totalTradeCount.plus(ONE_BI);
        from_good.totalTradeQuantity =
                from_good.totalTradeQuantity.plus(BI_128);

        from_good.txCount = from_good.txCount.plus(ONE_BI);
        from_good.modifiedTime = event.block.timestamp;
        from_good.save();

        from_pargood.totalTradeQuantity = from_pargood.totalTradeQuantity.plus(
                event.params.usegoodstate.div(BI_128)
        );
        from_pargood.totalTradeCount =
                from_pargood.totalTradeCount.plus(ONE_BI);
        from_pargood.txCount = from_pargood.txCount.plus(ONE_BI);
        from_pargood.save();

        let to_good = GoodState.load(togood.toString());
        if (to_good === null) {
                to_good = new GoodState(togood.toString());
                to_good.pargood = "#";
                to_good.tokenname = "#";
                to_good.tokensymbol = "#";
                to_good.tokentotalsuply = ZERO_BI;
                to_good.tokendecimals = ZERO_BI;
                to_good.owner = "#";
                to_good.erc20Address = "#";
                to_good.goodConfig = ZERO_BI;
                to_good.currentValue = ZERO_BI;
                to_good.currentQuantity = ZERO_BI;
                to_good.investValue = ZERO_BI;
                to_good.investQuantity = ZERO_BI;
                to_good.feeQuantity = ZERO_BI;
                to_good.contructFee = ZERO_BI;
                to_good.totalTradeQuantity = ZERO_BI;
                to_good.totalInvestQuantity = ZERO_BI;
                to_good.totalDisinvestQuantity = ZERO_BI;
                to_good.totalProfit = ZERO_BI;
                to_good.totalTradeCount = ZERO_BI;
                to_good.totalInvestCount = ZERO_BI;
                to_good.totalDisinvestCount = ZERO_BI;
                to_good.modifiedTime = ZERO_BI;
                to_good.txCount = ZERO_BI;
        }

        let to_pargood = ParGoodState.load(to_good.erc20Address);
        if (to_pargood === null) {
                to_pargood = new ParGoodState(to_good.erc20Address);
                to_pargood.tokenname = "#";
                to_pargood.tokensymbol = "#";
                to_pargood.tokentotalsuply = ZERO_BI;
                to_pargood.tokendecimals = ZERO_BI;
                to_pargood.erc20Address = "#";
                to_pargood.currentValue = ZERO_BI;
                to_pargood.currentQuantity = ZERO_BI;
                to_pargood.investValue = ZERO_BI;
                to_pargood.investQuantity = ZERO_BI;
                to_pargood.feeQuantity = ZERO_BI;
                to_pargood.contructFee = ZERO_BI;
                to_pargood.totalTradeQuantity = ZERO_BI;
                to_pargood.totalInvestQuantity = ZERO_BI;
                to_pargood.totalDisinvestQuantity = ZERO_BI;
                to_pargood.totalProfit = ZERO_BI;
                to_pargood.totalTradeCount = ZERO_BI;
                to_pargood.totalInvestCount = ZERO_BI;
                to_pargood.totalDisinvestCount = ZERO_BI;
                to_pargood.goodCount = ZERO_BI;
        }
        to_pargood.totalTradeCount = to_pargood.totalTradeCount.plus(ONE_BI);
        to_pargood.currentValue = to_pargood.currentValue.minus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.minus(
                to_good.currentQuantity
        );
        to_pargood.investValue = to_pargood.investValue.minus(
                to_good.investValue
        );
        to_pargood.investQuantity = to_pargood.investQuantity.minus(
                to_good.investQuantity
        );
        to_pargood.feeQuantity = to_pargood.feeQuantity.minus(
                to_good.feeQuantity
        );
        to_pargood.contructFee = to_pargood.contructFee.minus(
                to_good.contructFee
        );

        let togoodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(togood);
        if (!togoodcurrentstate.reverted) {
                to_good.currentValue =
                        togoodcurrentstate.value.currentState.div(BI_128);
                to_good.currentQuantity =
                        togoodcurrentstate.value.currentState.mod(BI_128);
                to_good.investValue =
                        togoodcurrentstate.value.investState.div(BI_128);
                to_good.investQuantity =
                        togoodcurrentstate.value.investState.mod(BI_128);
                to_good.feeQuantity =
                        togoodcurrentstate.value.feeQunitityState.div(BI_128);
                to_good.contructFee =
                        togoodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        to_pargood.currentValue = to_pargood.currentValue.plus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.plus(
                to_good.currentQuantity
        );
        to_pargood.investValue = to_pargood.investValue.plus(
                to_good.investValue
        );
        to_pargood.investQuantity = to_pargood.investQuantity.plus(
                to_good.investQuantity
        );
        to_pargood.feeQuantity = to_pargood.feeQuantity.plus(
                to_good.feeQuantity
        );
        to_pargood.contructFee = to_pargood.contructFee.plus(
                to_good.contructFee
        );

        to_good.totalTradeCount = to_good.totalTradeCount.plus(ONE_BI);
        to_good.totalTradeQuantity = to_good.totalTradeQuantity.plus(
                event.params.buygoodstate.div(BI_128)
        );

        to_good.txCount = to_good.txCount.plus(ONE_BI);
        to_good.modifiedTime = event.block.timestamp;
        to_good.save();

        to_pargood.totalTradeQuantity = to_pargood.totalTradeQuantity.plus(
                event.params.buygoodstate.div(BI_128)
        );
        to_pargood.totalTradeCount = to_pargood.totalTradeCount.plus(ONE_BI);
        to_pargood.txCount = to_pargood.txCount.plus(ONE_BI);
        to_pargood.save();

        let newcustomer = Customer.load(event.transaction.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(
                        event.transaction.from.toHexString()
                );
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }
        newcustomer.tradeValue = newcustomer.tradeValue.plus(
                event.params.swapvalue
        );
        newcustomer.tradeCount = newcustomer.tradeCount.plus(ONE_BI);
        newcustomer.save();

        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.totalTradeCount = marketstate.totalTradeCount.plus(ONE_BI);
        marketstate.totalTradeValue = marketstate.totalTradeValue.plus(
                event.params.swapvalue
        );
        marketstate.save();

        let transid =
                from_good.id.toString() +
                from_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = from_good.id;
                tx.togood = to_good.id;
                tx.frompargood = from_pargood.id;
                tx.topargood = to_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = event.block.number;
        tx.transtype = "pay";
        tx.fromgood = from_good.id;
        tx.togood = to_good.id;
        tx.frompargood = from_pargood.id;
        tx.topargood = to_pargood.id;
        tx.fromgoodQuanity = event.params.usegoodstate.div(BI_128);
        tx.togoodQuantity = event.params.buygoodstate.div(BI_128);
        tx.timestamp = event.block.timestamp;
        tx.save();

        log_GoodData(from_good, event.block.timestamp);
        log_ParGoodData(from_pargood, event.block.timestamp);
        log_GoodData(to_good, event.block.timestamp);
        log_ParGoodData(to_pargood, event.block.timestamp);
        log_MarketData(marketstate, event.block.timestamp);
}
//valueGood ok
export function handle_fn_investValueGood(call: InvestValueGoodCall): void {
        let actualFeeQuantity = call.outputs.valueInvest_.actualFeeQuantity;
        let contructFeeQuantity = call.outputs.valueInvest_.contructFeeQuantity; //构建手续费
        let actualInvestValue = call.outputs.valueInvest_.actualInvestValue; //实际投资价值
        let actualInvestQuantity =
                call.outputs.valueInvest_.actualInvestQuantity; //实际投资数量
        let goodid = call.inputs._goodid;
        let modifiedTime = call.block.timestamp;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }
        newcustomer.investValue =
                newcustomer.investValue.plus(actualInvestValue);
        newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);
        newcustomer.save();

        let value_good = GoodState.load(goodid.toString());
        if (value_good === null) {
                value_good = new GoodState(goodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        value_good.currentValue =
                value_good.currentValue.plus(actualInvestValue);
        value_good.currentQuantity =
                value_good.currentQuantity.plus(actualInvestQuantity);
        value_good.investValue = value_good.investValue.plus(actualInvestValue);
        value_good.investQuantity =
                value_good.investQuantity.plus(actualInvestQuantity);
        // value_good.feeQuantity = value_good.feeQuantity.plus(actualInvestValue);
        // value_good.contructFee = value_good.contructFee.plus(actualInvestValue);

        value_good.totalInvestCount = value_good.totalInvestCount.plus(ONE_BI);
        value_good.totalInvestQuantity =
                value_good.totalInvestQuantity.plus(actualInvestQuantity);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "#";
                value_pargood.tokensymbol = "#";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "#";
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
        }

        value_pargood.currentValue =
                value_pargood.currentValue.plus(actualInvestValue);
        value_pargood.currentQuantity =
                value_pargood.currentQuantity.plus(actualInvestQuantity);
        value_pargood.investValue =
                value_pargood.investValue.plus(actualInvestValue);
        value_pargood.investQuantity =
                value_pargood.investQuantity.plus(actualInvestQuantity);
        // value_pargood.feeQuantity = ZERO_BI;
        // value_pargood.contructFee = ZERO_BI;

        value_pargood.totalInvestQuantity =
                value_pargood.totalInvestQuantity.plus(actualInvestQuantity);
        value_pargood.totalInvestCount =
                value_pargood.totalInvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();
        marketstate.totalInvestValue =
                marketstate.totalInvestValue.plus(actualInvestValue);
        marketstate.totalInvestCount =
                marketstate.totalInvestCount.plus(ONE_BI);
        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.save();

        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "investvalue";
        tx.fromgood = value_good.id;
        tx.togood = value_good.id;
        tx.frompargood = value_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = actualInvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
// ok
export function handle_fn_disinvestValueGood(
        call: DisinvestValueGoodCall
): void {
        let goodid = call.inputs._goodid;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let profit = call.outputs.disinvestResult_.profit;
        let actual_fee = call.outputs.disinvestResult_.actual_fee;
        let actualDisinvestValue =
                call.outputs.disinvestResult_.actualDisinvestValue;
        let actualDisinvestQuantity =
                call.outputs.disinvestResult_.actualDisinvestQuantity;

        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }
        newcustomer.disinvestValue =
                newcustomer.disinvestValue.plus(actualDisinvestValue);
        newcustomer.disinvestCount = newcustomer.disinvestCount.plus(ONE_BI);
        newcustomer.save();
        marketstate.save();

        let value_good = GoodState.load(goodid.toString());
        if (value_good === null) {
                value_good = new GoodState(goodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "#";
                value_pargood.tokensymbol = "#";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "#";
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
        }
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.currentValue = value_pargood.currentValue.minus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.minus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.minus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.minus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.minus(
                value_good.contructFee
        );

        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(goodid);
        if (!goodcurrentstate.reverted) {
                value_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                value_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                value_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                value_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                value_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                value_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        value_pargood.currentValue = value_pargood.currentValue.plus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.plus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.plus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.plus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.plus(
                value_good.contructFee
        );

        value_good.totalDisinvestQuantity =
                value_good.totalDisinvestQuantity.plus(actualDisinvestQuantity);
        value_good.totalProfit = value_good.totalProfit.plus(profit);
        value_good.totalDisinvestCount =
                value_good.totalDisinvestCount.plus(ONE_BI);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        value_pargood.totalDisinvestQuantity =
                value_pargood.totalDisinvestQuantity.plus(
                        actualDisinvestQuantity
                );
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();

        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "investvalue";
        tx.fromgood = value_good.id;
        tx.togood = value_good.id;
        tx.frompargood = value_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = actualDisinvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
// ok
export function handle_fn_disinvestValueProof(
        call: DisinvestValueProofCall
): void {
        let valueproofid = call.inputs._valueproofid;
        let proofstate = ProofState.load(valueproofid.toString());
        if (proofstate === null) {
                proofstate = new ProofState(valueproofid.toString());
                proofstate.owner = "#";
                proofstate.good1 = "#";
                proofstate.good2 = "#";
                proofstate.proofValue = ZERO_BI;
                proofstate.good1ContructFee = ZERO_BI;
                proofstate.good1Quantity = ZERO_BI;
                proofstate.good2ContructFee = ZERO_BI;
                proofstate.good2Quantity = ZERO_BI;
                proofstate.createTime = call.block.timestamp;
        }

        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let profit = call.outputs.disinvestResult_.profit;
        let actual_fee = call.outputs.disinvestResult_.actual_fee;
        let actualDisinvestValue =
                call.outputs.disinvestResult_.actualDisinvestValue;
        let actualDisinvestQuantity =
                call.outputs.disinvestResult_.actualDisinvestQuantity;

        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }
        newcustomer.disinvestValue =
                newcustomer.disinvestValue.plus(actualDisinvestValue);
        newcustomer.disinvestCount = newcustomer.disinvestCount.plus(ONE_BI);
        newcustomer.save();

        let value_good = GoodState.load(proofstate.good1);
        if (value_good === null) {
                value_good = new GoodState(proofstate.good1);
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "#";
                value_pargood.tokensymbol = "#";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "#";
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
        }
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.currentValue = value_pargood.currentValue.minus(
                value_pargood.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.minus(
                value_pargood.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.minus(
                value_pargood.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.minus(
                value_pargood.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                value_pargood.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.minus(
                value_pargood.contructFee
        );

        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(proofstate.good1));
        if (!goodcurrentstate.reverted) {
                value_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                value_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                value_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                value_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                value_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                value_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        value_pargood.currentValue = value_pargood.currentValue.plus(
                value_pargood.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.plus(
                value_pargood.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.plus(
                value_pargood.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.plus(
                value_pargood.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                value_pargood.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.plus(
                value_pargood.contructFee
        );

        value_good.totalDisinvestQuantity =
                value_good.totalDisinvestQuantity.plus(actualDisinvestQuantity);
        value_good.totalProfit = value_good.totalProfit.plus(profit);
        value_good.totalDisinvestCount =
                value_good.totalDisinvestCount.plus(ONE_BI);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        value_pargood.totalDisinvestQuantity =
                value_pargood.totalDisinvestQuantity.plus(
                        actualDisinvestQuantity
                );
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();

        let tmp_proof_state = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getProofState(valueproofid);
        if (!tmp_proof_state.reverted) {
                proofstate.proofValue = tmp_proof_state.value.state.div(BI_128);
                proofstate.good1ContructFee =
                        tmp_proof_state.value.invest.div(BI_128);
                proofstate.good1Quantity =
                        tmp_proof_state.value.invest.mod(BI_128);
                proofstate.good2ContructFee =
                        tmp_proof_state.value.valueinvest.div(BI_128);
                proofstate.good2Quantity =
                        tmp_proof_state.value.valueinvest.mod(BI_128);
                proofstate.createTime = call.block.timestamp;
        }
        proofstate.save();

        marketstate.totalDisinvestValue =
                marketstate.totalDisinvestValue.plus(actualDisinvestValue);
        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.totalDisinvestCount =
                marketstate.totalDisinvestCount.plus(ONE_BI);
        marketstate.save();
        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "investvalue";
        tx.fromgood = value_good.id;
        tx.togood = value_good.id;
        tx.frompargood = value_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = actualDisinvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
//nomalgood
export function handle_fn_investNormalGood(call: InvestNormalGoodCall): void {
        let actualFeeQuantity = call.outputs.valueInvest_.actualFeeQuantity;
        let contructFeeQuantity = call.outputs.valueInvest_.contructFeeQuantity; //构建手续费
        let actualInvestValue = call.outputs.valueInvest_.actualInvestValue; //实际投资价值
        let actualInvestQuantity =
                call.outputs.valueInvest_.actualInvestQuantity; //实际投资数量
        let goodid = call.inputs._valuegood;

        let normalactualFeeQuantity =
                call.outputs.normalInvest_.actualFeeQuantity;
        let normalcontructFeeQuantity =
                call.outputs.normalInvest_.contructFeeQuantity; //构建手续费
        let normalactualInvestValue =
                call.outputs.normalInvest_.actualInvestValue; //实际投资价值
        let normalactualInvestQuantity =
                call.outputs.normalInvest_.actualInvestQuantity; //实际投资数量
        let normalgoodid = call.inputs._togood;

        let modifiedTime = call.block.timestamp;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }

        newcustomer.investValue =
                newcustomer.investValue.plus(actualInvestValue);
        newcustomer.investValue = newcustomer.investValue.plus(
                normalactualInvestValue
        );
        newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);
        newcustomer.save();

        let value_good = GoodState.load(goodid.toString());
        if (value_good === null) {
                value_good = new GoodState(goodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        let normal_good = GoodState.load(normalgoodid.toString());
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid.toString());
                normal_good.pargood = "#";
                normal_good.tokenname = "#";
                normal_good.tokensymbol = "#";
                normal_good.tokentotalsuply = ZERO_BI;
                normal_good.tokendecimals = ZERO_BI;
                normal_good.owner = "#";
                normal_good.erc20Address = "#";
                normal_good.goodConfig = ZERO_BI;
                normal_good.currentValue = ZERO_BI;
                normal_good.currentQuantity = ZERO_BI;
                normal_good.investValue = ZERO_BI;
                normal_good.investQuantity = ZERO_BI;
                normal_good.feeQuantity = ZERO_BI;
                normal_good.contructFee = ZERO_BI;
                normal_good.totalTradeQuantity = ZERO_BI;
                normal_good.totalInvestQuantity = ZERO_BI;
                normal_good.totalDisinvestQuantity = ZERO_BI;
                normal_good.totalProfit = ZERO_BI;
                normal_good.totalTradeCount = ZERO_BI;
                normal_good.totalInvestCount = ZERO_BI;
                normal_good.totalDisinvestCount = ZERO_BI;
                normal_good.modifiedTime = ZERO_BI;
                normal_good.txCount = ZERO_BI;
        }

        value_good.currentValue =
                value_good.currentValue.plus(actualInvestValue);
        value_good.currentQuantity =
                value_good.currentQuantity.plus(actualInvestQuantity);
        value_good.investValue = value_good.investValue.plus(actualInvestValue);
        value_good.investQuantity =
                value_good.investQuantity.plus(actualInvestQuantity);
        // value_good.feeQuantity = value_good.feeQuantity.plus(actualInvestValue);
        // value_good.contructFee = value_good.contructFee.plus(actualInvestValue);

        value_good.totalInvestCount = value_good.totalInvestCount.plus(ONE_BI);
        value_good.totalInvestQuantity =
                value_good.totalInvestQuantity.plus(actualInvestQuantity);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        normal_good.currentValue = normal_good.currentValue.plus(
                normalactualInvestValue
        );
        normal_good.currentQuantity = normal_good.currentQuantity.plus(
                normalactualInvestQuantity
        );
        normal_good.investValue = normal_good.investValue.plus(
                normalactualInvestValue
        );
        normal_good.investQuantity = normal_good.investQuantity.plus(
                normalactualInvestQuantity
        );

        // normal_good.feeQuantity = normal_good.feeQuantity.plus(actualInvestValue);
        // normal_good.contructFee = normal_good.contructFee.plus(actualInvestValue);
        normal_good.totalInvestCount =
                normal_good.totalInvestCount.plus(ONE_BI);

        normal_good.totalInvestQuantity = normal_good.totalInvestQuantity.plus(
                normalactualInvestQuantity
        );
        normal_good.modifiedTime = call.block.timestamp;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "";
                value_pargood.tokensymbol = "";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "";
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;

                value_pargood.goodCount = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
        }
        value_pargood.currentValue =
                value_pargood.currentValue.plus(actualInvestValue);
        value_pargood.currentQuantity =
                value_pargood.currentQuantity.plus(actualInvestQuantity);
        value_pargood.investValue =
                value_pargood.investValue.plus(actualInvestValue);
        value_pargood.investQuantity =
                value_pargood.investQuantity.plus(actualInvestQuantity);
        //   feeQuantity: BigInt!
        //   contructFee: BigInt!
        value_pargood.totalInvestQuantity =
                value_pargood.totalInvestQuantity.plus(actualInvestValue);
        value_pargood.totalInvestCount =
                value_pargood.totalInvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();

        let normal_pargood = ParGoodState.load(normal_good.erc20Address);
        if (normal_pargood === null) {
                normal_pargood = new ParGoodState(normal_good.erc20Address);
                normal_pargood.tokenname = "";
                normal_pargood.tokensymbol = "";
                normal_pargood.tokentotalsuply = ZERO_BI;
                normal_pargood.tokendecimals = ZERO_BI;
                normal_pargood.erc20Address = "";
                normal_pargood.contructFee = ZERO_BI;
                normal_pargood.totalTradeQuantity = ZERO_BI;
                normal_pargood.totalDisinvestQuantity = ZERO_BI;
                normal_pargood.totalTradeCount = ZERO_BI;
                normal_pargood.totalInvestCount = ZERO_BI;
                normal_pargood.totalDisinvestCount = ZERO_BI;
                normal_pargood.goodCount = ZERO_BI;
        }
        normal_pargood.currentValue = normal_pargood.currentValue.plus(
                normalactualInvestValue
        );
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.plus(
                normalactualInvestQuantity
        );
        normal_pargood.investValue = normal_pargood.investValue.plus(
                normalactualInvestValue
        );
        normal_pargood.investQuantity = normal_pargood.investQuantity.plus(
                normalactualInvestQuantity
        );
        //   feeQuantity: BigInt!
        //   contructFee: BigInt!
        normal_pargood.totalInvestQuantity =
                normal_pargood.totalInvestQuantity.plus(
                        normalactualInvestQuantity
                );
        normal_pargood.totalInvestCount =
                normal_pargood.totalInvestCount.plus(ONE_BI);
        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        marketstate.totalInvestValue =
                marketstate.totalInvestValue.plus(actualInvestValue);
        marketstate.totalInvestValue = marketstate.totalInvestValue.plus(
                normalactualInvestValue
        );
        marketstate.totalInvestCount =
                marketstate.totalInvestCount.plus(ONE_BI);
        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.save();

        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "investnormal";
        tx.fromgood = normal_good.id;
        tx.togood = value_good.id;
        tx.frompargood = normal_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = normalactualInvestQuantity;
        tx.togoodQuantity = actualInvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(normal_good, call.block.timestamp);
        log_ParGoodData(normal_pargood, call.block.timestamp);
        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
export function handle_fn_disinvestNormalGood(
        call: DisinvestNormalGoodCall
): void {
        let value_goodid = call.inputs._valuegood;
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let value_profit = call.outputs.disinvestValueResult2_.profit;
        let value_actual_fee = call.outputs.disinvestValueResult2_.actual_fee;
        let value_actualDisinvestValue =
                call.outputs.disinvestValueResult2_.actualDisinvestValue;
        let value_actualDisinvestQuantity =
                call.outputs.disinvestValueResult2_.actualDisinvestQuantity;

        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }

        newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                value_actualDisinvestValue
        );
        newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                value_actualDisinvestValue
        );
        newcustomer.disinvestCount = newcustomer.disinvestCount.plus(ONE_BI);
        newcustomer.save();

        let value_good = GoodState.load(value_goodid.toString());
        if (value_good === null) {
                value_good = new GoodState(value_goodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "#";
                value_pargood.tokensymbol = "#";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "#";
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
        }
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.currentValue = value_pargood.currentValue.minus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.minus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.minus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.minus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.minus(
                value_good.contructFee
        );

        let goodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(value_goodid);
        if (!goodcurrentstate.reverted) {
                value_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                value_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                value_good.investValue =
                        goodcurrentstate.value.investState.div(BI_128);
                value_good.investQuantity =
                        goodcurrentstate.value.investState.mod(BI_128);
                value_good.feeQuantity =
                        goodcurrentstate.value.feeQunitityState.div(BI_128);
                value_good.contructFee =
                        goodcurrentstate.value.feeQunitityState.mod(BI_128);
        }
        value_pargood.currentValue = value_pargood.currentValue.plus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.plus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.plus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.plus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.plus(
                value_good.contructFee
        );

        value_good.totalProfit = value_good.totalProfit.plus(value_profit);
        value_good.totalDisinvestCount =
                value_good.totalDisinvestCount.plus(ONE_BI);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);

        value_pargood.totalDisinvestQuantity =
                value_pargood.totalDisinvestQuantity.plus(
                        value_actualDisinvestQuantity
                );
        value_good.save();

        value_pargood.totalDisinvestQuantity =
                value_pargood.totalDisinvestQuantity.plus(
                        value_actualDisinvestQuantity
                );
        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);
        value_pargood.txCount = value_good.txCount.plus(ONE_BI);
        value_pargood.save();

        let normal_goodid = call.inputs._valuegood;
        let normal_profit = call.outputs.disinvestValueResult2_.profit;
        let normal_actual_fee = call.outputs.disinvestValueResult2_.actual_fee;
        let normal_actualDisinvestValue =
                call.outputs.disinvestValueResult2_.actualDisinvestValue;
        let normal_actualDisinvestQuantity =
                call.outputs.disinvestValueResult2_.actualDisinvestQuantity;

        let normal_good = GoodState.load(normal_goodid.toString());
        if (normal_good === null) {
                normal_good = new GoodState(normal_goodid.toString());
                normal_good.pargood = "#";
                normal_good.tokenname = "#";
                normal_good.tokensymbol = "#";
                normal_good.tokentotalsuply = ZERO_BI;
                normal_good.tokendecimals = ZERO_BI;
                normal_good.owner = "#";
                normal_good.erc20Address = "#";
                normal_good.goodConfig = ZERO_BI;
                normal_good.currentValue = ZERO_BI;
                normal_good.currentQuantity = ZERO_BI;
                normal_good.investValue = ZERO_BI;
                normal_good.investQuantity = ZERO_BI;
                normal_good.feeQuantity = ZERO_BI;
                normal_good.contructFee = ZERO_BI;
                normal_good.totalTradeQuantity = ZERO_BI;
                normal_good.totalInvestQuantity = ZERO_BI;
                normal_good.totalDisinvestQuantity = ZERO_BI;
                normal_good.totalProfit = ZERO_BI;
                normal_good.totalTradeCount = ZERO_BI;
                normal_good.totalInvestCount = ZERO_BI;
                normal_good.totalDisinvestCount = ZERO_BI;
                normal_good.modifiedTime = ZERO_BI;
                normal_good.txCount = ZERO_BI;
        }

        let normal_pargood = ParGoodState.load(normal_good.erc20Address);
        if (normal_pargood === null) {
                normal_pargood = new ParGoodState(normal_good.erc20Address);
                normal_pargood.tokenname = "#";
                normal_pargood.tokensymbol = "#";
                normal_pargood.tokentotalsuply = ZERO_BI;
                normal_pargood.tokendecimals = ZERO_BI;
                normal_pargood.erc20Address = "#";
                normal_pargood.currentValue = ZERO_BI;
                normal_pargood.currentQuantity = ZERO_BI;
                normal_pargood.investValue = ZERO_BI;
                normal_pargood.investQuantity = ZERO_BI;
                normal_pargood.feeQuantity = ZERO_BI;
                normal_pargood.contructFee = ZERO_BI;
                normal_pargood.totalTradeQuantity = ZERO_BI;
                normal_pargood.totalInvestQuantity = ZERO_BI;
                normal_pargood.totalDisinvestQuantity = ZERO_BI;
                normal_pargood.totalProfit = ZERO_BI;
                normal_pargood.totalTradeCount = ZERO_BI;
                normal_pargood.totalInvestCount = ZERO_BI;
                normal_pargood.totalDisinvestCount = ZERO_BI;
                normal_pargood.goodCount = ZERO_BI;
        }
        normal_pargood.currentValue = normal_pargood.currentValue.minus(
                normal_good.currentValue
        );
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.minus(
                normal_good.currentQuantity
        );
        normal_pargood.investValue = normal_pargood.investValue.minus(
                normal_good.investValue
        );
        normal_pargood.investQuantity = normal_pargood.investQuantity.minus(
                normal_good.investQuantity
        );
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.minus(
                normal_good.feeQuantity
        );
        normal_pargood.contructFee = normal_pargood.contructFee.minus(
                normal_good.contructFee
        );

        let normalgoodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(normal_goodid);
        if (!normalgoodcurrentstate.reverted) {
                normal_good.currentValue =
                        normalgoodcurrentstate.value.currentState.div(BI_128);
                normal_good.currentQuantity =
                        normalgoodcurrentstate.value.currentState.mod(BI_128);
                normal_good.investValue =
                        normalgoodcurrentstate.value.investState.div(BI_128);
                normal_good.investQuantity =
                        normalgoodcurrentstate.value.investState.mod(BI_128);
                normal_good.feeQuantity =
                        normalgoodcurrentstate.value.feeQunitityState.div(
                                BI_128
                        );
                normal_good.contructFee =
                        normalgoodcurrentstate.value.feeQunitityState.mod(
                                BI_128
                        );
        }
        normal_pargood.currentValue = normal_pargood.currentValue.plus(
                normal_good.currentValue
        );
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.plus(
                normal_good.currentQuantity
        );
        normal_pargood.investValue = normal_pargood.investValue.plus(
                normal_good.investValue
        );
        normal_pargood.investQuantity = normal_pargood.investQuantity.plus(
                normal_good.investQuantity
        );
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.plus(
                normal_good.feeQuantity
        );
        normal_pargood.contructFee = normal_pargood.contructFee.plus(
                normal_good.contructFee
        );

        normal_good.totalDisinvestQuantity =
                normal_good.totalDisinvestQuantity.plus(
                        normal_actualDisinvestQuantity
                );
        normal_good.totalProfit = normal_good.totalProfit.plus(normal_profit);
        normal_good.totalDisinvestCount =
                normal_good.totalDisinvestCount.plus(ONE_BI);
        normal_good.modifiedTime = call.block.timestamp;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

        normal_pargood.totalDisinvestQuantity =
                normal_pargood.totalDisinvestQuantity.plus(
                        normal_actualDisinvestQuantity
                );

        normal_pargood.totalDisinvestCount =
                normal_pargood.totalDisinvestCount.plus(ONE_BI);

        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.totalDisinvestCount =
                marketstate.totalDisinvestCount.plus(ONE_BI);
        marketstate.totalDisinvestValue = marketstate.totalDisinvestValue.plus(
                value_actualDisinvestValue
        );
        marketstate.totalDisinvestValue = marketstate.totalDisinvestValue.plus(
                normal_actualDisinvestValue
        );
        marketstate.save();
        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "disinvestnormal";
        tx.fromgood = value_good.id;
        tx.togood = value_good.id;
        tx.frompargood = normal_pargood.id;
        tx.topargood = normal_pargood.id;
        tx.fromgoodQuanity = value_actualDisinvestQuantity;
        tx.togoodQuantity = normal_actualDisinvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(normal_good, call.block.timestamp);
        log_ParGoodData(normal_pargood, call.block.timestamp);
        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
export function handle_fn_disinvestNormalProof(
        call: DisinvestNormalProofCall
): void {
        let proofid = call.inputs._normalProof;
        let proofstate = ProofState.load(proofid.toString());
        if (proofstate === null) {
                proofstate = new ProofState(proofid.toString());
                proofstate.owner = "#";
                proofstate.good1 = "#";
                proofstate.good2 = "#";
                proofstate.proofValue = ZERO_BI;
                proofstate.good1ContructFee = ZERO_BI;
                proofstate.good1Quantity = ZERO_BI;
                proofstate.good2ContructFee = ZERO_BI;
                proofstate.good2Quantity = ZERO_BI;
                proofstate.createTime = call.block.timestamp;
        }

        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate === null) {
                marketstate = new MarketState(MARKET_ADDRESS);
                marketstate.marketConfig = ZERO_BI;
                marketstate.pargoodCount = ZERO_BI;
                marketstate.goodCount = ZERO_BI;
                marketstate.proofCount = ZERO_BI;
                marketstate.userCount = ZERO_BI;
                marketstate.txCount = ZERO_BI;
                marketstate.totalTradeCount = ZERO_BI;
                marketstate.totalInvestCount = ZERO_BI;
                marketstate.totalDisinvestCount = ZERO_BI;
                marketstate.totalDisinvestValue = ZERO_BI;
                marketstate.totalInvestValue = ZERO_BI;
                marketstate.totalTradeValue = ZERO_BI;
                marketstate.marketCreator = "#";
        }
        let value_profit = call.outputs.disinvestValueResult2_.profit;
        let value_actual_fee = call.outputs.disinvestValueResult2_.actual_fee;
        let value_actualDisinvestValue =
                call.outputs.disinvestValueResult2_.actualDisinvestValue;
        let value_actualDisinvestQuantity =
                call.outputs.disinvestValueResult2_.actualDisinvestQuantity;
        marketstate.totalDisinvestValue = marketstate.totalDisinvestValue.plus(
                value_actualDisinvestValue
        );
        marketstate.totalDisinvestCount =
                marketstate.totalDisinvestCount.plus(ONE_BI);

        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                marketstate.userCount = marketstate.userCount.plus(ONE_BI);
        }

        newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                value_actualDisinvestValue
        );
        newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                value_actualDisinvestValue
        );
        newcustomer.disinvestCount = newcustomer.disinvestCount.plus(ONE_BI);
        newcustomer.save();

        marketstate.txCount = marketstate.txCount.plus(ONE_BI);

        let value_good = GoodState.load(proofstate.good2);
        if (value_good === null) {
                value_good = new GoodState(proofstate.good2);
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }

        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
                value_pargood.tokenname = "#";
                value_pargood.tokensymbol = "#";
                value_pargood.tokentotalsuply = ZERO_BI;
                value_pargood.tokendecimals = ZERO_BI;
                value_pargood.erc20Address = "#";
                value_pargood.currentValue = ZERO_BI;
                value_pargood.currentQuantity = ZERO_BI;
                value_pargood.investValue = ZERO_BI;
                value_pargood.investQuantity = ZERO_BI;
                value_pargood.feeQuantity = ZERO_BI;
                value_pargood.contructFee = ZERO_BI;
                value_pargood.totalTradeQuantity = ZERO_BI;
                value_pargood.totalInvestQuantity = ZERO_BI;
                value_pargood.totalDisinvestQuantity = ZERO_BI;
                value_pargood.totalProfit = ZERO_BI;
                value_pargood.totalTradeCount = ZERO_BI;
                value_pargood.totalInvestCount = ZERO_BI;
                value_pargood.totalDisinvestCount = ZERO_BI;
                value_pargood.goodCount = ZERO_BI;
        }
        value_pargood.currentValue = value_pargood.currentValue.minus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.minus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.minus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.minus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.minus(
                value_good.contructFee
        );

        let valuegoodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(proofstate.good2));
        if (!valuegoodcurrentstate.reverted) {
                value_good.currentValue =
                        valuegoodcurrentstate.value.currentState.div(BI_128);
                value_good.currentQuantity =
                        valuegoodcurrentstate.value.currentState.mod(BI_128);
                value_good.investValue =
                        valuegoodcurrentstate.value.investState.div(BI_128);
                value_good.investQuantity =
                        valuegoodcurrentstate.value.investState.mod(BI_128);
                value_good.feeQuantity =
                        valuegoodcurrentstate.value.feeQunitityState.div(
                                BI_128
                        );
                value_good.contructFee =
                        valuegoodcurrentstate.value.feeQunitityState.mod(
                                BI_128
                        );
        }
        value_pargood.currentValue = value_pargood.currentValue.plus(
                value_good.currentValue
        );
        value_pargood.currentQuantity = value_pargood.currentQuantity.plus(
                value_good.currentQuantity
        );
        value_pargood.investValue = value_pargood.investValue.plus(
                value_good.investValue
        );
        value_pargood.investQuantity = value_pargood.investQuantity.plus(
                value_good.investQuantity
        );
        value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                value_good.feeQuantity
        );
        value_pargood.contructFee = value_pargood.contructFee.plus(
                value_good.contructFee
        );

        value_good.totalDisinvestQuantity =
                value_good.totalDisinvestQuantity.plus(
                        value_actualDisinvestQuantity
                );
        value_good.totalProfit = value_good.totalProfit.plus(value_profit);
        value_good.totalDisinvestCount =
                value_good.totalDisinvestCount.plus(ONE_BI);
        value_good.modifiedTime = call.block.timestamp;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        value_pargood.totalDisinvestQuantity =
                value_pargood.totalDisinvestQuantity.plus(
                        value_actualDisinvestQuantity
                );

        value_pargood.totalDisinvestCount =
                value_pargood.totalDisinvestCount.plus(ONE_BI);

        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);

        value_pargood.save();

        let normal_profit = call.outputs.disinvestValueResult2_.profit;
        let normal_actual_fee = call.outputs.disinvestValueResult2_.actual_fee;
        let normal_actualDisinvestValue =
                call.outputs.disinvestValueResult2_.actualDisinvestValue;
        let normal_actualDisinvestQuantity =
                call.outputs.disinvestValueResult2_.actualDisinvestQuantity;

        let normal_good = GoodState.load(proofstate.good1);
        if (normal_good === null) {
                normal_good = new GoodState(proofstate.good1);
                normal_good.pargood = "#";
                normal_good.tokenname = "#";
                normal_good.tokensymbol = "#";
                normal_good.tokentotalsuply = ZERO_BI;
                normal_good.tokendecimals = ZERO_BI;
                normal_good.owner = "#";
                normal_good.erc20Address = "#";
                normal_good.goodConfig = ZERO_BI;
                normal_good.currentValue = ZERO_BI;
                normal_good.currentQuantity = ZERO_BI;
                normal_good.investValue = ZERO_BI;
                normal_good.investQuantity = ZERO_BI;
                normal_good.feeQuantity = ZERO_BI;
                normal_good.contructFee = ZERO_BI;
                normal_good.totalTradeQuantity = ZERO_BI;
                normal_good.totalInvestQuantity = ZERO_BI;
                normal_good.totalDisinvestQuantity = ZERO_BI;
                normal_good.totalProfit = ZERO_BI;
                normal_good.totalTradeCount = ZERO_BI;
                normal_good.totalInvestCount = ZERO_BI;
                normal_good.totalDisinvestCount = ZERO_BI;
                normal_good.modifiedTime = ZERO_BI;
                normal_good.txCount = ZERO_BI;
        }

        let normal_pargood = ParGoodState.load(normal_good.erc20Address);
        if (normal_pargood === null) {
                normal_pargood = new ParGoodState(normal_good.erc20Address);
                normal_pargood.tokenname = "#";
                normal_pargood.tokensymbol = "#";
                normal_pargood.tokentotalsuply = ZERO_BI;
                normal_pargood.tokendecimals = ZERO_BI;
                normal_pargood.erc20Address = "#";
                normal_pargood.currentValue = ZERO_BI;
                normal_pargood.currentQuantity = ZERO_BI;
                normal_pargood.investValue = ZERO_BI;
                normal_pargood.investQuantity = ZERO_BI;
                normal_pargood.feeQuantity = ZERO_BI;
                normal_pargood.contructFee = ZERO_BI;
                normal_pargood.totalTradeQuantity = ZERO_BI;
                normal_pargood.totalInvestQuantity = ZERO_BI;
                normal_pargood.totalDisinvestQuantity = ZERO_BI;
                normal_pargood.totalProfit = ZERO_BI;
                normal_pargood.totalTradeCount = ZERO_BI;
                normal_pargood.totalInvestCount = ZERO_BI;
                normal_pargood.totalDisinvestCount = ZERO_BI;
                normal_pargood.goodCount = ZERO_BI;
        }
        normal_pargood.totalDisinvestCount =
                normal_pargood.totalDisinvestCount.plus(ONE_BI);
        normal_pargood.currentValue = normal_pargood.currentValue.minus(
                normal_good.currentValue
        );
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.minus(
                normal_good.currentQuantity
        );
        normal_pargood.investValue = normal_pargood.investValue.minus(
                normal_good.investValue
        );
        normal_pargood.investQuantity = normal_pargood.investQuantity.minus(
                normal_good.investQuantity
        );
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.minus(
                normal_good.feeQuantity
        );
        normal_pargood.contructFee = normal_pargood.contructFee.minus(
                normal_good.contructFee
        );

        let normalgoodcurrentstate = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(proofstate.good1));
        if (!normalgoodcurrentstate.reverted) {
                normal_good.currentValue =
                        normalgoodcurrentstate.value.currentState.div(BI_128);
                normal_good.currentQuantity =
                        normalgoodcurrentstate.value.currentState.mod(BI_128);
                normal_good.investValue =
                        normalgoodcurrentstate.value.investState.div(BI_128);
                normal_good.investQuantity =
                        normalgoodcurrentstate.value.investState.mod(BI_128);
                normal_good.feeQuantity =
                        normalgoodcurrentstate.value.feeQunitityState.div(
                                BI_128
                        );
                normal_good.contructFee =
                        normalgoodcurrentstate.value.feeQunitityState.mod(
                                BI_128
                        );
        }
        normal_pargood.currentValue = normal_pargood.currentValue.plus(
                normal_good.currentValue
        );
        normal_pargood.currentQuantity = normal_pargood.currentQuantity.plus(
                normal_good.currentQuantity
        );
        normal_pargood.investValue = normal_pargood.investValue.plus(
                normal_good.investValue
        );
        normal_pargood.investQuantity = normal_pargood.investQuantity.plus(
                normal_good.investQuantity
        );
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.plus(
                normal_good.feeQuantity
        );
        normal_pargood.contructFee = normal_pargood.contructFee.plus(
                normal_good.contructFee
        );

        normal_good.totalDisinvestQuantity =
                normal_good.totalDisinvestQuantity.plus(
                        normal_actualDisinvestQuantity
                );
        normal_good.totalProfit = normal_good.totalProfit.plus(normal_profit);
        normal_good.totalDisinvestCount =
                normal_good.totalDisinvestCount.plus(ONE_BI);
        normal_good.modifiedTime = call.block.timestamp;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

        normal_pargood.totalDisinvestQuantity =
                normal_pargood.totalDisinvestQuantity.plus(
                        normal_actualDisinvestQuantity
                );

        normal_pargood.totalDisinvestCount =
                normal_pargood.totalDisinvestCount.plus(ONE_BI);

        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        let tmp_proof_state = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getProofState(proofid);
        if (!tmp_proof_state.reverted) {
                proofstate.proofValue = tmp_proof_state.value.state.div(BI_128);
                proofstate.good1ContructFee =
                        tmp_proof_state.value.invest.div(BI_128);
                proofstate.good1Quantity =
                        tmp_proof_state.value.invest.mod(BI_128);
                proofstate.good2ContructFee =
                        tmp_proof_state.value.valueinvest.div(BI_128);
                proofstate.good2Quantity =
                        tmp_proof_state.value.valueinvest.mod(BI_128);
                proofstate.createTime = call.block.timestamp;
        }
        proofstate.save();

        marketstate.txCount = marketstate.txCount.plus(ONE_BI);
        marketstate.totalDisinvestCount =
                marketstate.totalDisinvestCount.plus(ONE_BI);
        marketstate.totalDisinvestValue = marketstate.totalDisinvestValue.plus(
                value_actualDisinvestValue
        );
        marketstate.totalDisinvestValue = marketstate.totalDisinvestValue.plus(
                normal_actualDisinvestValue
        );
        marketstate.save();
        let transid =
                value_good.id.toString() +
                value_good.txCount.mod(BigInt.fromU32(500)).toString();
        let tx = Transaction.load(transid);
        if (tx === null) {
                tx = new Transaction(transid);
                tx.blockNumber = ZERO_BI;
                tx.transtype = "null";
                tx.fromgood = value_good.id;
                tx.togood = value_good.id;
                tx.frompargood = value_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = ZERO_BI;
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = ZERO_BI;
                tx.togoodfee = ZERO_BI;
                tx.timestamp = ZERO_BI;
        }
        tx.blockNumber = call.block.number;
        tx.transtype = "disinvestnormal";
        tx.fromgood = value_good.id;
        tx.togood = value_good.id;
        tx.frompargood = normal_pargood.id;
        tx.topargood = normal_pargood.id;
        tx.fromgoodQuanity = value_actualDisinvestQuantity;
        tx.togoodQuantity = normal_actualDisinvestQuantity;
        tx.timestamp = call.block.timestamp;
        tx.save();

        log_GoodData(normal_good, call.block.timestamp);
        log_ParGoodData(normal_pargood, call.block.timestamp);
        log_GoodData(value_good, call.block.timestamp);
        log_ParGoodData(value_pargood, call.block.timestamp);
        log_MarketData(marketstate, call.block.timestamp);
}
// banlist ok
export function handle_fn_addbanlist(call: AddbanlistCall): void {
        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
        }
        newcustomer.isBanlist = true;
        newcustomer.save();
}
//ok
export function handle_fn_removebanlist(call: RemovebanlistCall): void {
        let newcustomer = Customer.load(call.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
        }
        newcustomer.isBanlist = false;
        newcustomer.save();
}

// goodconfig ok
export function handle_fn_updatetoValueGood(call: UpdatetoValueGoodCall): void {
        let value_good = GoodState.load(call.inputs._goodid.toString());
        if (value_good === null) {
                value_good = new GoodState(call.inputs._goodid.toString());
                value_good.pargood = "#";
                value_good.tokenname = "#";
                value_good.tokensymbol = "#";
                value_good.tokentotalsuply = ZERO_BI;
                value_good.tokendecimals = ZERO_BI;
                value_good.owner = "#";
                value_good.erc20Address = "#";
                value_good.goodConfig = ZERO_BI;
                value_good.currentValue = ZERO_BI;
                value_good.currentQuantity = ZERO_BI;
                value_good.investValue = ZERO_BI;
                value_good.investQuantity = ZERO_BI;
                value_good.feeQuantity = ZERO_BI;
                value_good.contructFee = ZERO_BI;
                value_good.totalTradeQuantity = ZERO_BI;
                value_good.totalInvestQuantity = ZERO_BI;
                value_good.totalDisinvestQuantity = ZERO_BI;
                value_good.totalProfit = ZERO_BI;
                value_good.totalTradeCount = ZERO_BI;
                value_good.totalInvestCount = ZERO_BI;
                value_good.totalDisinvestCount = ZERO_BI;
                value_good.modifiedTime = ZERO_BI;
                value_good.txCount = ZERO_BI;
        }
        value_good.goodConfig = BigInt.fromString(
                value_good.goodConfig.toString().substr(1, 255)
        ).times(bigInt.fromString("2"));
        value_good.modifiedTime = call.block.timestamp;
        value_good.save();
}
// ok
export function handle_fn_updatetoNormalGood(
        call: UpdatetoNormalGoodCall
): void {
        let normal_good = GoodState.load(call.inputs._goodid.toString());
        if (normal_good === null) {
                normal_good = new GoodState(call.inputs._goodid.toString());
                normal_good.tokenname = "#";
                normal_good.tokensymbol = "#";
                normal_good.tokentotalsuply = ZERO_BI;
                normal_good.tokendecimals = ZERO_BI;
                normal_good.feeQuantity = ZERO_BI;
                normal_good.contructFee = ZERO_BI;
                normal_good.totalTradeQuantity = ZERO_BI;
                normal_good.totalInvestQuantity = ZERO_BI;
                normal_good.totalDisinvestQuantity = ZERO_BI;
                normal_good.totalProfit = ZERO_BI;
                normal_good.owner = "#";
                normal_good.erc20Address = "#";
                normal_good.currentValue = ZERO_BI;
                normal_good.currentQuantity = ZERO_BI;
                normal_good.investValue = ZERO_BI;
                normal_good.investQuantity = ZERO_BI;
        }
        normal_good.goodConfig = BigInt.fromString(
                normal_good.goodConfig.toString().substr(1, 255)
        );
        normal_good.modifiedTime = call.block.timestamp;
        normal_good.save();
}
// ok
export function handle_fn_updateGoodConfig(call: UpdateGoodConfigCall): void {
        let good = GoodState.load(call.inputs._goodid.toString());
        if (good === null) {
                good = new GoodState(call.inputs._goodid.toString());
                good.pargood = "#";
                good.tokenname = "#";
                good.tokensymbol = "#";
                good.tokentotalsuply = ZERO_BI;
                good.tokendecimals = ZERO_BI;
                good.owner = "#";
                good.erc20Address = "#";
                good.goodConfig = ZERO_BI;
                good.currentValue = ZERO_BI;
                good.currentQuantity = ZERO_BI;
                good.investValue = ZERO_BI;
                good.investQuantity = ZERO_BI;
                good.feeQuantity = ZERO_BI;
                good.contructFee = ZERO_BI;
                good.totalTradeQuantity = ZERO_BI;
                good.totalInvestQuantity = ZERO_BI;
                good.totalDisinvestQuantity = ZERO_BI;
                good.totalProfit = ZERO_BI;
                good.totalTradeCount = ZERO_BI;
                good.totalInvestCount = ZERO_BI;
                good.totalDisinvestCount = ZERO_BI;
                good.modifiedTime = ZERO_BI;
                good.txCount = ZERO_BI;
        }
        good.goodConfig = BigInt.fromString(
                call.inputs._goodConfig.toString().substr(1, 255)
        );
        good.modifiedTime = call.block.timestamp;
        good.save();
}
// relation ok
export function handle_fn_addReferer(call: AddrefererCall): void {
        let newcustomer = Customer.load(call.from.toString());
        if (newcustomer === null) {
                newcustomer = new Customer(call.from.toHexString());
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
        }
        newcustomer.refer = call.inputs._referer.toHexString();
        newcustomer.save();
}

//ok
export function handle_e_updateProof(event: e_proof): void {
        let proofid = event.params.param0;
        let tmp_proof_state = MarketManager.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getProofState(proofid);

        let proofstate = ProofState.load(proofid.toString());
        if (proofstate === null) {
                let marketstate = MarketState.load(MARKET_ADDRESS);
                if (marketstate === null) {
                        marketstate = new MarketState(MARKET_ADDRESS);
                        marketstate.marketConfig = ZERO_BI;
                        marketstate.pargoodCount = ZERO_BI;
                        marketstate.goodCount = ZERO_BI;
                        marketstate.proofCount = ZERO_BI;
                        marketstate.userCount = ZERO_BI;
                        marketstate.txCount = ZERO_BI;
                        marketstate.totalTradeCount = ZERO_BI;
                        marketstate.totalInvestCount = ZERO_BI;
                        marketstate.totalDisinvestCount = ZERO_BI;
                        marketstate.totalDisinvestValue = ZERO_BI;
                        marketstate.totalInvestValue = ZERO_BI;
                        marketstate.totalTradeValue = ZERO_BI;
                        marketstate.marketCreator = "#";
                }
                proofstate = new ProofState(proofid.toString());
                proofstate.owner = event.transaction.from.toHexString();
                proofstate.good1 = tmp_proof_state.value.currentgood.toString();
                proofstate.good2 = tmp_proof_state.value.valuegood.toString();
                marketstate.save();
        }
        proofstate.proofValue = tmp_proof_state.value.state.div(BI_128);
        proofstate.good1ContructFee = tmp_proof_state.value.invest.div(BI_128);
        proofstate.good1Quantity = tmp_proof_state.value.invest.mod(BI_128);
        proofstate.good2ContructFee =
                tmp_proof_state.value.valueinvest.div(BI_128);
        proofstate.good2Quantity =
                tmp_proof_state.value.valueinvest.mod(BI_128);
        proofstate.createTime = event.block.timestamp;
        proofstate.save();
}
