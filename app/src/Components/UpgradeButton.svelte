<script>
    import Decimal from "decimal.js";
    import { fly } from "svelte/transition";
    import {Format, FormatTimeShort, GetIcon} from "../javascript/Mathf"
    import {Upgrade} from "../javascript/Upgrades/UpgradeManager";
    import { player } from "../stores/player";
    

    export let upgradeRef = new Upgrade();

    let canBuy = false;
    let currentCost = 0;
    let buttonClass = "";
    
    let effectDescription = "";

    let icon = GetIcon($upgradeRef.CurrentMoney);

    $: {
        canBuy = $upgradeRef.CanBuy();
        currentCost = $upgradeRef.GetCurrentCost();

        if ($upgradeRef.IsLastLevel()){
            buttonClass = "green";
        } else if (canBuy){
            buttonClass = "green inverted";
        } else {
            buttonClass = "black inverted";
        }

        effectDescription = $upgradeRef.GetEffectDescription();
    }

    setInterval(() => {
        $upgradeRef._store.set($upgradeRef);
    }, 250);

</script>

<button class="ui button fluid {buttonClass}" on:click={() => $upgradeRef.TryPurchase()}>
    <p>{$upgradeRef.description}</p>
    {#if $upgradeRef.IsLastLevel()}
    <p transition:fly={{x:200}}>{effectDescription}</p>
    {:else}
    <p>{Format(currentCost)} {@html icon}</p>
    <p><b>{effectDescription}</b></p>
        {#if $player.settings.displayTimeLeft}
            <p>{$upgradeRef.TimeLeft}</p>
        {/if}
    {/if}
</button>