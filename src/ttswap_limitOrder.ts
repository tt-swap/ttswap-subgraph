import { Address, BigInt, store, dataSource } from "@graphprotocol/graph-ts";

import { Customer, LimitOrderEnv, LimitOrders } from "../generated/schema";

import {
        e_addLimitOrder,
        e_changemarketcreator,
        e_cleandeadorder,
        e_cleandeadorders,
        e_removeLimitOrder,
        e_setmaxfreeremain,
        e_takeOrder,
        e_updateLimitOrder,
        e_deploy,
        e_addmaxslot,
        e_takeOrderChips,
} from "../generated/TTSwap_LimitOrder/TTSwap_LimitOrder";

import { LIMITORDER_ADDRESS, BI_128, ZERO_BI, ONE_BI } from "./util/constants";

import {
        fetchTokenSymbol,
        fetchTokenName,
        fetchTokenTotalSupply,
        fetchTokenDecimals,
} from "./util/token";

import { fetchMarketConfig } from "./util/market";

import { log_GoodData, fetchGoodConfig } from "./util/good";
import { log_MarketData } from "./util/marketData";
import { log_CustomerData } from "./util/customer";

/**
 * Handles the event of setting market configuration
 * @param event The e_changemarketcreator event
 */
export function handle_e_changemarketcreator(
        event: e_changemarketcreator
): void {
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.marketcreator =
                        event.params._newmarketcreator.toHexString();
                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_setmaxfreeremain event
 */
export function handle_e_setmaxfreeremain(event: e_setmaxfreeremain): void {
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.maxfreeremain = event.params._maxfreeremain;
                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_setmaxfreeremain event
 */
export function handle_e_addLimitOrder(event: e_addLimitOrder): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order === null) {
                order = new LimitOrders(event.params._orderid.toString());
        }
        order.orderstatus = ONE_BI;
        order.orderowner = event.params._sender.toHexString();
        order.fromerc20 = event.params._fromerc20.toHexString();
        order.toerc20 = event.params._toerc20.toHexString();
        order.fromQuantity = event.params._amount.div(BI_128);
        order.toQuantity = event.params._amount.mod(BI_128);
        order.altertimestamp = event.block.timestamp;
        order.save();
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.createcount =
                        limitorderenv.createcount.plus(ONE_BI);
                limitorderenv.existscount =
                        limitorderenv.existscount.plus(ONE_BI);
                limitorderenv.orderpointer = event.params._orderid;

                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_takeOrder event
 */
export function handle_e_takeOrder(event: e_takeOrder): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order !== null) {
                order.orderstatus = ZERO_BI;
                order.save();
        }
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.successcount =
                        limitorderenv.successcount.plus(ONE_BI);
                limitorderenv.existscount =
                        limitorderenv.existscount.minus(ONE_BI);
                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_removeLimitOrder event
 */
export function handle_e_removeLimitOrder(event: e_removeLimitOrder): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order !== null) {
                order = new LimitOrders(event.params._orderid.toString());
                order.orderstatus = ZERO_BI;
                order.save();
        }
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.removecount =
                        limitorderenv.removecount.plus(ONE_BI);
                limitorderenv.existscount =
                        limitorderenv.existscount.minus(ONE_BI);
                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_removeLimitOrder event
 */
export function handle_e_cleandeadorder(event: e_cleandeadorder): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order !== null) {
                order = new LimitOrders(event.params._orderid.toString());
                order.orderstatus = ZERO_BI;
                order.save();
        }
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.cleancount =
                        limitorderenv.cleancount.plus(ONE_BI);
                limitorderenv.existscount =
                        limitorderenv.existscount.minus(ONE_BI);
                limitorderenv.save();
        }
}
/**
 * Handles the event of setting market configuration
 * @param event The e_removeLimitOrder event
 */
export function handle_e_cleandeadorders(event: e_cleandeadorders): void {
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        for (let aa = 0; aa < event.params._orderids.length; aa++) {
                let order = LimitOrders.load(
                        event.params._orderids[aa].toString()
                );
                if (order !== null) {
                        order = new LimitOrders(
                                event.params._orderids.toString()
                        );
                        order.orderstatus = ZERO_BI;
                        order.save();
                }

                if (limitorderenv !== null) {
                        limitorderenv.cleancount =
                                limitorderenv.cleancount.plus(ONE_BI);
                        limitorderenv.existscount =
                                limitorderenv.existscount.minus(ONE_BI);
                }
        }
        if (limitorderenv !== null) limitorderenv.save();
}

/**
 * Handles the event of setting market configuration
 * @param event The e_takeOrder event
 */
export function handle_e_updateLimitOrder(event: e_updateLimitOrder): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order === null) {
                order = new LimitOrders(event.params._orderid.toString());
        }
        order.fromerc20 = event.params._fromerc20.toHexString();
        order.toerc20 = event.params._toerc20.toHexString();
        order.fromQuantity = event.params._amount.div(BI_128);
        order.toQuantity = event.params._amount.mod(BI_128);
        order.altertimestamp = event.block.timestamp;
        order.save();
}

/**
 * Handles the event of setting market configuration
 * @param event The e_takeOrder event
 */
export function handle_e_deploy(event: e_deploy): void {
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv === null) {
                limitorderenv = new LimitOrderEnv(
                        dataSource.address().toString()
                );
                limitorderenv.marketcreator =
                        event.params.marketcreator.toHexString();
                limitorderenv.maxfreeremain = event.params.maxfreeremain;
                limitorderenv.maxslot = event.params.param2;
                limitorderenv.orderpointer = ZERO_BI;
                limitorderenv.createcount = ZERO_BI;
                limitorderenv.successcount = ZERO_BI;
                limitorderenv.cleancount = ZERO_BI;
                limitorderenv.removecount = ZERO_BI;
                limitorderenv.existscount = ZERO_BI;
                limitorderenv.save();
        }
}
/**
 * Handles the event of setting market configuration
 * @param event The e_takeOrder event
 */
export function handle_e_addmaxslot(event: e_addmaxslot): void {
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.maxslot = event.params.param0;
                limitorderenv.save();
        }
}

/**
 * Handles the event of setting market configuration
 * @param event The e_takeOrder event
 */
export function handle_e_takeOrderChips(event: e_takeOrderChips): void {
        let order = LimitOrders.load(event.params._orderid.toString());
        if (order !== null) {
                order.fromQuantity = event.params.amount.div(BI_128);
                order.toQuantity = event.params.amount.mod(BI_128);
                order.save();
        }
        let limitorderenv = LimitOrderEnv.load(dataSource.address().toString());
        if (limitorderenv !== null) {
                limitorderenv.successcount =
                        limitorderenv.successcount.plus(ONE_BI);
                limitorderenv.save();
        }
}
