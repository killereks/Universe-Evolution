// @ts-nocheck
import { player } from "../../stores/player";
import { get } from "svelte/store";

import { Decimal } from "decimal.js";

import { Clamp } from "../Mathf";

import { MiningFillRate, MiningLiraChance, MiningLiraAmount } from "../Production/LiraProduction";

import { CreateNotification } from "../Notifications";


export function MiningTick(dt){
    var $player = get(player);

    let miningSpeed = MiningFillRate($player.mining.barFillUpBought);

    $player.mining.progress += dt * miningSpeed;
    $player.mining.progress = Clamp($player.mining.progress, 0, 100);

    if ($player.mining.progress >= 100 && $player.mining.automateBought){
        MiningCollect();
    }
}

export function MiningCollect(userClicked = false){
    var $player = get(player);

    if ($player.mining.progress >= 100){
        $player.mining.progress = 0;

        let liraChance = MiningLiraChance($player.mining.liraChanceBought);
        let liraRoll = Math.random();

        if (liraRoll <= liraChance){
            let amountToAdd = MiningLiraAmount($player.mining.doubleAmountBought, $player.mining.fiveAmountBought);
            $player.resources.liras.amount = $player.resources.liras.amount.add(amountToAdd);

            if (userClicked){
                CreateNotification("You found " + amountToAdd + " liras!","green");
            }
        } else {
            if (userClicked){
                CreateNotification("You didn't find any liras.","red");
            }
        }
    }
}