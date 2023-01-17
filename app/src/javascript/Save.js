import { get } from "svelte/store";
import { player } from "../stores/player"

import Decimal from "decimal.js"

export function Save(){
    var string = JSON.stringify(get(player), Replacer);
    localStorage.setItem("player", string);
}

function Replacer(key, value){
    console.log(value instanceof Decimal);
    if (value instanceof Decimal) return "d"+value.toJSON();

    return value;
}