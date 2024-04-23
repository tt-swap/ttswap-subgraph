import {beforeAll, describe,test} from "matchstick-as/assembly/index"
import {handle_fn_setMarketConfig} from '../src/marketmanage'
import {GoodState, } from "../generated/schema"
import {MARKET_ADDRESS,BI_128,ZERO_BI,ONE_BI} from "../src/util/constants"

beforeAll(()=>{
    let goodstate = new GoodState("1");
    goodstate.id: ID!
    goodstate.ParGood:ParGoodState!
    goodstate.tokenname: String!
    goodstate.tokensymbol: String!
    goodstate.tokentotalsuply: BigInt!
    goodstate.tokendecimals: BigInt!
    goodstate.owner=''
    goodstate.erc20Address=''
    goodstate.goodConfig=''
    goodstate.currentValue=''
    goodstate.currentQuantity: BigInt!
    goodstate.investValue: BigInt!
    goodstate.investQuantity: BigInt!
    goodstate.feeQuantity=ZERO_BI
    goodstate.contructFee=ZERO_BI
    goodstate.totalSellQuantity=ZERO_BI
    goodstate.totalBuyQuantity=ZERO_BI
    goodstate.totalInvestQuantity=ZERO_BI
    goodstate.totalDisinvestQuantity=ZERO_BI
    goodstate.totalFeeIncome=ZERO_BI
    goodstate.totalFeeOutcome=ZERO_BI
    goodstate.modifiedTime=ZERO_BI

})

describe("handle_fn_initMetaGood()",()=>{test("show create a metagood",()=>{})})