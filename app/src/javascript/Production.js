import { get } from "svelte/store";
import { player } from "../stores/player";

import { Decimal } from "decimal.js";

import { SumGeometric, CountGeometric } from "../Mathf";

export function FoodProduction(farmerCount){
    return Decimal.mul(farmerCount, 0.1);
}

export function FarmerPrice(farmerCount){
    return new Decimal(10).mul(Decimal.pow(1.3, farmerCount));
}

export function PurchaseFarmer(amount){
    var playerData = get(player);

    var farmerCount = playerData.workers.farmers.amount;

    var howManyWeCanBuy = CountGeometric(FarmerPrice(farmerCount), 1.3, playerData.resources.money.amount);

    if (howManyWeCanBuy.lt(amount)) amount = howManyWeCanBuy;

    var price = SumGeometric(FarmerPrice(0), 1.3, amount);

    playerData.resources.money.amount = playerData.resources.money.amount.sub(price);
    playerData.workers.farmers.amount = playerData.workers.farmers.amount.add(amount);
}