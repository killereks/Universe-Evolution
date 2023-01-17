import { Decimal } from "decimal.js";
import { get } from "svelte/store";
import { player } from "../stores/player";

import { Format } from "./Mathf";

// 1000 food, 100 people

export function PrestigeRequirements(ageIndex){
    var requirements = [
        // prehistoric -> Ancient
        {
            food: new Decimal(100),
            people: new Decimal(100),
            money: new Decimal(100),
        }
    ];

    if (ageIndex >= requirements.length) return {};

    return requirements[ageIndex];
}

export function PrestigeRequirementsString(ageIndex){
    var requirements = PrestigeRequirements(ageIndex);

    var string = "";

    for (var key in requirements){
        var resource = get(player).resources[key];
        let completed = resource.amount.gte(requirements[key]);

        if (completed){
            string += `<div class="item"">✅ ${Format(resource.amount)}/${Format(requirements[key])} ${resource.icon}</div>`
        } else {
            string += `<div class="item">❌ ${Format(resource.amount)}/${Format(requirements[key])} ${resource.icon}</div>`
        }
    }

    return string;
}

export function CanEraPrestige(){
    var requirements = PrestigeRequirements(get(player).currentAge);

    for (var key in requirements){
        if (get(player).resources[key].amount.lt(requirements[key])) return false;
    }

    return true;
}

export function EraPrestige(){
    if (!CanEraPrestige()) return;
    
    get(player).currentAge++;
}