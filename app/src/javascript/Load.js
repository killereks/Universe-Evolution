import Decimal from "decimal.js";
import { get } from "svelte/store";
import { player } from "../stores/player"

export function Load(){
    var string = localStorage.getItem("player");
    if (string == null) return;

    var data = JSON.parse(string, (key, value) => {
        if (typeof value === "object" && value[0] == "d"){
            return new Decimal(value.slice(1));
        }
        return value;
    });

    player.set(data);
}