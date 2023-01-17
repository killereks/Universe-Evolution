<script>
    import Achievement from "../Achievement.svelte";

</script>

<style>
    .achievements {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-column-gap: 10px;
        grid-row-gap: 10px;
    }

    .achievements > * {
        margin: 10px;
    }
</style>

<div class="ui block header">Achievements</div>

<div class="achievements">
    {#each Array(100) as _, i}
        <Achievement completed={Math.random() < 0.5} title="Some description" name={i} />
    {/each}
</div>