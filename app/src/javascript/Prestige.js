import { Decimal } from "decimal.js";
import { get } from "svelte/store";
import { player } from "../stores/player";

import { Format } from "./Mathf";

import { requirements } from "./PrestigeData";

// 1000 food, 100 people

export function GetPrestigeData(ageIndex){
    if (ageIndex >= requirements.length) return {};

    return requirements[ageIndex];
}

export function PrestigeRequirementsString(ageIndex){
    var requirements = GetPrestigeData(ageIndex).requirements;

    var string = "";

    for (var key in requirements){
        var resource = get(player).resources[key];
        let completed = resource.amount.gte(requirements[key]);

        if (completed){
            //string += `<div class="item"">✅ ${Format(resource.amount,0)}/${Format(requirements[key],0)} ${resource.icon}</div>`
        } else {
            string += `<div class="item">❌ ${Format(resource.amount,2)}/${Format(requirements[key],2)} ${resource.icon}</div>`
        }
    }

    return string;
}

export function CanEraPrestige(){
    var requirements = GetPrestigeData(get(player).currentAge).requirements;

    for (var key in requirements){
        if (get(player).resources[key].amount.lt(requirements[key])) return false;
    }

    return true;
}

export function EraPrestige(){
    if (!CanEraPrestige()) return;

    var prestigeData = GetPrestigeData(get(player).currentAge);
    var unlocks = prestigeData.unlocks;

    var playerData = get(player);
    
    playerData.currentAge++;

    HandleReset(playerData);
    HandleUnlocks(playerData, unlocks);

    player.set(playerData);
}

function HandleReset(playerData){
    // reset resources
    for (var key in playerData.resources){
        playerData.resources[key].amount = new Decimal(0);
    }

    // reset workers
    for (var key in playerData.workers){
        playerData.workers[key].amount = new Decimal(0);
    }

    // default resources
    playerData.resources.people.amount = new Decimal(5);
}

function HandleUnlocks(playerData, unlocks){
    // unlock resources
    for (var key of unlocks.resources){
        playerData.resources[key].unlocked = true;
    }

    // unlock workers
    for (var key of unlocks.workers){
        playerData.workers[key].unlocked = true;
    }
}