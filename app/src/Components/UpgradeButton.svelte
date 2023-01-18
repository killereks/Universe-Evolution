<script>
    import Decimal from "decimal.js";
    import { fade } from "svelte/transition";

    import {Format} from "../javascript/Mathf"

    export let description = "No description";
    export let price = new Decimal(10);
    export let effect = "No effect";
    export let money = new Decimal(0);

    export let moneyIcon = "No Icon";

    export let fullyBought = false;

    export let click = () => {};
</script>

<style>
    .button {
        border-width: 2px;
        border-radius: 0.5rem;
        padding: 1rem;
        width: 100%;
        height: 100%;
        border-color: #333;
        background-color: #eaeaea;
        transition: 0.2s;
    }
    .button.can-buy {
        border-color: #4caf50;
        background-color: #8bc24b;
    }
    .button:disabled {
        border-color: #333;
        background-color: #333;
        color: #eaeaea;
    }

    .container {
        height: 100%;
    }
</style>

<div class="container">
    {#if fullyBought}
    <button class="button can-buy">
        <p class="text-2xl font-bold">{description}</p>
        <p class="text-lg font-medium">{effect}</p>
    </button>
    {:else}
    <button on:click={click} class="button {money.gte(price) ? 'can-buy' : ''}">
        <p class="text-2xl font-bold">{description}</p>
        <p class="text-lg font-medium">{effect}</p>
        <p class="text-2xl">{Format(price)} {moneyIcon}</p>
    </button>
    {/if}
</div>