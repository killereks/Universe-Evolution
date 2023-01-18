<script>

    import { Format } from "../javascript/Mathf";

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
    
    .header, .description {
        text-align: left;
    }

</style>

{#if resource.unlocked}
<div class="item">
    <i class="icon">{resource.icon}</i>
    <div class="content" transition:fly={{x: 100, easing: backInOut}}>
        <div class="ui grid two columns">
            <div class="column">
                <a class="header">{Format(resource.amount, places)}</a>
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
</div>
{/if}