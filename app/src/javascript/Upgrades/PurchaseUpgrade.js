import { get } from 'svelte/store';
import { player } from '../../stores/player';

import { Decimal } from 'decimal.js';

export function PurchaseUpgradeUsingTools(name, price){
    var playerData = get(player);

    if (playerData.upgrades[name]) return;
    
    if (playerData.resources.tools.amount.lt(price)) return;

    playerData.resources.tools.amount = playerData.resources.tools.amount.sub(price);
    playerData.upgrades[name] = true;
    
    player.set(playerData);
}

export function PurchaseUpgradeUsingFood(name, price){
    var playerData = get(player);

    if (playerData.upgrades[name]) return;
    
    if (playerData.resources.food.amount.lt(price)) return;

    playerData.resources.food.amount = playerData.resources.food.amount.sub(price);
    playerData.upgrades[name] = true;
    
    player.set(playerData);
}