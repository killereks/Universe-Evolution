<script>
    import { player } from "../../stores/player.js";
    import { FormatTimeShort, Format, FormatTimeLong } from "../../javascript/Mathf";

    import { Save, Load, HardReset } from "../../javascript/SaveLoad";

</script>

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
    <div class="row">
        <div class="ui checkbox">
            <input type="checkbox" bind:checked={$player.settings.displayTimeLeft}>
            <label>Display time left on upgrades</label>
        </div>
    </div>

    <div class="row">
        <div class="ui block header" style="width: 100%;">Creators & Helpers</div>
    </div>
    <div class="row">
        <div class="ui divider horizontal"></div>
        <div class="ui card">
            <div class="image">
                <img src="https://semantic-ui.com/images/avatar2/large/kristy.png">
            </div>
            <div class="content">
                <a class="header">killereks</a>
                <div class="description">Programmer & UI Designer</div>
            </div>

            <a class="ui bottom attached button" href="https://www.oskaroramus.dev" target="_blank"><i class="ui icon external"></i> Open Website</a>
        </div>
    </div>

    <div class="row">
        <div class="ui block header" style="width: 100%;">Stuff stolen from</div>
    </div>
    <div class="row">
        <div class="ui segment inverted">
            <a href="https://www.flaticon.com/free-icons/population" title="population icons">Population icons created by kosonicon - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/food" title="food icons">Food icons created by Freepik - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/wood" title="wood icons">Wood icons created by Freepik - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/coins" title="coins icons">Coins icons created by Freepik - Flaticon</a>


        </div>
    </div>
</div>