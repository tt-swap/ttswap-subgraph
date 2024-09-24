/* eslint-disable prefer-const */
import { TTSwap_Market } from "../../generated/TTSwap_Market/TTSwap_Market";
import { BigInt, Address } from "@graphprotocol/graph-ts";

export function fetchMarketConfig(tokenAddress: Address): BigInt {
        let contract = TTSwap_Market.bind(tokenAddress);
        let MarketConfig = BigInt.fromU64(0);
        let MarketConfigResult = contract.try_marketconfig();
        if (!MarketConfigResult.reverted) {
                MarketConfig = BigInt.fromString(
                        MarketConfigResult.value[0].toString()
                );
        } else {
                MarketConfig = BigInt.fromU32(0);
        }
        return MarketConfig;
}

// export function fetchMarketCreator(tokenAddress: Address): string {
//         let contract = MarketManager.bind(tokenAddress);
//         let MarketCreator = "0";
//         let MarketCreatorResult = contract.try_marketcreator();
//         if (!MarketCreatorResult.reverted) {
//                 MarketCreator = MarketCreatorResult.value.toHexString();
//         } else {
//                 MarketCreator = MarketCreator = "0";
//         }
//         return MarketCreator;
// }
