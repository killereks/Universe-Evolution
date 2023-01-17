import Decimal from "decimal.js";

import { get } from "svelte/store";
import { player } from "./stores/player.js";

// format types
// default
// scientific
// engineering
// letters
// logarithm
// infinity -> every 1.8e308 is 1 infinity, so 3.6e616 is 2 infinities etc.

export function Format(number, places = 2){
    if (number.lt(0)){
        return "-" + Format(number.abs(), places);
    }

    var type = get(player).settings.format;

    switch (type){
        case "scientific":
            return FormatScientific(number, places);
        case "engineering":
            return FormatEngineering(number, places);
        case "letters":
            return FormatLetters(number, places);
        case "logarithm":
            return FormatLogarithm(number, places);
        case "infinity":
            return FormatInfinity(number, places);
        default:
            return FormatDefault(number, places);
    }
}

function FormatScientific(number, places){
    return number.toExponential(places);
}

function FormatEngineering(number, places){
    if (number.lt(10)) return number.toFixed(places);

    var index = Math.floor(Math.log10(number) / 3);
    var number = Decimal.div(number, Decimal.pow(1000, index));
    return number.toFixed(places) + "e" + (index * 3);
}

function FormatLetters(number, places){
    return "TODO";
}

function FormatLogarithm(number, places){
    return Decimal.log10(number).toFixed(2);
}

function FormatInfinity(number, places){
    if (number.lt(10)) return number.toFixed(places);
    let amount = Decimal.log(number) / Decimal.log(1.79e308);
    
    return amount.toFixed(places) + "∞";
}

function FormatDefault(number, places){
    var numberNames = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];

    var index = Math.floor(Math.log10(number) / 3);
    if (index >= numberNames.length) return number.toExponential(places);
    if (index < 0) return number.toFixed(places);

    var number = Decimal.div(number, Decimal.pow(1000, index));
    return number.toFixed(places) + numberNames[index];
}

export function FormatTimeLong(seconds){
    var values = [52*24*3600*7, 24*3600*7, 24*3600, 3600, 60, 1];
    var prefixes = ["years","weeks","days","hours","minutes","seconds"];

    var outcome = [];

    var str = "";

    for (var i = 0; i < values.length; i++){
        if (seconds > values[i]){
            outcome[i] = Math.floor(seconds / values[i]);
            seconds -= outcome[i] * values[i];
            str += `${outcome[i]} ${prefixes[i]} `;
        }
    }

    return str;
}

export function FormatTimeShort(seconds){
    var values = [52*24*3600*7, 24*3600*7, 24*3600, 3600, 60, 1];
    var prefixes = ["y","w","d","h","m","s"];

    var outcome = [];

    var str = "";

    for (var i = 0; i < values.length; i++){
        if (seconds > values[i]){
            outcome[i] = Math.floor(seconds / values[i]);
            seconds -= outcome[i] * values[i];
            str += `${outcome[i]}${prefixes[i]} `;
        }
    }

    return str;
}

export function TimeLeft(current, target, production){
    if (production.eq(0)) return "Never";
    if (current.gte(target)) return "Now";

    var amt = Decimal.div(Decimal.sub(target, current), production);
    return FormatTimeShort(amt.toNumber());
}

/**
 * price + (price * increase) + (price * increase ^ 2) + ... + (price * increase ^ amount)
 * @param {Current starting price} price 
 * @param {Multiplier for purchase} increase 
 * @param {How many we want to buy} amount 
 * @returns Returns the total price for the amount of items
 */
export function SumGeometric(price, increase, amount){
    // a(1-r^n)/(1-r)
    // price * (1 - increase ^ amount) / (1 - increase)
    let first = Decimal.sub(1, Decimal.pow(increase, amount));
    let second = Decimal.sub(1, increase);
    return Decimal.mul(price, Decimal.div(first, second));
}

/**
 * price + (price * increase) + (price * increase ^ 2) + ... <= currentMoney
 * @param {Current starting price} price 
 * @param {Multiplier for purchase} increase 
 * @param {How much money we have} currentMoney 
 * @returns How many we can buy
 */
export function CountGeometric(price, increase, currentMoney){
    // logr(1-(S(1-r)/a));
    let _ = Decimal.div(Decimal.mul(currentMoney, Decimal.sub(1, increase)), price);
    let out = Decimal.log10(Decimal.sub(1, _)).div(Decimal.log10(increase));

    if (out.lte(0)) return new Decimal(0);
    return out.floor();
}

/**
 * starting + (starting + increment) + (starting + 2 * increment) + ... + (starting + (amount - 1) * increment)
 * @param {Starting price} starting 
 * @param {Increment for the price} increment 
 * @param {How many we want to buy} amount 
 * @returns Total price for the amount of items
 */
export function Sum(starting, increment, amount){
    // 0.5 * amount * (2 * starting + (amount - 1) * increment)
    let first = Decimal.mul(0.5, amount);
    let second = Decimal.mul(2, starting).add(Decimal.mul(Decimal.sub(amount, 1), increment));
    return Decimal.mul(first, second);
}

/**
 * starting + (starting + increment) + (starting + 2 * increment) + ... <= currentMoney
 * @param {Starting price} starting 
 * @param {Increment for the price} increment 
 * @param {How much money we have} currentMoney 
 * @returns Number of items we can buy
 */
export function SumCount(starting, increment, currentMoney){
    var topLeft = new Decimal(-2).times(starting).plus(increment);
    var sqrt = new Decimal(4).times(starting).times(starting)
                .minus(new Decimal(4).times(starting).times(increment))
                .plus(new Decimal(increment).times(increment))
                .plus(new Decimal(8).times(increment).times(currentMoney));
    var btm = new Decimal(2).times(increment);

    var x1 = topLeft.plus(sqrt.sqrt()).dividedBy(btm);
    var x2 = topLeft.minus(sqrt.sqrt()).dividedBy(btm);

    return Decimal.max(x1, x2).floor();
}