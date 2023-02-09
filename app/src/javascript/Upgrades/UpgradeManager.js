import Decimal from "decimal.js";
import { get, writable } from "svelte/store";
import { player } from "../../stores/player";
import { CalculateTimeLeft, Format } from "../Mathf";

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

        this.isMultiplicative = settings.isMultiplicative;

        this.purchaseCount = 0;

        this._store = writable(this);
    }

    GetCurrentCost(){
        return this.costFunction(this.purchaseCount);
    }

    GetEffectDescription(){
        let out = "";

        if (this.IsLastLevel()){
            out = this.effectText.replace("{value}", Format(this.DecimalValue));
        } else {
            out = this.effectText.replace("{value}", Format(this.DecimalValue) + " -> " + Format(this.NextDecimalValue));
        }

        return out;
    }

    get TimeLeft(){
        return CalculateTimeLeft(this.CurrentMoney.amount, this.GetCurrentCost(), this.CurrentMoney.perSecond);
    }

    get CurrentMoney(){
        return this.costCurrency();
    }

    get DecimalValue(){
        if (this.isMultiplicative){
            return new Decimal(this.startLevel).mul(new Decimal(this.increment).pow(this.purchaseCount));
        }
        return new Decimal(this.startLevel).add(new Decimal(this.increment).mul(this.purchaseCount));
    }

    get NextDecimalValue(){
        if (this.isMultiplicative){
            return new Decimal(this.DecimalValue).mul(this.increment);
        }
        return new Decimal(this.DecimalValue).add(this.increment);
    }

    get Value(){
        return this.DecimalValue.toNumber();
    }

    CanBuy(){
        if (this.purchaseCount >= this.maxPurchaseCount) return false;

        let cost = this.GetCurrentCost();

        return this.CurrentMoney.amount.gte(cost);
    }

    IsLastLevel(){
        return this.purchaseCount >= this.maxPurchaseCount;
    }
    
    TryPurchase(){
        if (this.purchaseCount >= this.maxPurchaseCount) return false;
        
        let cost = this.GetCurrentCost();
        
        if (this.CanBuy()){
            this.CurrentMoney.amount = this.CurrentMoney.amount.sub(cost);
            this.purchaseCount++;

            return true;
        }

        return false;
    }

    subscribe(subscriber){
        return this._store.subscribe(subscriber);
    }
}

export class UpgradeManager {
    constructor(){
        this.upgrades = [];

        this.cache = {};
    }

    Add(upgrade){
        this.upgrades.push(upgrade);
    }

    Get(name){
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

        this.cache = {};
    }
}

export const upgradeManager = new UpgradeManager();

upgradeManager.Add(new Upgrade({
    name: "shelter",
    description: "Build a shelter for better rest quality.",
    effectText: "Action speed is {value} times faster.",

    costCurrency: () => get(player).resources.wood,
    costFunction: (index) => [new Decimal(2), new Decimal(3), new Decimal(10), new Decimal(25), new Decimal(50)][index],

    isMultiplicative: true,

    startLevel: 1,
    increment: 2,
    maxPurchaseCount: 5
}));

upgradeManager.Add(new Upgrade({
    name: "fire",
    description: "Build a fire.",
    effectText: "Action speed is {value} times faster.",

    costCurrency: () => get(player).resources.wood,
    costFunction: (index) => Decimal.pow(3, index).mul(10),
    
    isMultiplicative: true,

    startLevel: 1,
    increment: 1.5,
    maxPurchaseCount: 5
}));

upgradeManager.Add(new Upgrade({
    name: "storage",
    description: "Build a storage.",
    effectText: "Journey rewards are {value} times bigger.",

    costCurrency: () => get(player).resources.wood,
    costFunction: (index) => Decimal.pow(5, index).mul(15),
    
    isMultiplicative: false,

    startLevel: 1,
    increment: 1,
    maxPurchaseCount: 10
}));

upgradeManager.Add(new Upgrade({
    name: "hunting",
    description: "Teach people how to hunt on their own.",
    effectText: "Gain {value} food per second.",

    costCurrency: () => get(player).resources.wood,
    costFunction: (index) => Decimal.pow(1.3, index).mul(3),

    isMultiplicative: false,

    startLevel: 0,
    increment: 1,
    maxPurchaseCount: 10
}))

upgradeManager.Add(new Upgrade({
    name: "wood_chopping",
    description: "Teach people how to collect wood.",
    effectText: "Gain {value} wood per second.",

    costCurrency: () => get(player).resources.wood,
    costFunction: (index) => Decimal.pow(4, index).mul(2),

    isMultiplicative: false,

    startLevel: 0,
    increment: 1,
    maxPurchaseCount: 10
}))