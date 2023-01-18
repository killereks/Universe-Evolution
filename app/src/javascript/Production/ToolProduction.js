import { get } from "svelte/store";
import { player } from "../../stores/player";

import { Decimal } from "decimal.js";

import { SumGeometric, CountGeometric } from "../Mathf";

const blacksmithPriceIncrease = 1.6;

export function ToolProduction(blacksmithsCount){
    return Decimal.mul(blacksmithsCount, 0.02);
}

export function BlacksmithPrice(blacksmithsCount){
    return new Decimal(40).mul(Decimal.pow(blacksmithPriceIncrease, blacksmithsCount));
}

export function PurchaseBlacksmith(amount){
    var playerData = get(player);

    var blacksmithCount = playerData.workers.blacksmiths.amount;

    var howManyWeCanBuy = CountGeometric(BlacksmithPrice(blacksmithCount), blacksmithPriceIncrease, playerData.resources.money.amount);

    if (howManyWeCanBuy.lt(amount)) amount = howManyWeCanBuy;

    var price = SumGeometric(BlacksmithPrice(blacksmithCount), blacksmithPriceIncrease, amount);

    playerData.resources.money.amount = playerData.resources.money.amount.sub(price);
    playerData.workers.blacksmiths.amount = playerData.workers.blacksmiths.amount.add(amount);
}