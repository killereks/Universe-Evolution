import { get } from "svelte/store";
import { player } from "../stores/player"

import Decimal from "decimal.js"

export function Save(){
    var string = JSON.stringify(get(player));
    localStorage.setItem("player", string);
}