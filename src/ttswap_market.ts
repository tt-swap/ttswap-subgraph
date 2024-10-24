import { Address, BigInt, store } from "@graphprotocol/graph-ts";

import {
        MarketState,
        ParGoodState,
        GoodState,
        ProofState,
        Transaction,
        Customer,
        tts_env,
} from "../generated/schema";

import {
        TTSwap_Market,
        e_collectProof,
        e_buyGood,
        e_buyGoodForPay,
        e_initMetaGood,
        e_initGood,
        e_setMarketConfig,
        e_updateGoodConfig,
        e_modifyGoodConfig,
        e_changeOwner,
        e_investGood,
        e_disinvestProof,
        e_addbanlist,
        e_removebanlist,
        e_collectcommission,
        e_goodWelfare,
        e_changegoodowner,
        e_transferdel,
} from "../generated/TTSwap_Market/TTSwap_Market";

import { MARKET_ADDRESS, BI_128, ZERO_BI, ONE_BI } from "./util/constants";

import {
        fetchTokenSymbol,
        fetchTokenName,
        fetchTokenTotalSupply,
        fetchTokenDecimals,
} from "./util/token";

import { fetchMarketConfig } from "./util/market";

import { log_GoodData, fetchGoodConfig } from "./util/good";
import { log_ParGoodData } from "./util/pargoodData";
import { log_MarketData } from "./util/marketData";

import { log_CustomerData } from "./util/customer";

/**
 * Handles the event of setting market configuration
 * @param event The e_setMarketConfig event
 */
export function handle_e_setMarketConfig(event: e_setMarketConfig): void {
        let marketstate = MarketState.load(MARKET_ADDRESS);
        if (marketstate !== null) {
                marketstate.marketConfig = event.params._marketconfig;
                marketstate.save();
        }
}

/**
 * Handles the event of changing good owner
 * @param event The e_changeOwner event
 */
export function handle_e_changeOwner(event: e_changeOwner): void {
        let from_good = GoodState.load(event.params._goodid.toString());
        if (from_good !== null) {
                from_good.owner = event.params._to.toHexString();
                from_good.save();
        }
}

/**
 * Handles the event of updating good configuration
 * @param event The e_updateGoodConfig event
 */
export function handle_e_updateGoodConfig(event: e_updateGoodConfig): void {
        let from_good = GoodState.load(event.params._goodid.toString());
        if (from_good !== null) {
                // Check if it's a value good
                if (
                        from_good.goodConfig.div(
                                BigInt.fromString(
                                        "57896044618658097711785492504343953926634992332820282019728792003956564819968"
                                )
                        ) >= ONE_BI
                ) {
                        from_good.isvaluegood = true;
                } else {
                        from_good.isvaluegood = false;
                }
                // Update good configuration
                from_good.goodConfig = event.params._goodConfig.mod(
                        BigInt.fromString(
                                "57896044618658097711785492504343953926634992332820282019728792003956564819968"
                        )
                );
                from_good.save();
        }
}

/**
 * Handles the event of modifying good configuration
 * @param event The e_modifyGoodConfig event
 */
export function handle_e_modifyGoodConfig(event: e_modifyGoodConfig): void {
        let from_good = GoodState.load(event.params._goodid.toString());
        if (from_good !== null) {
                from_good.goodConfig = fetchGoodConfig(event.params._goodid);
                if (
                        from_good.goodConfig.div(
                                BigInt.fromString(
                                        "57896044618658097711785492504343953926634992332820282019728792003956564819968"
                                )
                        ) >= ONE_BI
                ) {
                        from_good.isvaluegood = true;
                } else {
                        from_good.isvaluegood = false;
                }
                from_good.save();
        }
}

/**
 * Handles the event of initializing a meta good
 * @param event The e_initMetaGood event
 */
export function handle_e_initMetaGood(event: e_initMetaGood): void {
        let address_erc20 = event.params._erc20address;
        let erc20address = address_erc20.toHexString();
        let metaowner = event.transaction.from.toHexString();
        let metaid = event.params._goodid.toString();
        let stakecontruct = event.params._construct.mod(BI_128);
        let modifiedTime = event.block.timestamp;
        let trade_value = event.params._initial.div(BI_128);
        let trade_quantity = event.params._initial.mod(BI_128);

        // Initialize new customer
        let newcustomer = new Customer(metaowner);
        newcustomer.refer = "#";
        newcustomer.tradeValue = ZERO_BI;
        newcustomer.investValue = trade_value;
        newcustomer.disinvestValue = ZERO_BI;
        newcustomer.tradeCount = ZERO_BI;
        newcustomer.investCount = BigInt.fromU32(1);
        newcustomer.disinvestCount = ZERO_BI;
        newcustomer.isBanlist = false;
        newcustomer.customerno = BigInt.fromU32(1);
        newcustomer.totalprofitvalue = ZERO_BI;
        newcustomer.totalcommissionvalue = ZERO_BI;
        newcustomer.lastoptime = modifiedTime;
        newcustomer.referralnum = ZERO_BI;
        newcustomer.getfromstake = ZERO_BI;
        newcustomer.stakettsvalue = ZERO_BI;
        newcustomer.stakettsvalue = newcustomer.stakettsvalue.plus(trade_value);
        newcustomer.stakettscontruct = stakecontruct;
        newcustomer.save();

        log_CustomerData(newcustomer, modifiedTime);

        // Initialize or update market state
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
                marketstate.totalTradeValue = ZERO_BI;
        }

        marketstate.marketConfig = fetchMarketConfig(
                Address.fromString(MARKET_ADDRESS)
        );
        marketstate.totalInvestValue = trade_value;
        marketstate.userCount = BigInt.fromU32(1);
        marketstate.txCount = BigInt.fromU32(1);
        marketstate.goodCount = BigInt.fromU32(1);
        marketstate.pargoodCount = BigInt.fromU32(1);
        marketstate.totalInvestCount = BigInt.fromU32(1);
        marketstate.save();

        let goodConfig = event.params._goodConfig;
        let meta_pargood = new ParGoodState(erc20address);
        meta_pargood.id = erc20address;
        meta_pargood.tokenname = fetchTokenName(address_erc20);
        meta_pargood.tokensymbol = fetchTokenSymbol(address_erc20);
        meta_pargood.tokentotalsuply = fetchTokenTotalSupply(address_erc20);
        meta_pargood.tokendecimals = fetchTokenDecimals(address_erc20);
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
        meta_pargood.name_lower = meta_pargood.tokenname.toLowerCase();
        meta_pargood.symbol_lower = meta_pargood.tokensymbol.toLowerCase();
        meta_pargood.save();

        let null_pargood = new ParGoodState("0");
        null_pargood.id = "0";
        null_pargood.tokenname = "#";
        null_pargood.tokensymbol = "#";
        null_pargood.tokentotalsuply = ZERO_BI;
        null_pargood.tokendecimals = ZERO_BI;
        null_pargood.erc20Address = "#";
        null_pargood.currentValue = ZERO_BI;
        null_pargood.currentQuantity = ZERO_BI;
        null_pargood.investValue = ZERO_BI;
        null_pargood.investQuantity = ZERO_BI;
        null_pargood.feeQuantity = ZERO_BI;
        null_pargood.contructFee = ZERO_BI;
        null_pargood.totalTradeQuantity = ZERO_BI;
        null_pargood.totalInvestQuantity = ZERO_BI;
        null_pargood.totalDisinvestQuantity = ZERO_BI;
        null_pargood.totalProfit = ZERO_BI;
        null_pargood.totalTradeCount = ZERO_BI;
        null_pargood.totalInvestCount = ONE_BI;
        null_pargood.totalDisinvestCount = ZERO_BI;
        null_pargood.goodCount = BigInt.fromU32(1);
        null_pargood.txCount = ONE_BI;
        null_pargood.name_lower = "#";
        null_pargood.symbol_lower = "#";
        null_pargood.save();

        let meta_good = new GoodState(metaid);
        meta_good.id = metaid;
        meta_good.goodseq = ONE_BI;
        meta_good.pargood = meta_pargood.id;
        meta_good.isvaluegood = true;
        meta_good.tokenname = fetchTokenName(address_erc20);
        meta_good.tokensymbol = fetchTokenSymbol(address_erc20);
        meta_good.tokentotalsuply = fetchTokenTotalSupply(address_erc20);
        meta_good.tokendecimals = fetchTokenDecimals(address_erc20);
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
        meta_good.totalInvestQuantity = trade_quantity;
        meta_good.totalDisinvestQuantity = ZERO_BI;
        meta_good.totalProfit = ZERO_BI;
        meta_good.totalTradeCount = ZERO_BI;
        meta_good.totalInvestCount = ONE_BI;
        meta_good.totalDisinvestCount = ZERO_BI;
        meta_good.modifiedTime = modifiedTime;
        meta_good.txCount = ONE_BI;
        meta_good.create_time = modifiedTime;
        meta_good.name_lower = meta_good.tokenname.toLowerCase();
        meta_good.symbol_lower = meta_good.tokensymbol.toLowerCase();
        meta_good.save();

        let null_good = new GoodState("0");

        null_good.pargood = null_pargood.id;
        null_good.goodseq = ZERO_BI;
        null_good.isvaluegood = false;
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
        null_good.create_time = modifiedTime;
        null_good.name_lower = null_good.tokenname.toLowerCase();
        null_good.symbol_lower = null_good.tokensymbol.toLowerCase();
        null_good.save();

        let proof = new ProofState(event.params._proofNo.toString());
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
        tx.blockNumber = event.block.number;
        tx.transtype = "meta";
        tx.transvalue = trade_value;
        tx.fromgood = meta_good.id;
        tx.togood = meta_good.id;
        tx.frompargood = meta_pargood.id;
        tx.topargood = meta_pargood.id;
        tx.fromgoodQuanity = trade_quantity;
        tx.fromgoodfee = ZERO_BI;
        tx.togoodQuantity = ZERO_BI;
        tx.togoodfee = ZERO_BI;
        tx.timestamp = modifiedTime;
        tx.recipent = event.transaction.from.toHexString();
        tx.hash = event.transaction.hash.toHexString();
        tx.save();
        let ttsenv = tts_env.load("1");
        if (ttsenv === null) {
                ttsenv = new tts_env("1");
                ttsenv.poolvalue = ZERO_BI;
                ttsenv.poolasset = ZERO_BI;
                ttsenv.poolcontruct = ZERO_BI;
                ttsenv.normalgoodid = ZERO_BI;
                ttsenv.valuegoodid = ZERO_BI;
                ttsenv.dao_admin = "#";
                ttsenv.marketcontract = "#";
                ttsenv.usdtcontract = "#";
                ttsenv.publicsell = ZERO_BI;
                ttsenv.lsttime = ZERO_BI;
                ttsenv.actual_amount = ZERO_BI;
                ttsenv.shares_index = ZERO_BI;
                ttsenv.left_share = ZERO_BI;
                ttsenv.usdt_amount = ZERO_BI;
                ttsenv.lasttime = ZERO_BI;
        }
        ttsenv.lasttime = event.block.timestamp;
        ttsenv.poolasset = ttsenv.poolasset.plus(stakecontruct);
        ttsenv.poolcontruct = ttsenv.poolcontruct.plus(stakecontruct);
        ttsenv.poolvalue = ttsenv.poolvalue.plus(trade_value);
        ttsenv.save();

        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
        log_MarketData(marketstate, modifiedTime);
        // day
        modifiedTime = modifiedTime.minus(BigInt.fromString("86400"));
        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
        // week
        modifiedTime = modifiedTime.minus(BigInt.fromString("604800"));
        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
        // month
        modifiedTime = modifiedTime.minus(BigInt.fromString("2073600"));
        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
        // year
        modifiedTime = modifiedTime.minus(BigInt.fromString("29376000"));
        log_GoodData(meta_good, modifiedTime);
        log_ParGoodData(meta_pargood, modifiedTime);
}
export function handle_e_initGood(event: e_initGood): void {
        let addresserc = event.params._erc20address;
        let erc20address = addresserc.toHexString();

        let valuegoodid = event.params._valuegoodNo.toString();

        let normalgoodid = event.params._goodid.toString();
        let stakecontruct = event.params._construct.mod(BI_128);
        let proofid_BG = event.params._proofNo;
        let marketmanage = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        );
        let goodowner = event.transaction.from.toHex();
        let proofstate = marketmanage.try_getProofState(proofid_BG);

        let trade_value = event.params._normalinitial.mod(BI_128);
        let trade_quantity = event.params._normalinitial.div(BI_128);
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
        let valuegoodfee = event.params._value
                .div(BI_128)
                .minus(trade_valuegood_quantity);
        let modifiedTime = event.block.timestamp;
        let goodConfig = event.params._goodConfig;
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
        }

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
                newcustomer.customerno = marketstate.userCount;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }
        newcustomer.investValue = newcustomer.investValue.plus(trade_value);
        newcustomer.investValue = newcustomer.investValue.plus(trade_value);
        newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);
        newcustomer.stakettsvalue = newcustomer.stakettsvalue.plus(trade_value);
        newcustomer.stakettsvalue = newcustomer.stakettsvalue.plus(trade_value);
        newcustomer.stakettscontruct =
                newcustomer.stakettscontruct.plus(stakecontruct);
        newcustomer.lastoptime = modifiedTime;
        newcustomer.save();

        log_CustomerData(newcustomer, modifiedTime);

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

                normal_pargood.name_lower =
                        normal_pargood.tokenname.toLowerCase();
                normal_pargood.symbol_lower =
                        normal_pargood.tokensymbol.toLowerCase();
                marketstate.pargoodCount =
                        marketstate.pargoodCount.plus(ONE_BI);
        }

        normal_pargood.currentValue =
                normal_pargood.currentValue.plus(trade_value);
        normal_pargood.currentQuantity =
                normal_pargood.currentQuantity.plus(trade_quantity);
        normal_pargood.investValue =
                normal_pargood.investValue.plus(trade_value);
        normal_pargood.investQuantity =
                normal_pargood.investQuantity.plus(trade_quantity);
        normal_pargood.totalInvestQuantity =
                normal_pargood.totalInvestQuantity.plus(trade_quantity);
        normal_pargood.totalInvestCount =
                normal_pargood.totalInvestCount.plus(ONE_BI);
        normal_pargood.goodCount = normal_pargood.goodCount.plus(ONE_BI);
        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                marketstate.goodCount = marketstate.goodCount.plus(ONE_BI);
                normal_good = new GoodState(normalgoodid);
                normal_good.modifiedTime = modifiedTime;
                normal_good.pargood = normal_pargood.id;
                normal_good.goodseq = marketstate.goodCount;
                normal_good.isvaluegood = false;
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
                normal_good.create_time = modifiedTime;
                normal_good.name_lower = normal_good.tokenname.toLowerCase();
                normal_good.symbol_lower =
                        normal_good.tokensymbol.toLowerCase();
        }
        normal_good.erc20Address = erc20address;
        normal_good.goodConfig = goodConfig;
        normal_good.currentValue = trade_value;
        normal_good.currentQuantity = trade_quantity;
        normal_good.investValue = trade_value;
        normal_good.investQuantity = trade_quantity;
        normal_good.totalInvestQuantity = trade_quantity;
        normal_good.totalInvestCount = ONE_BI;
        normal_good.modifiedTime = modifiedTime;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.owner = goodowner;
        if (
                normal_good.goodConfig.div(
                        BigInt.fromString(
                                "57896044618658097711785492504343953926634992332820282019728792003956564819968"
                        )
                ) >= ONE_BI
        ) {
                normal_good.isvaluegood = true;
        } else {
                normal_good.isvaluegood = false;
        }
        normal_good.goodConfig = event.params._goodConfig.mod(
                BigInt.fromString(
                        "57896044618658097711785492504343953926634992332820282019728792003956564819968"
                )
        );
        normal_good.save();

        let value_good = GoodState.load(valuegoodid);
        if (value_good === null) {
                value_good = new GoodState(valuegoodid);
                value_good.goodseq = ZERO_BI;
                value_good.pargood = "0";
                value_good.isvaluegood = false;
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
                value_good.create_time = ZERO_BI;
                value_good.name_lower = value_good.tokenname.toLowerCase();
                value_good.symbol_lower = value_good.tokensymbol.toLowerCase();
        }
        let value_pargood = ParGoodState.load(value_good.erc20Address);
        if (value_pargood === null) {
                value_pargood = new ParGoodState(value_good.erc20Address);
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
                value_pargood.name_lower =
                        value_pargood.tokenname.toLowerCase();
                value_pargood.symbol_lower =
                        value_pargood.tokensymbol.toLowerCase();
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
        let goodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(valuegoodid));
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
                        goodcurrentstate.value.feeQuantityState.div(BI_128);
                value_good.contructFee =
                        goodcurrentstate.value.feeQuantityState.mod(BI_128);
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
                event.params._value.mod(BI_128)
        );
        value_good.totalInvestCount = value_good.totalInvestCount.plus(ONE_BI);
        value_good.modifiedTime = modifiedTime;
        value_good.txCount = value_good.txCount.plus(ONE_BI);
        value_good.save();

        value_pargood.totalInvestQuantity =
                value_pargood.totalInvestQuantity.plus(
                        event.params._value.mod(BI_128)
                );
        value_pargood.totalInvestCount =
                value_pargood.totalInvestCount.plus(ONE_BI);
        value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
        value_pargood.save();

        let proof = new ProofState(proofid_BG.toString());
        proof.owner = event.transaction.from.toHexString();
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
        tx.blockNumber = event.block.number;
        tx.transtype = "init";
        tx.transvalue = trade_value.times(BigInt.fromString("2"));
        tx.fromgood = normal_good.id;
        tx.togood = value_good.id;
        tx.frompargood = normal_pargood.id;
        tx.topargood = value_pargood.id;
        tx.fromgoodQuanity = trade_normalgood_quantity;
        tx.togoodQuantity = trade_valuegood_quantity;
        tx.timestamp = modifiedTime;
        tx.recipent = event.transaction.from.toHexString();
        tx.hash = event.transaction.hash.toHexString();
        tx.save();

        let ttsenv = tts_env.load("1");
        if (ttsenv === null) {
                ttsenv = new tts_env("1");
                ttsenv.poolvalue = ZERO_BI;
                ttsenv.poolasset = ZERO_BI;
                ttsenv.poolcontruct = ZERO_BI;
                ttsenv.normalgoodid = ZERO_BI;
                ttsenv.valuegoodid = ZERO_BI;
                ttsenv.dao_admin = "#";
                ttsenv.marketcontract = "#";
                ttsenv.usdtcontract = "#";
                ttsenv.publicsell = ZERO_BI;
                ttsenv.lsttime = ZERO_BI;
                ttsenv.actual_amount = ZERO_BI;
                ttsenv.shares_index = ZERO_BI;
                ttsenv.left_share = ZERO_BI;
                ttsenv.usdt_amount = ZERO_BI;
                ttsenv.lasttime = ZERO_BI;
        }
        ttsenv.lasttime = event.block.timestamp;
        ttsenv.poolasset = ttsenv.poolasset.plus(stakecontruct);
        ttsenv.poolcontruct = ttsenv.poolcontruct.plus(stakecontruct);
        ttsenv.poolvalue = ttsenv.poolvalue.plus(trade_value);
        ttsenv.poolvalue = ttsenv.poolvalue.plus(trade_value);
        ttsenv.save();

        log_GoodData(value_good, modifiedTime);
        log_ParGoodData(value_pargood, modifiedTime);
        log_GoodData(normal_good, modifiedTime);
        log_ParGoodData(normal_pargood, modifiedTime);
        log_MarketData(marketstate, modifiedTime);
        //day
        modifiedTime = modifiedTime.minus(BigInt.fromString("86400"));
        log_GoodData(normal_good, modifiedTime);
        if (normal_pargood.goodCount === ONE_BI)
                log_ParGoodData(normal_pargood, modifiedTime);
        //week
        modifiedTime = modifiedTime.minus(BigInt.fromString("604800"));
        log_GoodData(normal_good, modifiedTime);
        if (normal_pargood.goodCount === ONE_BI)
                log_ParGoodData(normal_pargood, modifiedTime);
        //month
        modifiedTime = modifiedTime.minus(BigInt.fromString("2073600"));
        log_GoodData(normal_good, modifiedTime);
        if (normal_pargood.goodCount === ONE_BI)
                log_ParGoodData(normal_pargood, modifiedTime);
        //year
        modifiedTime = modifiedTime.minus(BigInt.fromString("29376000"));
        log_GoodData(normal_good, modifiedTime);
        if (normal_pargood.goodCount === ONE_BI)
                log_ParGoodData(normal_pargood, modifiedTime);
}

export function handle_e_buyGood(event: e_buyGood): void {
        let fromgood = event.params.sellgood;
        let togood = event.params.forgood;
        let trade_value = event.params.swapvalue;
        let from_quantity = event.params.sellgoodstate.div(BI_128);
        let from_fee = event.params.sellgoodstate.mod(BI_128);
        let to_quantity = event.params.forgoodstate.div(BI_128);
        let to_fee = event.params.forgoodstate.mod(BI_128);
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
        }
        let from_good = GoodState.load(fromgood.toString());
        if (from_good === null) {
                from_good = new GoodState(fromgood.toString());
                from_good.goodseq = ZERO_BI;
                from_good.pargood = "0";
                from_good.isvaluegood = false;
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
                from_good.create_time = ZERO_BI;
                from_good.name_lower = "#";
                from_good.symbol_lower = "#";
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
                from_pargood.name_lower = "#";
                from_pargood.symbol_lower = "#";
        }
        from_pargood.currentValue = from_pargood.currentValue.minus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.minus(
                from_good.currentQuantity
        );

        from_pargood.feeQuantity = from_pargood.feeQuantity.minus(
                from_good.feeQuantity
        );

        let goodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(fromgood);
        if (!goodcurrentstate.reverted) {
                from_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                from_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                from_good.feeQuantity =
                        goodcurrentstate.value.feeQuantityState.div(BI_128);
        }

        from_good.totalTradeCount = from_good.totalTradeCount.plus(ONE_BI);
        from_good.totalTradeQuantity = from_good.totalTradeQuantity.plus(
                event.params.sellgoodstate.div(BI_128)
        );
        from_good.txCount = from_good.txCount.plus(ONE_BI);
        from_good.modifiedTime = event.block.timestamp;
        from_good.save();

        from_pargood.currentValue = from_pargood.currentValue.plus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.plus(
                from_good.currentQuantity
        );

        from_pargood.feeQuantity = from_pargood.feeQuantity.plus(
                from_good.feeQuantity
        );

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
                to_good.goodseq = ZERO_BI;
                to_good.pargood = "0";
                to_good.isvaluegood = false;
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
                to_good.create_time = ZERO_BI;
                to_good.name_lower = "#";
                to_good.symbol_lower = "#";
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
                to_pargood.name_lower = "#";
                to_pargood.symbol_lower = "#";
        }
        to_pargood.currentValue = to_pargood.currentValue.minus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.minus(
                to_good.currentQuantity
        );

        to_pargood.feeQuantity = to_pargood.feeQuantity.minus(
                to_good.feeQuantity
        );

        let togoodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(togood);
        if (!togoodcurrentstate.reverted) {
                to_good.currentValue =
                        togoodcurrentstate.value.currentState.div(BI_128);
                to_good.currentQuantity =
                        togoodcurrentstate.value.currentState.mod(BI_128);

                to_good.feeQuantity =
                        togoodcurrentstate.value.feeQuantityState.div(BI_128);
        }

        to_good.totalTradeCount = to_good.totalTradeCount.plus(ONE_BI);
        to_good.totalTradeQuantity = to_good.totalTradeQuantity.plus(
                event.params.forgoodstate.div(BI_128)
        );
        to_good.modifiedTime = event.block.timestamp;
        to_good.txCount = to_good.txCount.plus(ONE_BI);
        to_good.save();

        to_pargood.currentValue = to_pargood.currentValue.plus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.plus(
                to_good.currentQuantity
        );

        to_pargood.feeQuantity = to_pargood.feeQuantity.plus(
                to_good.feeQuantity
        );

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
                newcustomer.customerno = marketstate.userCount;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }

        newcustomer.tradeValue = newcustomer.tradeValue.plus(
                event.params.swapvalue
        );
        newcustomer.tradeCount = newcustomer.tradeCount.plus(ONE_BI);

        newcustomer.lastoptime = event.block.timestamp;
        newcustomer.save();
        log_CustomerData(newcustomer, event.block.timestamp);

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
        tx.transvalue = trade_value;
        tx.fromgood = from_good.id;
        tx.togood = to_good.id;
        tx.frompargood = from_pargood.id;
        tx.topargood = to_pargood.id;
        tx.fromgoodQuanity = from_quantity;
        tx.fromgoodfee = from_fee;
        tx.togoodQuantity = to_quantity;
        tx.togoodfee = to_fee;
        tx.timestamp = event.block.timestamp;
        tx.recipent = event.transaction.from.toHexString();
        tx.hash = event.transaction.hash.toHexString();
        tx.save();

        log_GoodData(from_good, event.block.timestamp);
        log_ParGoodData(from_pargood, event.block.timestamp);

        log_GoodData(to_good, event.block.timestamp);
        log_ParGoodData(to_pargood, event.block.timestamp);
        log_MarketData(marketstate, event.block.timestamp);
}

export function handle_e_buyGoodForPay(event: e_buyGoodForPay): void {
        let fromgood = event.params.usegood;
        let togood = event.params.buygood;
        let trade_value = event.params.swapvalue;
        let from_quantity = event.params.buygoodstate.div(BI_128);
        let from_fee = event.params.buygoodstate.mod(BI_128);
        let to_quantity = event.params.usegoodstate.div(BI_128);
        let to_fee = event.params.usegoodstate.mod(BI_128);
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
        }
        let from_good = GoodState.load(fromgood.toString());
        if (from_good === null) {
                from_good = new GoodState(fromgood.toString());
                from_good.goodseq = ZERO_BI;
                from_good.pargood = "0";
                from_good.isvaluegood = false;
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
                from_good.create_time = ZERO_BI;
                from_good.name_lower = "#";
                from_good.symbol_lower = "#";
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
                from_pargood.name_lower = "#";
                from_pargood.symbol_lower = "#";
        }
        from_pargood.currentValue = from_pargood.currentValue.minus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.minus(
                from_good.currentQuantity
        );

        from_pargood.feeQuantity = from_pargood.feeQuantity.minus(
                from_good.feeQuantity
        );

        let goodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(fromgood);
        if (!goodcurrentstate.reverted) {
                from_good.currentValue =
                        goodcurrentstate.value.currentState.div(BI_128);
                from_good.currentQuantity =
                        goodcurrentstate.value.currentState.mod(BI_128);
                from_good.feeQuantity =
                        goodcurrentstate.value.feeQuantityState.div(BI_128);
        }

        from_good.totalTradeCount = from_good.totalTradeCount.plus(ONE_BI);
        from_good.totalTradeQuantity = from_good.totalTradeQuantity.plus(
                event.params.buygoodstate.div(BI_128)
        );
        from_good.txCount = from_good.txCount.plus(ONE_BI);
        from_good.modifiedTime = event.block.timestamp;
        from_good.save();

        from_pargood.currentValue = from_pargood.currentValue.plus(
                from_good.currentValue
        );
        from_pargood.currentQuantity = from_pargood.currentQuantity.plus(
                from_good.currentQuantity
        );

        from_pargood.feeQuantity = from_pargood.feeQuantity.plus(
                from_good.feeQuantity
        );

        from_pargood.totalTradeQuantity = from_pargood.totalTradeQuantity.plus(
                event.params.buygoodstate.div(BI_128)
        );
        from_pargood.totalTradeCount =
                from_pargood.totalTradeCount.plus(ONE_BI);
        from_pargood.txCount = from_pargood.txCount.plus(ONE_BI);
        from_pargood.save();

        let to_good = GoodState.load(togood.toString());
        if (to_good === null) {
                to_good = new GoodState(togood.toString());
                to_good.goodseq = ZERO_BI;
                to_good.pargood = "0";
                to_good.isvaluegood = false;
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
                to_good.create_time = ZERO_BI;
                to_good.name_lower = "#";
                to_good.symbol_lower = "#";
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
                to_pargood.name_lower = "#";
                to_pargood.symbol_lower = "#";
        }
        to_pargood.currentValue = to_pargood.currentValue.minus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.minus(
                to_good.currentQuantity
        );

        to_pargood.feeQuantity = to_pargood.feeQuantity.minus(
                to_good.feeQuantity
        );

        let togoodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(togood);
        if (!togoodcurrentstate.reverted) {
                to_good.currentValue =
                        togoodcurrentstate.value.currentState.div(BI_128);
                to_good.currentQuantity =
                        togoodcurrentstate.value.currentState.mod(BI_128);

                to_good.feeQuantity =
                        togoodcurrentstate.value.feeQuantityState.div(BI_128);
        }

        to_good.totalTradeCount = to_good.totalTradeCount.plus(ONE_BI);
        to_good.totalTradeQuantity = to_good.totalTradeQuantity.plus(
                event.params.usegoodstate.div(BI_128)
        );
        to_good.modifiedTime = event.block.timestamp;
        to_good.txCount = to_good.txCount.plus(ONE_BI);
        to_good.save();

        to_pargood.currentValue = to_pargood.currentValue.plus(
                to_good.currentValue
        );
        to_pargood.currentQuantity = to_pargood.currentQuantity.plus(
                to_good.currentQuantity
        );

        to_pargood.feeQuantity = to_pargood.feeQuantity.plus(
                to_good.feeQuantity
        );

        to_pargood.totalTradeQuantity = to_pargood.totalTradeQuantity.plus(
                event.params.usegoodstate.div(BI_128)
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
                newcustomer.customerno = marketstate.userCount;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }

        newcustomer.tradeValue = newcustomer.tradeValue.plus(
                event.params.swapvalue
        );
        newcustomer.tradeCount = newcustomer.tradeCount.plus(ONE_BI);

        newcustomer.lastoptime = event.block.timestamp;
        newcustomer.save();

        log_CustomerData(newcustomer, event.block.timestamp);
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
        tx.transvalue = trade_value;
        tx.fromgood = from_good.id;
        tx.togood = to_good.id;
        tx.frompargood = from_pargood.id;
        tx.topargood = to_pargood.id;
        tx.fromgoodQuanity = from_quantity;
        tx.fromgoodfee = from_fee;
        tx.togoodQuantity = to_quantity;
        tx.togoodfee = to_fee;
        tx.timestamp = event.block.timestamp;
        tx.recipent = event.transaction.from.toHexString();
        tx.hash = event.transaction.hash.toHexString();
        tx.save();

        log_GoodData(from_good, event.block.timestamp);
        log_ParGoodData(from_pargood, event.block.timestamp);
        log_GoodData(to_good, event.block.timestamp);
        log_ParGoodData(to_pargood, event.block.timestamp);
        log_MarketData(marketstate, event.block.timestamp);
}

export function handle_e_collectProof(event: e_collectProof): void {
        let normalgoodid = event.params._normalGoodNo.toString();
        let valuegoodid = event.params._valueGoodNo.toString();
        let proofNo = event.params._proofNo.toString();
        let normalprofit = event.params._profit
                .div(BI_128)
                .plus(event.params._profit.div(BI_128));
        let valueprofit = event.params._profit
                .mod(BI_128)
                .plus(event.params._profit.mod(BI_128));
        let proof = ProofState.load(proofNo);
        if (proof === null) {
                proof = new ProofState(proofNo);
                proof.owner = event.transaction.from.toHexString();
                proof.good1 = normalgoodid;
                proof.good2 = valuegoodid;
                proof.proofValue = ZERO_BI;
                proof.good1Quantity = ZERO_BI;
                proof.good2Quantity = ZERO_BI;
                proof.good1ContructFee = ZERO_BI;
                proof.good2ContructFee = ZERO_BI;
                proof.createTime = event.block.timestamp;
        }

        let marketmanage = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        );
        let proofstate = marketmanage.try_getProofState(event.params._proofNo);

        if (!proofstate.reverted) {
                proof.good1Quantity = proofstate.value.invest.mod(BI_128);
                proof.good1ContructFee = proofstate.value.invest.div(BI_128);
                if (valuegoodid != "0") {
                        proof.good2Quantity =
                                proofstate.value.valueinvest.mod(BI_128);
                        proof.good2ContructFee =
                                proofstate.value.valueinvest.div(BI_128);
                }
        }
        proof.save();

        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.goodseq = ZERO_BI;
                normal_good.pargood = "0";
                normal_good.isvaluegood = false;
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
                normal_good.create_time = ZERO_BI;
                normal_good.name_lower = "#";
                normal_good.symbol_lower = "#";
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
                normal_pargood.name_lower = "#";
                normal_pargood.symbol_lower = "#";
        }

        normal_pargood.contructFee = normal_pargood.contructFee.minus(
                normal_good.contructFee
        );
        let goodcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(event.params._normalGoodNo);
        if (!goodcurrentstate.reverted) {
                normal_good.contructFee =
                        goodcurrentstate.value.feeQuantityState.mod(BI_128);
        }
        normal_good.totalProfit = normal_good.totalProfit.plus(normalprofit);

        normal_good.txCount = normal_good.txCount.plus(ONE_BI);

        normal_good.save();
        normal_pargood.contructFee = normal_pargood.contructFee.plus(
                normal_good.contructFee
        );
        normal_pargood.totalProfit =
                normal_pargood.totalProfit.plus(normalprofit);
        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();

        if (valuegoodid != "0") {
                let value_good = GoodState.load(valuegoodid);
                if (value_good === null) {
                        value_good = new GoodState(valuegoodid);
                        value_good.goodseq = ZERO_BI;
                        value_good.pargood = "0";
                        value_good.isvaluegood = false;
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
                        value_good.create_time = ZERO_BI;
                        value_good.name_lower = "#";
                        value_good.symbol_lower = "#";
                }

                let value_pargood = ParGoodState.load(value_good.erc20Address);
                if (value_pargood === null) {
                        value_pargood = new ParGoodState(
                                value_good.erc20Address
                        );
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
                        value_pargood.name_lower = "#";
                        value_pargood.symbol_lower = "#";
                }

                value_pargood.contructFee = value_pargood.contructFee.minus(
                        value_good.contructFee
                );
                let goodcurrentstate2 = TTSwap_Market.bind(
                        Address.fromString(MARKET_ADDRESS)
                ).try_getGoodState(event.params._valueGoodNo);
                if (!goodcurrentstate2.reverted) {
                        value_good.contructFee =
                                goodcurrentstate2.value.feeQuantityState.mod(
                                        BI_128
                                );
                }
                value_good.totalProfit =
                        value_good.totalProfit.plus(valueprofit);

                value_good.txCount = value_good.txCount.plus(ONE_BI);

                value_good.save();

                value_pargood.contructFee = value_pargood.contructFee.plus(
                        value_good.contructFee
                );
                value_pargood.totalProfit =
                        value_pargood.totalProfit.plus(normalprofit);
                value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
                value_pargood.save();

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
                        marketstate.totalTradeValue = ZERO_BI;
                }
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "collect";
                tx.transvalue = BigInt.fromString("0");
                tx.fromgood = normal_good.id;
                tx.togood = value_good.id;
                tx.frompargood = normal_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = event.params._profit.div(BI_128);
                tx.fromgoodfee = ZERO_BI;
                tx.togoodQuantity = event.params._profit.mod(BI_128);
                tx.togoodfee = ZERO_BI;
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }

                newcustomer.totalprofitvalue.plus(
                        normal_good.currentValue
                                .times(event.params._profit.div(BI_128))
                                .div(normal_good.currentQuantity)
                );
                newcustomer.totalprofitvalue.plus(
                        value_good.currentValue
                                .times(event.params._profit.mod(BI_128))
                                .div(value_good.currentQuantity)
                );

                newcustomer.lastoptime = event.block.timestamp;

                newcustomer.save();

                log_CustomerData(newcustomer, event.block.timestamp);
                log_GoodData(value_good, event.block.timestamp);
                log_ParGoodData(value_pargood, event.block.timestamp);
                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        } else {
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
                        marketstate.totalTradeValue = ZERO_BI;
                }
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "collect";
                tx.transvalue = BigInt.fromString("0");
                tx.fromgood = normal_good.id;
                tx.togood = "0";
                tx.frompargood = normal_pargood.id;
                tx.topargood = "0";
                tx.fromgoodQuanity = event.params._profit.div(BI_128);
                tx.fromgoodfee = ZERO_BI;
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }

                newcustomer.totalprofitvalue.plus(
                        normal_good.currentValue
                                .times(event.params._profit.div(BI_128))
                                .div(normal_good.currentQuantity)
                );
                newcustomer.lastoptime = event.block.timestamp;

                newcustomer.save();

                log_CustomerData(newcustomer, event.block.timestamp);
                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        }
}

export function handle_e_investGood(event: e_investGood): void {
        let normalgoodid = event.params._normalgoodid.toString();
        let stakecontruct = event.params._value.mod(BI_128);
        let valuegoodid = event.params._valueGoodNo.toString();
        let proofNo = event.params._proofNo.toString();
        let marketmanage = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        );
        let proofstate = marketmanage.try_getProofState(event.params._proofNo);
        let invest_value = proofstate.value.state.div(BI_128);
        let normal_contructFee = proofstate.value.invest.div(BI_128);
        let normal_Quantity = proofstate.value.invest.mod(BI_128);
        // let normal_fee = event.params._invest.div(BI_128);
        let value_contructFee = proofstate.value.valueinvest.div(BI_128);
        let value_Quantity = proofstate.value.valueinvest.mod(BI_128);
        // let value_fee = event.params._valueinvest.div(BI_128);

        let proof = ProofState.load(proofNo);
        if (proof === null) {
                proof = new ProofState(proofNo);
                proof.owner = event.transaction.from.toHexString();
                proof.good1 = normalgoodid;
                proof.good2 = valuegoodid;
                proof.proofValue = ZERO_BI;
                proof.good1Quantity = ZERO_BI;
                proof.good2Quantity = ZERO_BI;
                proof.good1ContructFee = ZERO_BI;
                proof.good2ContructFee = ZERO_BI;
                proof.createTime = event.block.timestamp;
        }

        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.goodseq = ZERO_BI;
                normal_good.pargood = "0";
                normal_good.isvaluegood = false;
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
                normal_good.create_time = ZERO_BI;
                normal_good.name_lower = "#";
                normal_good.symbol_lower = "#";
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
                normal_pargood.name_lower = "#";
                normal_pargood.symbol_lower = "#";
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

        let normalcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(normalgoodid));
        if (!normalcurrentstate.reverted) {
                normal_good.currentValue =
                        normalcurrentstate.value.currentState.div(BI_128);
                normal_good.currentQuantity =
                        normalcurrentstate.value.currentState.mod(BI_128);
                normal_good.investValue =
                        normalcurrentstate.value.investState.div(BI_128);
                normal_good.investQuantity =
                        normalcurrentstate.value.investState.mod(BI_128);
                normal_good.feeQuantity =
                        normalcurrentstate.value.feeQuantityState.div(BI_128);
                normal_good.contructFee =
                        normalcurrentstate.value.feeQuantityState.mod(BI_128);
        } else {
                normal_good.currentValue = normal_good.currentValue.minus(
                        proof.proofValue
                );
                normal_good.currentQuantity = normal_good.currentQuantity.minus(
                        proof.good1Quantity
                );
                normal_good.investValue = normal_good.investValue.minus(
                        proof.proofValue
                );
                normal_good.investQuantity = normal_good.investQuantity.minus(
                        proof.good1Quantity
                );
                normal_good.feeQuantity = normal_good.feeQuantity.minus(
                        proof.good1ContructFee
                );
                normal_good.contructFee = normal_good.contructFee.minus(
                        proof.good1ContructFee
                );
                normal_good.currentValue =
                        normal_good.currentValue.plus(invest_value);
                normal_good.currentQuantity =
                        normal_good.currentQuantity.plus(normal_Quantity);
                normal_good.investValue =
                        normal_good.investValue.plus(invest_value);
                normal_good.investQuantity =
                        normal_good.investQuantity.plus(normal_Quantity);
                normal_good.feeQuantity =
                        normal_good.feeQuantity.plus(normal_contructFee);
                normal_good.contructFee =
                        normal_good.contructFee.plus(normal_contructFee);
        }

        normal_good.totalInvestQuantity = normal_good.totalInvestQuantity.minus(
                proof.good1Quantity
        );
        normal_good.totalInvestQuantity =
                normal_good.totalInvestQuantity.plus(normal_Quantity);
        normal_good.totalInvestCount =
                normal_good.totalInvestCount.plus(ONE_BI);
        normal_good.modifiedTime = event.block.timestamp;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

        normal_pargood.totalInvestQuantity =
                normal_pargood.totalInvestQuantity.minus(proof.good1Quantity);

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
        normal_pargood.totalInvestQuantity =
                normal_pargood.totalInvestQuantity.plus(normal_Quantity);
        normal_pargood.totalInvestCount =
                normal_pargood.totalInvestCount.plus(ONE_BI);

        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();
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
                marketstate.totalTradeValue = ZERO_BI;
        }
        if (valuegoodid != "0") {
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }

                newcustomer.investValue = newcustomer.investValue.minus(
                        proof.proofValue
                );
                newcustomer.investValue = newcustomer.investValue.minus(
                        proof.proofValue
                );
                newcustomer.investValue =
                        newcustomer.investValue.plus(invest_value);
                newcustomer.investValue =
                        newcustomer.investValue.plus(invest_value);
                newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);

                newcustomer.lastoptime = event.block.timestamp;
                newcustomer.stakettsvalue =
                        newcustomer.stakettsvalue.plus(invest_value);
                newcustomer.stakettsvalue =
                        newcustomer.stakettsvalue.plus(invest_value);
                newcustomer.stakettscontruct =
                        newcustomer.stakettscontruct.plus(stakecontruct);
                newcustomer.save();
                log_CustomerData(newcustomer, event.block.timestamp);

                let value_good = GoodState.load(valuegoodid);
                if (value_good === null) {
                        value_good = new GoodState(valuegoodid);
                        value_good.goodseq = ZERO_BI;
                        value_good.pargood = "0";
                        value_good.isvaluegood = false;
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
                        value_good.create_time = ZERO_BI;
                        value_good.name_lower = "#";
                        value_good.symbol_lower = "#";
                }

                let value_pargood = ParGoodState.load(value_good.erc20Address);
                if (value_pargood === null) {
                        value_pargood = new ParGoodState(
                                value_good.erc20Address
                        );
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
                        value_pargood.name_lower = "#";
                        value_pargood.symbol_lower = "#";
                }

                value_pargood.currentValue = value_pargood.currentValue.minus(
                        value_good.currentValue
                );
                value_pargood.currentQuantity =
                        value_pargood.currentQuantity.minus(
                                value_good.currentQuantity
                        );
                value_pargood.investValue = value_pargood.investValue.minus(
                        value_good.investValue
                );
                value_pargood.investQuantity =
                        value_pargood.investQuantity.minus(
                                value_good.investQuantity
                        );
                value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                        value_good.feeQuantity
                );
                value_pargood.contructFee = value_pargood.contructFee.minus(
                        value_good.contructFee
                );
                let valuecurrentstate = TTSwap_Market.bind(
                        Address.fromString(MARKET_ADDRESS)
                ).try_getGoodState(BigInt.fromString(valuegoodid));
                if (!valuecurrentstate.reverted) {
                        value_good.currentValue =
                                valuecurrentstate.value.currentState.div(
                                        BI_128
                                );
                        value_good.currentQuantity =
                                valuecurrentstate.value.currentState.mod(
                                        BI_128
                                );
                        value_good.investValue =
                                valuecurrentstate.value.investState.div(BI_128);
                        value_good.investQuantity =
                                valuecurrentstate.value.investState.mod(BI_128);
                        value_good.feeQuantity =
                                valuecurrentstate.value.feeQuantityState.div(
                                        BI_128
                                );
                        value_good.contructFee =
                                valuecurrentstate.value.feeQuantityState.mod(
                                        BI_128
                                );
                } else {
                        value_good.currentValue = value_good.currentValue.minus(
                                proof.proofValue
                        );
                        value_good.currentQuantity =
                                value_good.currentQuantity.minus(
                                        proof.good2Quantity
                                );
                        value_good.investValue = value_good.investValue.minus(
                                proof.proofValue
                        );
                        value_good.investQuantity =
                                value_good.investQuantity.minus(
                                        proof.good2Quantity
                                );
                        value_good.feeQuantity = value_good.feeQuantity.minus(
                                proof.good2ContructFee
                        );
                        value_good.contructFee = value_good.contructFee.minus(
                                proof.good2ContructFee
                        );

                        value_good.currentValue =
                                value_good.currentValue.plus(invest_value);
                        value_good.currentQuantity =
                                value_good.currentQuantity.plus(value_Quantity);
                        value_good.investValue =
                                value_good.investValue.plus(invest_value);
                        value_good.investQuantity =
                                value_good.investQuantity.plus(value_Quantity);
                        value_good.feeQuantity =
                                value_good.feeQuantity.plus(value_contructFee);
                        value_good.contructFee =
                                value_good.contructFee.plus(value_contructFee);
                }

                value_good.totalInvestQuantity =
                        value_good.totalInvestQuantity.minus(
                                proof.good2Quantity
                        );

                value_good.totalInvestQuantity =
                        value_good.totalInvestQuantity.plus(value_Quantity);
                value_good.totalInvestCount =
                        value_good.totalInvestCount.plus(ONE_BI);
                value_good.modifiedTime = event.block.timestamp;
                value_good.txCount = value_good.txCount.plus(ONE_BI);
                value_good.save();

                value_pargood.currentValue = value_pargood.currentValue.plus(
                        value_good.currentValue
                );

                value_pargood.currentQuantity =
                        value_pargood.currentQuantity.plus(
                                value_good.currentQuantity
                        );
                value_pargood.investValue = value_pargood.investValue.plus(
                        value_good.investValue
                );
                value_pargood.investQuantity =
                        value_pargood.investQuantity.plus(
                                value_good.investQuantity
                        );
                value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                        value_good.feeQuantity
                );
                value_pargood.contructFee = value_pargood.contructFee.plus(
                        value_good.contructFee
                );
                value_pargood.totalInvestQuantity =
                        value_pargood.totalInvestQuantity.minus(
                                proof.good2Quantity
                        );
                value_pargood.totalInvestQuantity =
                        value_pargood.totalInvestQuantity.plus(value_Quantity);
                value_pargood.totalInvestCount =
                        value_pargood.totalInvestCount.plus(ONE_BI);
                value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
                value_pargood.save();
                marketstate.totalInvestValue =
                        marketstate.totalInvestValue.minus(proof.proofValue);
                marketstate.totalInvestValue =
                        marketstate.totalInvestValue.plus(invest_value);
                marketstate.totalInvestCount =
                        marketstate.totalInvestCount.plus(ONE_BI);
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "invest";
                tx.transvalue = event.params._value
                        .div(BI_128)
                        .times(BigInt.fromString("2"));
                tx.fromgood = normal_good.id;
                tx.togood = value_good.id;
                tx.frompargood = normal_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = event.params._invest.mod(BI_128);
                tx.fromgoodfee = event.params._invest.div(BI_128);
                tx.togoodQuantity = event.params._valueinvest.mod(BI_128);
                tx.togoodfee = event.params._valueinvest.div(BI_128);
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();

                proof.good1 = normalgoodid;
                proof.good2 = valuegoodid;
                proof.proofValue = invest_value;
                proof.good1ContructFee = normal_contructFee;
                proof.good1Quantity = normal_Quantity;
                proof.good2ContructFee = value_contructFee;
                proof.good2Quantity = value_Quantity;
                proof.save();
                let ttsenv = tts_env.load("1");
                if (ttsenv === null) {
                        ttsenv = new tts_env("1");
                        ttsenv.poolvalue = ZERO_BI;
                        ttsenv.poolasset = ZERO_BI;
                        ttsenv.poolcontruct = ZERO_BI;
                        ttsenv.normalgoodid = ZERO_BI;
                        ttsenv.valuegoodid = ZERO_BI;
                        ttsenv.dao_admin = "#";
                        ttsenv.marketcontract = "#";
                        ttsenv.usdtcontract = "#";
                        ttsenv.publicsell = ZERO_BI;
                        ttsenv.lsttime = ZERO_BI;
                        ttsenv.actual_amount = ZERO_BI;
                        ttsenv.shares_index = ZERO_BI;
                        ttsenv.left_share = ZERO_BI;
                        ttsenv.usdt_amount = ZERO_BI;
                        ttsenv.lasttime = ZERO_BI;
                }
                ttsenv.lasttime = event.block.timestamp;
                ttsenv.poolasset = ttsenv.poolasset.plus(stakecontruct);
                ttsenv.poolcontruct = ttsenv.poolcontruct.plus(stakecontruct);
                ttsenv.poolvalue = ttsenv.poolvalue.plus(invest_value);
                ttsenv.poolvalue = ttsenv.poolvalue.plus(invest_value);
                ttsenv.save();

                log_GoodData(value_good, event.block.timestamp);
                log_ParGoodData(value_pargood, event.block.timestamp);
                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        } else {
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }

                newcustomer.investValue = newcustomer.investValue.minus(
                        proof.proofValue
                );

                newcustomer.investValue =
                        newcustomer.investValue.plus(invest_value);
                newcustomer.investCount = newcustomer.investCount.plus(ONE_BI);
                newcustomer.lastoptime = event.block.timestamp;
                newcustomer.stakettsvalue =
                        newcustomer.stakettsvalue.plus(invest_value);
                newcustomer.stakettscontruct =
                        newcustomer.stakettscontruct.plus(stakecontruct);
                newcustomer.save();

                log_CustomerData(newcustomer, event.block.timestamp);
                marketstate.totalInvestValue =
                        marketstate.totalInvestValue.minus(proof.proofValue);
                marketstate.totalInvestValue =
                        marketstate.totalInvestValue.plus(invest_value);
                marketstate.totalInvestCount =
                        marketstate.totalInvestCount.plus(ONE_BI);
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "invest";
                tx.transvalue = event.params._value.div(BI_128);
                tx.fromgood = normal_good.id;
                tx.togood = "0";
                tx.frompargood = normal_pargood.id;
                tx.topargood = "0";
                tx.fromgoodQuanity = event.params._invest.mod(BI_128);
                tx.fromgoodfee = event.params._invest.div(BI_128);
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();

                proof.good1 = normalgoodid;
                proof.good2 = valuegoodid;
                proof.proofValue = invest_value;
                proof.good1ContructFee = normal_contructFee;
                proof.good1Quantity = normal_Quantity;
                proof.good2ContructFee = ZERO_BI;
                proof.good2Quantity = ZERO_BI;
                proof.save();
                let ttsenv = tts_env.load("1");
                if (ttsenv === null) {
                        ttsenv = new tts_env("1");
                        ttsenv.poolvalue = ZERO_BI;
                        ttsenv.poolasset = ZERO_BI;
                        ttsenv.poolcontruct = ZERO_BI;
                        ttsenv.normalgoodid = ZERO_BI;
                        ttsenv.valuegoodid = ZERO_BI;
                        ttsenv.dao_admin = "#";
                        ttsenv.marketcontract = "#";
                        ttsenv.usdtcontract = "#";
                        ttsenv.publicsell = ZERO_BI;
                        ttsenv.lsttime = ZERO_BI;
                        ttsenv.actual_amount = ZERO_BI;
                        ttsenv.shares_index = ZERO_BI;
                        ttsenv.left_share = ZERO_BI;
                        ttsenv.usdt_amount = ZERO_BI;
                        ttsenv.lasttime = ZERO_BI;
                }
                ttsenv.lasttime = event.block.timestamp;
                ttsenv.poolasset = ttsenv.poolasset.plus(stakecontruct);
                ttsenv.poolcontruct = ttsenv.poolcontruct.plus(stakecontruct);
                ttsenv.poolvalue = ttsenv.poolvalue.plus(invest_value);
                ttsenv.save();

                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        }
}

export function handle_e_disinvestProof(event: e_disinvestProof): void {
        let normalgoodid = event.params._normalGoodNo.toString();
        let valuegoodid = event.params._valueGoodNo.toString();
        let proofNo = event.params._proofNo.toString();
        let marketmanage = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        );
        let proofstate = marketmanage.try_getProofState(event.params._proofNo);

        let invest_value = proofstate.value.state.div(BI_128);
        let tts_stakeproof = proofstate.value.state.mod(BI_128);
        let normal_contructFee = proofstate.value.invest.div(BI_128);
        let normal_Quantity = proofstate.value.invest.mod(BI_128);
        let normal_fee = event.params._normalgood.div(BI_128);
        let value_contructFee = proofstate.value.valueinvest.div(BI_128);
        let value_Quantity = proofstate.value.valueinvest.mod(BI_128);
        let value_fee = event.params._valuegood.div(BI_128);

        let proof = ProofState.load(proofNo);
        if (proof === null) {
                proof = new ProofState(proofNo);
                proof.owner = event.transaction.from.toHexString();
                proof.good1 = normalgoodid;
                proof.good2 = valuegoodid;
                proof.proofValue = ZERO_BI;
                proof.good1Quantity = ZERO_BI;
                proof.good2Quantity = ZERO_BI;
                proof.good1ContructFee = ZERO_BI;
                proof.good2ContructFee = ZERO_BI;
                proof.createTime = event.block.timestamp;
        }
        let devestvalue = proof.proofValue.minus(invest_value);
        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.goodseq = ZERO_BI;
                normal_good.pargood = "0";
                normal_good.isvaluegood = false;
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
                normal_good.create_time = ZERO_BI;
                normal_good.name_lower = "#";
                normal_good.symbol_lower = "#";
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
                normal_pargood.name_lower = "#";
                normal_pargood.symbol_lower = "#";
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

        let normalcurrentstate = TTSwap_Market.bind(
                Address.fromString(MARKET_ADDRESS)
        ).try_getGoodState(BigInt.fromString(normalgoodid));
        if (!normalcurrentstate.reverted) {
                normal_good.currentValue =
                        normalcurrentstate.value.currentState.div(BI_128);
                normal_good.currentQuantity =
                        normalcurrentstate.value.currentState.mod(BI_128);
                normal_good.investValue =
                        normalcurrentstate.value.investState.div(BI_128);
                normal_good.investQuantity =
                        normalcurrentstate.value.investState.mod(BI_128);
                normal_good.feeQuantity =
                        normalcurrentstate.value.feeQuantityState.div(BI_128);
                normal_good.contructFee =
                        normalcurrentstate.value.feeQuantityState.mod(BI_128);
        } else {
                normal_good.currentValue = normal_good.currentValue.minus(
                        proof.proofValue
                );
                normal_good.currentQuantity = normal_good.currentQuantity.minus(
                        proof.good1Quantity
                );
                normal_good.investValue = normal_good.investValue.minus(
                        proof.proofValue
                );
                normal_good.investQuantity = normal_good.investQuantity.minus(
                        proof.good1Quantity
                );
                normal_good.feeQuantity = normal_good.feeQuantity.minus(
                        proof.good1ContructFee
                );
                normal_good.contructFee = normal_good.contructFee.minus(
                        proof.good1ContructFee
                );
                normal_good.currentValue =
                        normal_good.currentValue.plus(invest_value);
                normal_good.currentQuantity =
                        normal_good.currentQuantity.plus(normal_Quantity);
                normal_good.investValue =
                        normal_good.investValue.plus(invest_value);
                normal_good.investQuantity =
                        normal_good.investQuantity.plus(normal_Quantity);
                normal_good.feeQuantity =
                        normal_good.feeQuantity.plus(normal_contructFee);
                normal_good.contructFee =
                        normal_good.contructFee.plus(normal_contructFee);
        }
        normal_good.totalDisinvestQuantity =
                normal_good.totalDisinvestQuantity.plus(proof.good1Quantity);
        normal_good.totalDisinvestQuantity =
                normal_good.totalDisinvestQuantity.minus(normal_Quantity);
        normal_good.totalDisinvestCount =
                normal_good.totalDisinvestCount.plus(ONE_BI);
        normal_good.modifiedTime = event.block.timestamp;
        normal_good.txCount = normal_good.txCount.plus(ONE_BI);
        normal_good.save();

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

        normal_pargood.totalDisinvestQuantity =
                normal_pargood.totalDisinvestQuantity.plus(proof.good1Quantity);

        normal_pargood.totalDisinvestQuantity =
                normal_pargood.totalDisinvestQuantity.minus(normal_Quantity);
        normal_pargood.totalDisinvestCount =
                normal_pargood.totalDisinvestCount.plus(ONE_BI);

        normal_pargood.txCount = normal_pargood.txCount.plus(ONE_BI);
        normal_pargood.save();
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
                marketstate.totalTradeValue = ZERO_BI;
        }
        if (valuegoodid != "0") {
                let value_good = GoodState.load(valuegoodid);
                if (value_good === null) {
                        value_good = new GoodState(valuegoodid);
                        value_good.goodseq = ZERO_BI;
                        value_good.pargood = "0";
                        value_good.isvaluegood = false;
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
                        value_good.create_time = ZERO_BI;
                        value_good.name_lower = "#";
                        value_good.symbol_lower = "#";
                }

                let value_pargood = ParGoodState.load(value_good.erc20Address);
                if (value_pargood === null) {
                        value_pargood = new ParGoodState(
                                value_good.erc20Address
                        );
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
                        value_pargood.name_lower = "#";
                        value_pargood.symbol_lower = "#";
                }
                value_pargood.currentValue = value_pargood.currentValue.minus(
                        value_good.currentValue
                );
                value_pargood.currentQuantity =
                        value_pargood.currentQuantity.minus(
                                value_good.currentQuantity
                        );
                value_pargood.investValue = value_pargood.investValue.minus(
                        value_good.investValue
                );
                value_pargood.investQuantity =
                        value_pargood.investQuantity.minus(
                                value_good.investQuantity
                        );
                value_pargood.feeQuantity = value_pargood.feeQuantity.minus(
                        value_good.feeQuantity
                );
                value_pargood.contructFee = value_pargood.contructFee.minus(
                        value_good.contructFee
                );

                let valuecurrentstate = TTSwap_Market.bind(
                        Address.fromString(MARKET_ADDRESS)
                ).try_getGoodState(BigInt.fromString(valuegoodid));
                if (!valuecurrentstate.reverted) {
                        value_good.currentValue =
                                valuecurrentstate.value.currentState.div(
                                        BI_128
                                );
                        value_good.currentQuantity =
                                valuecurrentstate.value.currentState.mod(
                                        BI_128
                                );
                        value_good.investValue =
                                valuecurrentstate.value.investState.div(BI_128);
                        value_good.investQuantity =
                                valuecurrentstate.value.investState.mod(BI_128);
                        value_good.feeQuantity =
                                valuecurrentstate.value.feeQuantityState.div(
                                        BI_128
                                );
                        value_good.contructFee =
                                valuecurrentstate.value.feeQuantityState.mod(
                                        BI_128
                                );
                } else {
                        value_good.currentValue = value_good.currentValue.minus(
                                proof.proofValue
                        );
                        value_good.currentQuantity =
                                value_good.currentQuantity.minus(
                                        proof.good2Quantity
                                );
                        value_good.investValue = value_good.investValue.minus(
                                proof.proofValue
                        );
                        value_good.investQuantity =
                                value_good.investQuantity.minus(
                                        proof.good2Quantity
                                );
                        value_good.feeQuantity = value_good.feeQuantity.minus(
                                proof.good2ContructFee
                        );
                        value_good.contructFee = value_good.contructFee.minus(
                                proof.good2ContructFee
                        );

                        value_good.currentValue =
                                value_good.currentValue.plus(invest_value);
                        value_good.currentQuantity =
                                value_good.currentQuantity.plus(value_Quantity);
                        value_good.investValue =
                                value_good.investValue.plus(invest_value);
                        value_good.investQuantity =
                                value_good.investQuantity.plus(value_Quantity);
                        value_good.feeQuantity =
                                value_good.feeQuantity.plus(value_contructFee);
                        value_good.contructFee =
                                value_good.contructFee.plus(value_contructFee);
                }

                value_good.totalDisinvestQuantity =
                        value_good.totalDisinvestQuantity.plus(
                                proof.good2Quantity
                        );
                value_good.totalDisinvestQuantity =
                        value_good.totalDisinvestQuantity.minus(value_Quantity);
                value_good.totalDisinvestCount =
                        value_good.totalDisinvestCount.plus(ONE_BI);
                value_good.modifiedTime = event.block.timestamp;
                value_good.txCount = value_good.txCount.plus(ONE_BI);
                value_good.save();
                value_pargood.currentValue = value_pargood.currentValue.plus(
                        value_good.currentValue
                );
                value_pargood.currentQuantity =
                        value_pargood.currentQuantity.plus(
                                value_good.currentQuantity
                        );
                value_pargood.investValue = value_pargood.investValue.plus(
                        value_good.investValue
                );
                value_pargood.investQuantity =
                        value_pargood.investQuantity.plus(
                                value_good.investQuantity
                        );
                value_pargood.feeQuantity = value_pargood.feeQuantity.plus(
                        value_good.feeQuantity
                );
                value_pargood.contructFee = value_pargood.contructFee.plus(
                        value_good.contructFee
                );
                value_pargood.totalDisinvestQuantity =
                        value_pargood.totalDisinvestQuantity.plus(
                                proof.good2Quantity
                        );
                value_pargood.totalDisinvestQuantity =
                        value_pargood.totalDisinvestQuantity.minus(
                                value_Quantity
                        );
                value_pargood.totalDisinvestCount =
                        value_pargood.totalDisinvestCount.plus(ONE_BI);
                value_pargood.txCount = value_pargood.txCount.plus(ONE_BI);
                value_pargood.save();

                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.plus(proof.proofValue);

                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.plus(proof.proofValue);
                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.minus(invest_value);

                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.minus(invest_value);
                marketstate.totalDisinvestCount =
                        marketstate.totalDisinvestCount.plus(ONE_BI);
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "divest";
                tx.transvalue = event.params._value.div(BI_128);
                tx.fromgood = normal_good.id;
                tx.togood = value_good.id;
                tx.frompargood = normal_pargood.id;
                tx.topargood = value_pargood.id;
                tx.fromgoodQuanity = proof.good1Quantity;
                tx.fromgoodQuanity = tx.fromgoodQuanity.minus(normal_Quantity);
                tx.fromgoodfee = normal_fee;
                tx.togoodQuantity = proof.good2Quantity;
                tx.togoodQuantity = tx.togoodQuantity.minus(value_Quantity);
                tx.togoodfee = value_fee;
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();
                proof.proofValue = invest_value;
                proof.good1ContructFee = normal_contructFee;
                proof.good1Quantity = normal_Quantity;
                proof.good2ContructFee = value_contructFee;
                proof.good2Quantity = value_Quantity;
                proof.save();
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }
                newcustomer.getfromstake =
                        newcustomer.getfromstake.plus(tts_stakeproof);
                newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                        proof.proofValue
                );
                newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                        proof.proofValue
                );

                newcustomer.disinvestValue =
                        newcustomer.disinvestValue.minus(invest_value);
                newcustomer.disinvestValue =
                        newcustomer.disinvestValue.minus(invest_value);
                newcustomer.disinvestCount =
                        newcustomer.disinvestCount.plus(ONE_BI);
                newcustomer.totalprofitvalue.plus(
                        normal_good.currentValue
                                .times(event.params._profit.div(BI_128))
                                .div(normal_good.currentQuantity)
                );
                newcustomer.totalprofitvalue.plus(
                        value_good.currentValue
                                .times(event.params._profit.mod(BI_128))
                                .div(value_good.currentQuantity)
                );

                newcustomer.lastoptime = event.block.timestamp;
                newcustomer.save();
                log_CustomerData(newcustomer, event.block.timestamp);
                log_GoodData(value_good, event.block.timestamp);
                log_ParGoodData(value_pargood, event.block.timestamp);
                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        } else {
                let newcustomer = Customer.load(
                        event.transaction.from.toHexString()
                );
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
                        marketstate.userCount =
                                marketstate.userCount.plus(ONE_BI);
                        newcustomer.customerno = marketstate.userCount;
                        newcustomer.totalprofitvalue = ZERO_BI;
                        newcustomer.totalcommissionvalue = ZERO_BI;
                        newcustomer.referralnum = ZERO_BI;
                        newcustomer.getfromstake = ZERO_BI;
                        newcustomer.stakettsvalue = ZERO_BI;
                        newcustomer.stakettscontruct = ZERO_BI;
                }
                newcustomer.disinvestValue = newcustomer.disinvestValue.plus(
                        proof.proofValue
                );
                newcustomer.disinvestValue =
                        newcustomer.disinvestValue.minus(invest_value);
                newcustomer.disinvestCount =
                        newcustomer.disinvestCount.plus(ONE_BI);
                newcustomer.totalprofitvalue.plus(
                        normal_good.currentValue
                                .times(event.params._profit.div(BI_128))
                                .div(normal_good.currentQuantity)
                );

                newcustomer.lastoptime = event.block.timestamp;
                newcustomer.save();

                log_CustomerData(newcustomer, event.block.timestamp);
                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.plus(proof.proofValue);
                marketstate.totalDisinvestValue =
                        marketstate.totalDisinvestValue.minus(invest_value);
                marketstate.totalDisinvestCount =
                        marketstate.totalDisinvestCount.plus(ONE_BI);
                marketstate.txCount = marketstate.txCount.plus(ONE_BI);
                marketstate.save();

                let transid =
                        normalgoodid +
                        normal_good.txCount.mod(BigInt.fromU32(500)).toString();
                let tx = Transaction.load(transid);
                if (tx === null) {
                        tx = new Transaction(transid);
                        tx.fromgoodQuanity = ZERO_BI;
                        tx.fromgoodfee = ZERO_BI;
                        tx.togoodQuantity = ZERO_BI;
                        tx.togoodfee = ZERO_BI;
                        tx.timestamp = ZERO_BI;
                }
                tx.blockNumber = event.block.number;
                tx.transtype = "divest";
                tx.transvalue = event.params._value;
                tx.fromgood = normal_good.id;
                tx.togood = "0";
                tx.frompargood = normal_pargood.id;
                tx.topargood = "0";
                tx.fromgoodQuanity = proof.good1Quantity;
                tx.fromgoodQuanity = tx.fromgoodQuanity.minus(normal_Quantity);
                tx.fromgoodfee = normal_fee;
                tx.timestamp = event.block.timestamp;
                tx.recipent = event.transaction.from.toHexString();
                tx.hash = event.transaction.hash.toHexString();
                tx.save();

                proof.proofValue = invest_value;
                proof.good1ContructFee = normal_contructFee;
                proof.good1Quantity = normal_Quantity;
                proof.save();
                log_GoodData(normal_good, event.block.timestamp);
                log_ParGoodData(normal_pargood, event.block.timestamp);
                log_MarketData(marketstate, event.block.timestamp);
        }
}

// // banlist ok
export function handle_e_addbanlist(event: e_addbanlist): void {
        let newcustomer = Customer.load(event.params._user.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(event.params._user.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                newcustomer.customerno = ZERO_BI;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }
        newcustomer.isBanlist = true;

        newcustomer.lastoptime = event.block.timestamp;
        newcustomer.save();
        log_CustomerData(newcustomer, event.block.timestamp);
}

export function handle_e_removebanlist(event: e_removebanlist): void {
        let newcustomer = Customer.load(event.params._user.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(event.params._user.toHexString());
                newcustomer.refer = "#";
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                newcustomer.customerno = ZERO_BI;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }
        newcustomer.isBanlist = true;
        newcustomer.lastoptime = event.block.timestamp;
        newcustomer.save();
        log_CustomerData(newcustomer, event.block.timestamp);
}

export function handle_e_collectcommission(event: e_collectcommission): void {
        let newcustomer = Customer.load(event.transaction.from.toHexString());
        if (newcustomer === null) {
                newcustomer = new Customer(
                        event.transaction.from.toHexString()
                );
                newcustomer.tradeValue = ZERO_BI;
                newcustomer.investValue = ZERO_BI;
                newcustomer.disinvestValue = ZERO_BI;
                newcustomer.tradeCount = ZERO_BI;
                newcustomer.investCount = ZERO_BI;
                newcustomer.disinvestCount = ZERO_BI;
                newcustomer.isBanlist = false;
                newcustomer.refer = "#";
                newcustomer.customerno = ZERO_BI;
                newcustomer.totalprofitvalue = ZERO_BI;
                newcustomer.totalcommissionvalue = ZERO_BI;
                newcustomer.referralnum = ZERO_BI;
                newcustomer.getfromstake = ZERO_BI;
                newcustomer.stakettsvalue = ZERO_BI;
                newcustomer.stakettscontruct = ZERO_BI;
        }
        let goodidarrary = event.params._gooid;
        let commissionarray = event.params._commisionamount;

        for (let aa = 0; aa < goodidarrary.length; aa++) {
                let good = GoodState.load(goodidarrary[aa].toString());
                if (good !== null) {
                        newcustomer.totalcommissionvalue =
                                newcustomer.totalcommissionvalue.plus(
                                        good.currentValue
                                                .times(commissionarray[aa])
                                                .div(good.currentQuantity)
                                );
                }
        }
        newcustomer.save();
        log_CustomerData(newcustomer, event.block.timestamp);
}

export function handle_e_goodWelfare(event: e_goodWelfare): void {
        let normalgoodid = event.params.goodid.toString();
        let warefare = event.params.welfare;
        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.goodseq = ZERO_BI;
                normal_good.pargood = "0";
                normal_good.isvaluegood = false;
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
                normal_good.create_time = ZERO_BI;
                normal_good.name_lower = "#";
                normal_good.symbol_lower = "#";
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
                normal_pargood.name_lower = "#";
                normal_pargood.symbol_lower = "#";
        }
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.minus(
                normal_good.feeQuantity
        );
        normal_good.feeQuantity = normal_good.feeQuantity.plus(warefare);
        normal_pargood.feeQuantity = normal_pargood.feeQuantity.plus(
                normal_good.feeQuantity
        );
        normal_good.save();
        normal_pargood.save();
}

export function handle_e_changegoodowner(event: e_changegoodowner): void {
        let normalgoodid = event.params.goodid.toString();
        let normal_good = GoodState.load(normalgoodid);
        if (normal_good === null) {
                normal_good = new GoodState(normalgoodid);
                normal_good.goodseq = ZERO_BI;
                normal_good.pargood = "0";
                normal_good.isvaluegood = false;
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
                normal_good.create_time = ZERO_BI;
                normal_good.name_lower = "#";
                normal_good.symbol_lower = "#";
        }
        normal_good.owner = event.params.to.toHexString();
        normal_good.save();
}

export function handle_e_transferdel(event: e_transferdel): void {
        let fromproofid = event.params.delproofid.toString();
        let existsproofid = event.params.existsproofid.toString();
        let fromproof = ProofState.load(fromproofid.toString());
        if (fromproof === null) {
                fromproof = new ProofState(fromproofid.toString());
                fromproof.owner = "#";
                fromproof.good1 = "#";
                fromproof.good2 = "#";
                fromproof.proofValue = ZERO_BI;
                fromproof.good1Quantity = ZERO_BI;
                fromproof.good2Quantity = ZERO_BI;
                fromproof.good1ContructFee = ZERO_BI;
                fromproof.good2ContructFee = ZERO_BI;
                fromproof.createTime = event.block.timestamp;
        }

        let existsproof = ProofState.load(existsproofid.toString());
        if (existsproof === null) {
                existsproof = new ProofState(existsproofid.toString());
                existsproof.owner = "#";
                existsproof.good1 = "#";
                existsproof.good2 = "#";
                existsproof.proofValue = ZERO_BI;
                existsproof.good1Quantity = ZERO_BI;
                existsproof.good2Quantity = ZERO_BI;
                existsproof.good1ContructFee = ZERO_BI;
                existsproof.good2ContructFee = ZERO_BI;
                existsproof.createTime = event.block.timestamp;
        }

        existsproof.proofValue = existsproof.proofValue.plus(
                existsproof.proofValue
        );
        existsproof.good1Quantity = existsproof.good1Quantity.plus(
                existsproof.good1Quantity
        );
        existsproof.good2Quantity = existsproof.good2Quantity.plus(
                existsproof.good2Quantity
        );
        existsproof.good1ContructFee = existsproof.good1ContructFee.plus(
                existsproof.good1ContructFee
        );
        existsproof.good2ContructFee = existsproof.good2ContructFee.plus(
                existsproof.good2ContructFee
        );
        existsproof.save();

        store.remove("ProofState", fromproofid.toString());
}
