<script>
    import Decimal from "decimal.js";
    import { fly } from "svelte/transition";
    import {Format} from "../javascript/Mathf"
    import {Upgrade} from "../javascript/Upgrades/UpgradeManager";
    

    export let upgradeRef = new Upgrade();

    let canBuy = false;
    let currentCost = 0;
    let buttonClass = "";
    
    let effectDescription = "";

    $: {
        canBuy = upgradeRef.CanBuy();
        currentCost = upgradeRef.GetCurrentCost();

        if (upgradeRef.IsLastLevel()){
            buttonClass = "green";
        } else if (canBuy){
            buttonClass = "basic green";
        } else {
            buttonClass = "basic red";
        }

        effectDescription = upgradeRef.GetEffectDescription();
    }

    // force update every 250ms
    setInterval(() => {
        upgradeRef = upgradeRef;
    }, 250);

    function TryPurchase(){
        upgradeRef.TryPurchase();

        upgradeRef = upgradeRef;
    }

</script>

<style>
    .ui.button {
        border-style: solid;
        border-width: 1px;
    }
</style>

<button class="ui button {buttonClass}" on:click={TryPurchase}>
    <p>{upgradeRef.description}</p>
    {#if upgradeRef.IsLastLevel()}
    <p transition:fly={{x:200}}>{effectDescription}</p>
    {:else}
    <p>{Format(currentCost)} {upgradeRef.costCurrency.icon}</p>
    <p>{effectDescription}</p>
    {/if}
</button>