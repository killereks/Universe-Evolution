import { get } from "svelte/store";
import { player } from "../../stores/player";

import { Decimal } from "decimal.js";

import { SumGeometric, CountGeometric } from "../Mathf";

const farmerPriceIncrease = 1.3;

export function FoodProduction(farmerCount){
    let val = Decimal.mul(farmerCount, 0.15);

    let upgrades = get(player).upgrades;

    if (upgrades.includes("farming_tools")){
        val = val.mul(2);
    }

    return val;
}

export function FarmerPrice(farmerCount){
    return new Decimal(5).mul(Decimal.pow(farmerPriceIncrease, farmerCount));
}

export function PurchaseFarmer(amount){
    var playerData = get(player);

    var farmerCount = playerData.workers.farmers.amount;

    var howManyWeCanBuy = CountGeometric(FarmerPrice(farmerCount), farmerPriceIncrease, playerData.resources.money.amount);

    if (howManyWeCanBuy.lt(amount)) amount = howManyWeCanBuy;

    var price = SumGeometric(FarmerPrice(farmerCount), farmerPriceIncrease, amount);

    playerData.resources.money.amount = playerData.resources.money.amount.sub(price);
    playerData.workers.farmers.amount = playerData.workers.farmers.amount.add(amount);
}