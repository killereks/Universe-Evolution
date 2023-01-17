<script>

    import { Format } from "../Mathf";

    import { fly } from 'svelte/transition';
    import { backInOut } from 'svelte/easing';

    export let resource = null;
    export let places = 2;

</script>

<style>

    .ui.card {
        padding: 5px;
    }

    .green {
        color: #4caf50 !important;
        font-weight: 900;
    }

    .red {
        color: #e74c3c !important;
        font-weight: 900;
    }

    .orange {
        color: #f39c12 !important;
        font-weight: 900;
    }
    
    .content {
        color: #eaeaea;
    }

    .icon {
        font-style: normal;
        font-family: 'Roboto', sans-serif;
    }

</style>

<div class="item">
    {#if resource.unlocked}
    <i class="icon">{resource.icon}</i>
    <div class="content" transition:fly={{x: 100, easing: backInOut}}>
        <div class="ui grid two columns">
            <div class="column">
                {#if resource.amount.gte(resource.amountMax)}
                <div class="description red">{Format(resource.amount, 0)} (MAX)</div>
                {:else}
                    <a class="header">{Format(resource.amount, places)} / {Format(resource.amountMax,0)}</a>
                {/if}
            </div>
            <div class="column">
                {#if resource.perSecond.gt(0)}
                    <span class="description green" transition:fly={{x: 100, easing: backInOut}}>+{Format(resource.perSecond)} /s</span>
                {:else if resource.perSecond.lt(0)}
                    <span class="description red" transition:fly={{x: 100, easing: backInOut}}>{Format(resource.perSecond)} /s</span>
                {/if}
            </div>
        </div>
        
    </div>
    {:else}
    <i class="icon locked"></i>
    <div class="content">
        <div class="description orange">???</div>
    </div>
    {/if}
</div>