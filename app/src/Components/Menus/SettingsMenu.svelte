<script>
    import { player } from "../../stores/player.js";
    import { FormatTimeShort, Format } from "../../Mathf";

    import { Save } from "../../javascript/Save";
    import { Load } from "../../javascript/Load";

</script>

<div class="ui block header">Settings</div>

<div class="ui grid">
    <div class="row">
        <div class="ui button basic">Last saved: {FormatTimeShort($player.timePlayed)} ago</div>
        <button class="ui button" on:click={Save}>Save <i class="download icon"></i></button>
        <button class="ui button" on:click={Load}>Load <i class="upload icon"></i></button>
    </div>
    <div class="row">
        <select class="ui dropdown" bind:value={$player.settings.format}>
            <option value="default">Default</option>
            <option value="scientific">Scientific</option>
            <option value="engineering">Engineering</option>
            <option value="letters">Letters</option>
            <option value="logarithm">Logarithm</option>
            <option value="infinity">Infinity</option>
        </select>
    </div>
</div>