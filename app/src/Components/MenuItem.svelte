<script>

    import { fade } from 'svelte/transition';

    export let title = "No Title";
    export let notificationCount = 0;
    export let unlocked;

</script>

<style>
    .hidden {
        display: none !important;
    }
</style>

<a on:click transition:fade class={`item ${!unlocked && "hidden"}`}>
    {title}
    {#if notificationCount > 0}
        <div class="ui red label floating">{notificationCount}</div>
    {/if}
</a>