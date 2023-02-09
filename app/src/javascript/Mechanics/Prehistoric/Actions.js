import { get } from "svelte/store";
import { player } from "../../../stores/player";
import { upgradeManager } from "../../Upgrades/UpgradeManager";

export function ActionTick(tick){
    let playerData = get(player);

    if (playerData.actions.current == "") return;

    let actions = playerData.actions;

    actions.progress += GetProgressSpeed() * tick;

    let maxProgress = GetMaxProgress(actions.current);

    if (actions.progress >= maxProgress){
        ActionFinished(actions.current);
        actions.progress = 0;
    }

    player.set(playerData);
}

export function ActionTimeLeft(){
    let playerData = get(player);

    let actions = playerData.actions;

    let maxProgress = GetMaxProgress(actions.current);
    let timeLeft = (maxProgress - actions.progress) / GetProgressSpeed();

    return timeLeft;
}

export function SetAction(action){
    let playerData = get(player);

    if (playerData.actions.current == action){
        playerData.actions.current = "";
    } else {
        playerData.actions.current = action;
    }

    playerData.actions.progress = 0;

    player.set(playerData);
}

export function GetActionPercentage(){
    let playerData = get(player);

    let actions = playerData.actions;

    let maxProgress = GetMaxProgress(actions.current);
    let percentage = actions.progress / maxProgress;

    return percentage;
}

function ActionFinished(name){
    let playerData = get(player);

    let resourceMultiplier = upgradeManager.Get("storage").Value;

    switch (name){
        case "hunt":
            playerData.resources.food.amount = playerData.resources.food.amount.add(5 * resourceMultiplier);
            break;
        case "explore":
            playerData.resources.people.amount = playerData.resources.people.amount.add(1 * resourceMultiplier);
            break;
        case "collect_resources":
            playerData.resources.wood.amount = playerData.resources.wood.amount.add(1 * resourceMultiplier);
            break;
        case "train":
            playerData.resources.people.amount = playerData.resources.people.amount.add(1 * resourceMultiplier);
            break;
        default:
            console.error(`Action ${name} not found!`);
            break;
    }

    player.set(playerData);
}

function GetMaxProgress(name){
    switch (name){
        case "hunt":
            return 8;
        case "explore":
            return 4;
        case "collect_resources":
            return 15;
        case "train":
            return 10;
    }
}

function GetProgressSpeed(){
    let value = 1;

    value *= upgradeManager.Get("shelter").Value;
    value *= upgradeManager.Get("fire").Value;

    return value;
}