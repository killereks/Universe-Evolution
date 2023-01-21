<script>
    import { player } from "../../stores/player.js";
    import { FormatTimeShort, Format, FormatTimeLong } from "../../javascript/Mathf";

    import { Save, Load, HardReset } from "../../javascript/SaveLoad";

    import Slider from '@bulatdashiev/svelte-slider';

</script>

<div class="ui block header">Settings</div>

<div class="ui grid">
    <div class="row">
        <div class="ui button basic">Last saved: {FormatTimeLong($player.lastSaved)} ago</div>
        <button class="ui button teal" on:click={Save}>Save <i class="download icon"></i></button>
        <button class="ui button teal" on:click={Load}>Load <i class="upload icon"></i></button>
        <button class="ui button red" on:click={HardReset}>Hard Reset <i class="redo icon"></i></button>
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
    <div class="row">
        <input type="range" min=1 max=60 step=1 bind:value={$player.settings.fps}>
        <p>Current FPS: {$player.settings.fps}</p>
    </div>
</div>