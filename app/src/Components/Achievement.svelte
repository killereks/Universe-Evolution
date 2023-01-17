<script>
    import { fade } from "svelte/transition";

    export let name = "Back to Reality Or not?";
    export let description = "Complete the game";
    export let completed = false;
</script>

<style>
    .box {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }

    .box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 15px;
        filter: grayscale(100%);
    }

    .box .id {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #333;
        color: #fff;
        text-align: center;
        padding: 5px;
        border-radius: 0 0 15px 15px;
    }

    .completed img {
        filter: grayscale(0%);
    }

</style>

{#if completed}
<div transition:fade class='box completed'>
    <img src="https://picsum.photos/200/200">
    <div title={description} class="id">{name}</div>
</div>
{:else}
<div class='box'>
    <img src="https://picsum.photos/200/200">
    <div title={description} class="id">{name}</div>
</div>
{/if}