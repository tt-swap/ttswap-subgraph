# TTSWAP subgraph
## 1.Instruction
TTSWAP (token-token swap) is an automated market-making protocol built on the EVM blockchain, which means it doesn't rely on centralized institutions or individuals to facilitate trades. The coreprinciple of TTSWAP is to automatically trigger market value transfers based on user actions, creating a platform based on a constant value trading model.
To effectively track and analyze ttswap avtivities, we  have published  a subgraph for ttswap contract using The Graph. You can use the Query Url to request data or test it directly in the playground.
## 2.Core events
these are many events used in the subgraph.
### 2.1.e_initMetaGood
Trigger when initial first goods in market after deploy market contracts.
### 2.2.e_initGood
Trigger when customer create goods         
### 2.3.e_buyGood
Trigger when custemer buy goods          
### 2.4.e_buyGoodForPay
Trigger when custemer pay goods
### 2.5.e_investGood
Trigger when custemer pay goods       
### 2.6.e_disinvestProof
Trigger when customer devest proof or remove liquidity          
### 2.7.e_collectProof
Trigger when customer collect proof profit
### 2.8.e_setMarketConfig
Trigger when market manager change config          
### 2.9.e_changeOwner
Trigger when good's owner change by marketor
### 2.10.e_updateGoodConfig
Triggr when update Good Config by goods' owner
### 2.11.e_modifyGoodConfig
Trigger when update Good Config by marketor    
### 2.12.e_addbanlist
Trigger when need to ban customer   by marketor    
### 2.13.e_removebanlist
Trigger when need to remove customer out of banlist by marketor 
### 2.14.e_addreferal
Trigger when customer add referal
### 2.15.Transfer
Trigger when proof transfer
## 3.Entities
Based on these events , we build these entities:
### 3.1.marketState
* Represent the market state such as total trade, total user,total invest amount.
* Field
  * id
  * marketConfig
  * pargoodCount
  * goodCount
  * proofCount
  * userCount
  * txCount
  * totalTradeValue
  * totalInvestValue
  * totalDisinvestValue
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * marketCreator # marketcreator's address
### 3.2.marketData
* Snapshot marketstate 
* Field
  * id
  * timetype 
    h:total 121 rows data from record every minute;
    d:total 145 rows data from record every 20 mimutes;
    w:total 113 rows data from record every 3 hours;
    m:total 70 rows data from record every 12 hours;
    y:record every 5 days
  * marketConfig
  * pargoodCount
  * goodCount
  * proofCount
  * userCount
  * txCount
  * totalTradeValue
  * totalInvestValue
  * totalDisinvestValue
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * modifiedTime
### 3.3.goodState
* Represent the goods state such as total trade, total user,total invest amount.
* Field
  * id
  * goodseq
  * pargood:ParGoodState!
  * isvaluegood
  * tokenname
  * tokensymbol
  * tokentotalsuply
  * tokendecimals
  * owner
  * erc20Address
  * goodConfig
  * currentValue
  * currentQuantity
  * investValue
  * investQuantity
  * feeQuantity
  * contructFee
  * totalTradeQuantity
  * totalInvestQuantity
  * totalDisinvestQuantity
  * totalProfit
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * modifiedTime
  * txCount
  * create_time
  * normalProof_v: [ProofState!] @derivedFrom(field: "good2")
  * normalProof_n: [ProofState!] @derivedFrom(field: "good1")
  * goodData: [GoodData!] @derivedFrom(field: "good")
### 3.4.goodData
* Snapshot good state
* Field
  * id
  * good
  * timetype
    h:total 121 rows data from record every minute;
    d:total 145 rows data from record every 20 mimutes;
    w:total 113 rows data from record every 3 hours;
    m:total 70 rows data from record every 12 hours;
    y:record every 5 days
  * modifiedTime
  * goodConfig
  * isvaluegood
  * decimals
  * currentValue
  * currentQuantity
  * investValue
  * investQuantity
  * feeQuantity
  * contructFee
  * totalTradeQuantity
  * totalInvestQuantity
  * totalDisinvestQuantity
  * totalProfit
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * open
  * high
  * low
  * close
### 3.5.pargoodState
* Represent pargood state such as total trade, total user,total invest amount.
* Field
  * id
  * tokenname
  * tokensymbol
  * tokentotalsuply
  * tokendecimals
  * erc20Address
  * currentValue
  * currentQuantity
  * investValue
  * investQuantity
  * feeQuantity
  * contructFee
  * totalTradeQuantity
  * totalInvestQuantity
  * totalDisinvestQuantity
  * totalProfit
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * goodCount  
  * txCount
  * Goodlist:[GoodState!] @derivedFrom(field: "pargood")
  * parGooddata:[ParGoodData!] @derivedFrom(field: "pargood")
### 3.6.pargoodData
* Snapshot the pargood states 
* Field
  * id
  * pargood: ParGoodState!
  * timetype
    h:total 121 rows data from record every minute;
    d:total 145 rows data from record every 20 mimutes;
    w:total 113 rows data from record every 3 hours;
    m:total 70 rows data from record every 12 hours;
    y:record every 5 days
  * modifiedTime
  * decimals
  * currentValue
  * currentQuantity
  * investValue
  * investQuantity
  * feeQuantity
  * contructFee
  * totalTradeQuantity
  * totalInvestQuantity
  * totalDisinvestQuantity
  * totalProfit
  * totalTradeCount
  * totalInvestCount
  * totalDisinvestCount
  * open
  * high
  * low
  * close
### 3.7.customer
* Represent customer's information,such as referal,trade count.
* Field
  * id
  * refer
  * tradeValue
  * investValue
  * disinvestValue
  * tradeCount
  * investCount
  * disinvestCount
  * isBanlist
  * customerno
### 3.8.proofState
* Represent proof status such as proof's owner,value good quantity,normal good quantity.
* Field
  * id
  * owner
  * good1
  * good2
  * proofValue
  * good1ContructFee
  * good1Quantity
  * good2ContructFee
  * good2Quantity
  * createTime
### 3.9.transaction
* Represent user's transaction detail such as fromgood,togood,from quantity,to quantity,fee quantity
* Field
  * id
  * blockNumber
  * transtype
  * transvalue
  * fromgood:GoodState!
  * togood:GoodState!
  * frompargood:ParGoodState!
  * topargood:ParGoodState!
  * fromgoodQuanity
  * fromgoodfee
  * togoodQuantity
  * togoodfee
  * hash
  * recipent
  * timestamp

## 4.Examples

### 4.1.Query Market State Information
* Query
```graphql
{
  marketStates(first: 1) {
    id
    marketConfig
    marketCreator
    goodCount
    pargoodCount
    proofCount
    totalDisinvestCount
    totalDisinvestValue
    totalInvestCount
    totalInvestValue
    totalTradeCount
    totalTradeValue
    txCount
    userCount
  }
}
```
* Response
```json
{
  "data": {
    "marketStates": [
      {
        "id": "0xC564c491EF1639C83b6F721374b5531ba6A1EcEb",
        "marketConfig": "0",
        "marketCreator": "0x0f18a2428c934db7b9e040f8fc6e08975cbef07a",
        "goodCount": "4",
        "pargoodCount": "3",
        "proofCount": "3",
        "totalDisinvestCount": "1",
        "totalDisinvestValue": "131986800000",
        "totalInvestCount": "5",
        "totalInvestValue": "13636907477922",
        "totalTradeCount": "68",
        "totalTradeValue": "5878527659184",
        "txCount": "74",
        "userCount": "3"
      }
    ]
  }
}
```
### 4.2.Query Market Snapshot Information
* Query
```graphql
{
  marketDatas(
    first: 1
    where: {timetype: "d"}
    orderBy: modifiedTime
    orderDirection: desc
  ) {
    goodCount
    id
    marketConfig
    modifiedTime
    pargoodCount
    proofCount
    timetype
    totalDisinvestCount
    totalDisinvestValue
    totalInvestCount
    totalInvestValue
    totalTradeCount
    totalTradeValue
    txCount
    userCount
  }
}
```
* Response
```json
{
  "data": {
    "marketDatas": [
      {
        "goodCount": "4",
        "id": "d14",
        "marketConfig": "0",
        "modifiedTime": "1723460052",
        "pargoodCount": "3",
        "proofCount": "3",
        "timetype": "d",
        "totalDisinvestCount": "1",
        "totalDisinvestValue": "131986800000",
        "totalInvestCount": "5",
        "totalInvestValue": "13636907477922",
        "totalTradeCount": "67",
        "totalTradeValue": "5872619836063",
        "txCount": "73",
        "userCount": "3"
      }
    ]
  }
}
```
### 4.3.Query Goods State Information
* Query
```graphql
{
  goodStates(
    where: {id: "62228789954470825507986060196042077180472255078656628425209115580690578781452"}
  ) {
    id
    isvaluegood
    erc20Address
    goodConfig
    currentQuantity
    currentValue
    investQuantity
    investValue
    feeQuantity
    contructFee
    create_time
    modifiedTime
    goodseq
  }
}
```
* Response
```json
{
  "data": {
    "goodStates": [
      {
        "id": "62228789954470825507986060196042077180472255078656628425209115580690578781452",
        "isvaluegood": true,
        "erc20Address": "0xa35e43e7a5839b31624dad3f35da63875e705934",
        "goodConfig": "57896044618878725283973565542178138273236221817720714337193115789075381485568",
        "currentQuantity": "6819420616060",
        "currentValue": "6770056758680",
        "investQuantity": "6816428290000",
        "investValue": "6802510333961",
        "feeQuantity": "6763451170",
        "contructFee": "3174177404",
        "create_time": "1722309996",
        "modifiedTime": "1723446576",
        "goodseq": "1"
      }
    ]
  }
}
```
### 4.4.Query Goods Snapshot Information
* Query
```graphql
{
  goodDatas(
    orderBy: modifiedTime
    orderDirection: desc
    where: {timetype: "d"}
    first: 1
  ) {
    id
    feeQuantity
    decimals
    goodConfig
    currentValue
    currentQuantity
    contructFee
    investValue
    investQuantity
    isvaluegood
    modifiedTime
    timetype
    totalTradeQuantity
    totalTradeCount
    totalProfit
    totalInvestQuantity
    totalInvestCount
    totalDisinvestQuantity
    totalDisinvestCount
  }
}
```
* Response
```json
{
  "data": {
    "goodDatas": [
      {
        "id": "8865411095942640069612110311771018411581514354974486424174672250950578377932d136",
        "feeQuantity": "5052271",
        "decimals": "8",
        "goodConfig": "220627572189605533375050235459587831927582626647942524241000267776",
        "currentValue": "3045230224124",
        "currentQuantity": "5150964239",
        "contructFee": "0",
        "investValue": "3233676600000",
        "investQuantity": "4900000000",
        "isvaluegood": false,
        "modifiedTime": "1723460052",
        "timetype": "d",
        "totalTradeQuantity": "8399237641",
        "totalTradeCount": "56",
        "totalProfit": "0",
        "totalInvestQuantity": "5000000000",
        "totalInvestCount": "1",
        "totalDisinvestQuantity": "100000000",
        "totalDisinvestCount": "1"
      }
    ]
  }
}
```
### 4.5.Query ParGoods State Information
* Query
```graphql
{
  parGoodStates(first: 1, orderBy: id, orderDirection: desc) {
    contructFee
    currentQuantity
    currentValue
    erc20Address
    feeQuantity
    goodCount
    investQuantity
    investValue
    id
    tokendecimals
    tokenname
    tokentotalsuply
    tokensymbol
  }
}
```
* Response
```json
{
  "data": {
    "parGoodStates": [
      {
        "contructFee": "0",
        "currentQuantity": "1087870273117029652256",
        "currentValue": "3695541518239",
        "erc20Address": "0xe5dbe53f4e408b9c53472226bc01fac57e40d0b3",
        "feeQuantity": "294821134806936744",
        "goodCount": "2",
        "investQuantity": "1050000000000000000000",
        "investValue": "3468733743961",
        "id": "0xe5dbe53f4e408b9c53472226bc01fac57e40d0b3",
        "tokendecimals": "18",
        "tokenname": "Test WETH",
        "tokentotalsuply": "0",
        "tokensymbol": "WETH"
      }
    ]
  }
}
```
### 4.6.Query ParGoods Snapshot Information
* Query
```graphql
{
  parGoodDatas(
    orderBy: modifiedTime
    orderDirection: desc
    where: {timetype: "d"}
    first: 1
  ) {
    currentValue
    currentQuantity
    contructFee
    investValue
    investQuantity
    modifiedTime
    timetype
    totalTradeQuantity
    totalTradeCount
    totalProfit
    totalInvestQuantity
    totalInvestCount
    totalDisinvestQuantity
    totalDisinvestCount
  }
}
```
* Response
```json
{
  "data": {
    "parGoodDatas": [
      {
        "currentValue": "3689633695118",
        "currentQuantity": "1089945050754711379260",
        "contructFee": "0",
        "investValue": "3468733743961",
        "investQuantity": "1050000000000000000000",
        "modifiedTime": "1723460052",
        "timetype": "d",
        "totalTradeQuantity": "482739257708312844571",
        "totalTradeCount": "30",
        "totalProfit": "0",
        "totalInvestQuantity": "1050000000000000000000",
        "totalInvestCount": "2",
        "totalDisinvestQuantity": "0",
        "totalDisinvestCount": "0"
      }
    ]
  }
}
```
### 4.7.Query Customer Information
* Query
```graphql
{
  customers(where: {id: "0x09a69a513f777874dd03f953892a7879e5854959"}) {
    id
    customerno
    refer
    tradeCount
    tradeValue
    investValue
    investCount
    disinvestCount
    disinvestValue
    isBanlist
  }
}
```
* Response
```json
{
  "data": {
    "customers": [
      {
        "id": "0x09a69a513f777874dd03f953892a7879e5854959",
        "customerno": "3",
        "refer": "#",
        "tradeCount": "6",
        "tradeValue": "150902213349",
        "investValue": "0",
        "investCount": "0",
        "disinvestCount": "0",
        "disinvestValue": "0",
        "isBanlist": false
      }
    ]
  }
}
```  

### 4.8.Query Proof Information
* Query
```graphql
{
  proofStates(where: {id: "2"}) {
    id
    owner
    proofValue
    good1 {
      id
    }
    good1ContructFee
    good1Quantity
    good2 {
      id
    }
    good2ContructFee
    good2Quantity
  }
}
```
* Response
```json
{
  "data": {
    "proofStates": [
      {
        "id": "2",
        "owner": "0x0f18a2428c934db7b9e040f8fc6e08975cbef07a",
        "proofValue": "3233676600000",
        "good1": {
          "id": "8865411095942640069612110311771018411581514354974486424174672250950578377932"
        },
        "good1ContructFee": "0",
        "good1Quantity": "4900000000",
        "good2": {
          "id": "62228789954470825507986060196042077180472255078656628425209115580690578781452"
        },
        "good2ContructFee": "0",
        "good2Quantity": "3233676600000"
      }
    ]
  }
}
```
### 4.9.Query Transaction Information
```graphql
{
  transactions(
    where: {id: "622287899544708255079860601960420771804722550786566284252091155806905787814521"}
  ) {
    id
    togoodQuantity
    togoodfee
    transtype
    transvalue
    hash
    blockNumber
    fromgoodQuanity
    fromgoodfee
    frompargood {
      id
    }
    togood {
      id
    }
  }
}
```
* Response
```json
{
  "data": {
    "transactions": [
      {
        "id": "622287899544708255079860601960420771804722550786566284252091155806905787814521",
        "togoodQuantity": "0",
        "togoodfee": "0",
        "transtype": "meta",
        "transvalue": "100000000000",
        "hash": "0xdd949717f72575976191f9fcadb61bb4556def3cfbaa26b4089329d061887024",
        "blockNumber": "6401309",
        "fromgoodQuanity": "100000000000",
        "fromgoodfee": "0",
        "frompargood": {
          "id": "0xa35e43e7a5839b31624dad3f35da63875e705934"
        },
        "togood": {
          "id": "62228789954470825507986060196042077180472255078656628425209115580690578781452"
        }
      }
    ]
  }
}
```

## 5.Query endpoint
the dev endpoint:https://api.studio.thegraph.com/query/57827/ttswap/version/latest