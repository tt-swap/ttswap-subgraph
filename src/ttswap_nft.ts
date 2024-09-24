import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ProofState } from "../generated/schema";

import { Transfer } from "../generated/TTSwap_NFT/TTSwap_NFT";

import { MARKET_ADDRESS, BI_128, ZERO_BI, ONE_BI } from "./util/constants";

export function handle_e_Transfer(event: Transfer): void {
        let from = event.params.from.toHexString();
        let to = event.params.to.toHexString();
        let token = event.params.tokenId;
        let proof = ProofState.load(token.toString());
        if (proof === null) {
                proof = new ProofState(token.toString());
                proof.owner = to;
                proof.good1 = "#";
                proof.good2 = "#";
                proof.proofValue = ZERO_BI;
                proof.good1Quantity = ZERO_BI;
                proof.good2Quantity = ZERO_BI;
                proof.good1ContructFee = ZERO_BI;
                proof.good2ContructFee = ZERO_BI;
                proof.createTime = event.block.timestamp;
        }
        proof.owner = to;
        proof.save();
}
