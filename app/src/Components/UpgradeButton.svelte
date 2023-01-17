<script>
    import Decimal from "decimal.js";

    import {Format} from "../Mathf"

    export let description = "No description";
    export let price = new Decimal(10);
    export let effect = "No effect";
    export let money = new Decimal(0);

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
</style>

<div class="container">
    <button on:click={click} class="button {money.gte(price) ? 'can-buy' : ''}">
        <p class="text-2xl">{description}</p>
        <p class="text-lg">{effect}</p>
        {Format(price)}
    </button>
</div>