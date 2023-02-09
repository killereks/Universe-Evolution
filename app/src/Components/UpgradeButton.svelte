<script>
    import Decimal from "decimal.js";
    import { fly } from "svelte/transition";
    import {Format, FormatTimeShort} from "../javascript/Mathf"
    import {Upgrade} from "../javascript/Upgrades/UpgradeManager";
    import { player } from "../stores/player";
    

    export let upgradeRef = new Upgrade();

    let canBuy = false;
    let currentCost = 0;
    let buttonClass = "";
    
    let effectDescription = "";

    let icon = $upgradeRef.CurrentMoney.icon;

    $: {
        canBuy = $upgradeRef.CanBuy();
        currentCost = $upgradeRef.GetCurrentCost();

        if ($upgradeRef.IsLastLevel()){
            buttonClass = "green";
        } else if (canBuy){
            buttonClass = "basic green";
        } else {
            buttonClass = "basic red";
        }

        effectDescription = $upgradeRef.GetEffectDescription();
    }

    setInterval(() => {
        $upgradeRef._store.set($upgradeRef);
    }, 250);

</script>

<style>
    .ui.button {
        border-style: solid;
        border-width: 1px;
        height: 100%;
    }
</style>

<button class="ui button fluid {buttonClass}" on:click={() => $upgradeRef.TryPurchase()}>
    <p>{$upgradeRef.description}</p>
    {#if $upgradeRef.IsLastLevel()}
    <p transition:fly={{x:200}}>{effectDescription}</p>
    {:else}
    <p>{Format(currentCost)} {icon}</p>
    <p><b>{effectDescription}</b></p>
        {#if $player.settings.displayTimeLeft}
            <p>{$upgradeRef.TimeLeft}</p>
        {/if}
    {/if}
</button>