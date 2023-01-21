import { get } from "svelte/store";
import { player } from "../stores/player"

import Decimal from "decimal.js"

import { CreateNotification } from "./Notifications";

Decimal.prototype.toJSON = function(){
    return "_" + this.toString();
}

export function Save(){
    var string = JSON.stringify(get(player));
    localStorage.setItem("player", string);

    get(player).lastSaved = 0;

    CreateNotification("Game saved!", "blue");
}

export function Load(){
    var string = localStorage.getItem("player");
    if (string == null){
        CreateNotification("No save found! Loading default.", "red");
        return;
    }

    CreateNotification("Game loaded!", "blue");

    function replacer(key, value){
        if (value.toString().charAt(0) == "_"){
            return new Decimal(value.toString().substring(1));
        }

        return value;
    }

    var data = JSON.parse(string, replacer);

    player.set(data);
}

export function HardReset(){
    localStorage.removeItem("player");
    location.reload();
}