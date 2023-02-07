import Decimal from "decimal.js";
import { get } from "svelte/store";
import { player } from "../../stores/player";
import { Format } from "../Mathf";

export class Upgrade {
    // description, cost (number), cost (currency object pointer), cost formula function
    // start level, increment, max purchase count

    constructor(settings){
        this.name = settings.name;
        this.description = settings.description;
        this.effectText = settings.effectText;

        this.costCurrency = settings.costCurrency;
        this.costFunction = settings.costFunction;

        this.startLevel = settings.startLevel;
        this.increment = settings.increment;
        this.maxPurchaseCount = settings.maxPurchaseCount;

        this.purchaseCount = 0;
    }

    GetCurrentCost(){
        return this.costFunction(this.purchaseCount);
    }

    GetValue(){
        return new Decimal(this.startLevel).add(new Decimal(this.increment).mul(this.purchaseCount));
    }

    GetNextValue(){
        return new Decimal(this.GetValue()).add(this.increment);
    }

    GetEffectDescription(){
        let out = "";

        if (this.IsLastLevel()){
            out = this.effectText.replace("{value}", Format(this.GetValue()));
        } else {
            out = this.effectText.replace("{value}", Format(this.GetValue()) + " -> " + Format(this.GetNextValue()));
        }

        return out;
    }

    CanBuy(){
        if (this.purchaseCount >= this.maxPurchaseCount) return false;

        let cost = this.GetCurrentCost();

        return this.costCurrency.amount.gte(cost);
    }

    IsLastLevel(){
        return this.purchaseCount >= this.maxPurchaseCount;
    }
    
    TryPurchase(){
        if (this.purchaseCount >= this.maxPurchaseCount) return false;
        
        let cost = this.GetCurrentCost();
        
        if (this.CanBuy()){
            this.costCurrency.amount = this.costCurrency.amount.sub(cost);
            this.purchaseCount++;

            // force svelte update whole component
            this.description = this.description;
            player.set(get(player));

            return true;
        }

        return false;
    }
}

export class UpgradeManager {
    constructor(){
        this.upgrades = [];

        this.cache = {};
    }

    AddUpgrade(upgrade){
        this.upgrades.push(upgrade);
    }

    GetUpgrade(name){
        if (this.cache[name]) return this.cache[name];

        for (let i = 0; i < this.upgrades.length; i++){
            if (this.upgrades[i].name == name){
                this.cache[name] = this.upgrades[i];
                return this.upgrades[i];
            }
        }

        console.error(`Upgrade ${name} not found!`);

        return null;
    }

    ToJSON(){
        let out = {};

        for (let i = 0; i < this.upgrades.length; i++){
            out[this.upgrades[i].name] = this.upgrades[i].purchaseCount;
        }

        return out;
    }

    FromJSON(json){
        for (let i = 0; i < this.upgrades.length; i++){
            let amount = json[this.upgrades[i].name];
            this.upgrades[i].purchaseCount = amount;
        }
    }
}

export const upgradeManager = new UpgradeManager();

upgradeManager.AddUpgrade(new Upgrade({
    name: "food_production",
    description: "Automatically produce food every second.",
    effectText: "Produce {value} food per second.",

    costCurrency: get(player).resources.people,
    costFunction: (index) => Decimal.pow(1.2, index).mul(2),

    startLevel: 0,
    increment: 1,
    maxPurchaseCount: 10
}));