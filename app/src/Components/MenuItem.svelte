<script>
    import { player } from '../stores/player';

    import { fly } from 'svelte/transition';

    export let title = "No Title";
    export let notificationCount = 0;
    export let unlocked;

</script>

{#if unlocked}
<a transition:fly={{y: 50, duration: 1000}} on:click class="item {title.includes($player.menu) ? "active" : ""}">
    <p>{title}</p>
    {#if notificationCount > 0}
        <div class="ui red label floating">{notificationCount}</div>
    {/if}
</a>
{/if}