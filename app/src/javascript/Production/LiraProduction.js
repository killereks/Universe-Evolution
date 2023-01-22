import Decimal from "decimal.js";

import { get } from "svelte/store";
import { player } from "../../stores/player";


export function MiningFillRate(fillUpLevel){
    return Decimal.pow(1.05, fillUpLevel);
}

export function MiningLiraChance(chanceBought){
    return 0.1 + chanceBought * 0.01;
}

export function MiningLiraAmount(doubleBought, fiveBought){
    let liraAmount = new Decimal(1);

    liraAmount = liraAmount.mul(Decimal.pow(2, doubleBought));
    liraAmount = liraAmount.mul(Decimal.pow(5, fiveBought));

    return liraAmount;
}

export function MiningFillRatePrice(level){
    return Decimal.pow(1.8, level).floor();
}

export function MiningLiraChancePrice(level){
    return Decimal.pow(1.23, level).floor();
}

export function MiningDoubleLiraAmountPrice(level){
    return Decimal.pow(5, level).floor();
}

export function MiningFiveLiraAmountPrice(level){
    let price = Decimal.pow(25, level);
    price = price.mul(10);

    return price.floor();
}

export function PurchaseMiningFillRate(){
    let playerData = get(player);

    let price = MiningFillRatePrice(playerData.mining.barFillUpBought);

    if (playerData.resources.money.amount.lt(price)) return;

    playerData.resources.money.amount = playerData.resources.money.amount.sub(price);
    playerData.mining.barFillUpBought++;

    player.set(playerData);
}

export function PurchaseMiningLiraChance(){
    let playerData = get(player);

    let price = MiningLiraChancePrice(playerData.mining.liraChanceBought);

    if (playerData.resources.liras.amount.lt(price)) return;

    playerData.resources.liras.amount = playerData.resources.liras.amount.sub(price);
    playerData.mining.liraChanceBought++;
    
    player.set(playerData);
}

export function PurchaseMiningDoubleLiraAmount(){
    let playerData = get(player);

    let price = MiningDoubleLiraAmountPrice(playerData.mining.doubleAmountBought);

    if (playerData.resources.liras.amount.lt(price)) return;

    playerData.resources.liras.amount = playerData.resources.liras.amount.sub(price);
    playerData.mining.doubleAmountBought++;
    
    player.set(playerData);
}

export function PurchaseMiningFiveLiraAmount(){
    let playerData = get(player);

    let price = MiningFiveLiraAmountPrice(playerData.mining.fiveAmountBought);

    if (playerData.resources.liras.amount.lt(price)) return;

    playerData.resources.liras.amount = playerData.resources.liras.amount.sub(price);
    playerData.mining.fiveAmountBought++;
    
    player.set(playerData);
}

export function PurchaseMiningAutomation(){
    let playerData = get(player);

    let price = new Decimal(10);

    if (playerData.resources.liras.amount.lt(price)) return;

    playerData.resources.liras.amount = playerData.resources.liras.amount.sub(price);
    playerData.mining.automateBought = true;
    
    player.set(playerData);
}

export function EstimatedLirasPerSecond(){
    let playerData = get(player);

    let fillRate = MiningFillRate(playerData.mining.barFillUpBought);
    let chance = MiningLiraChance(playerData.mining.liraChanceBought);
    let amount = MiningLiraAmount(playerData.mining.doubleAmountBought, playerData.mining.fiveAmountBought);
    
    let timeToFill = Decimal.div(100, fillRate);
    let lirasPerSecond = Decimal.mul(chance, amount).div(timeToFill);

    return lirasPerSecond;
}