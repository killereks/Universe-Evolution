import Decimal from "decimal.js";
import { get } from "svelte/store";
import { player } from "../stores/player"

export function Load(){
    var string = localStorage.getItem("player");
    if (string == null) return;

    var data = JSON.parse(string);

    player.set(data);
}