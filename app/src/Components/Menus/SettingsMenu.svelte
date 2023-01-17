<script>
    import { player } from "../../stores/player.js";
    import { FormatTimeShort } from "../../Mathf";

    import { Save } from "../../javascript/Save";
    import { Load } from "../../javascript/Load";

</script>

<div class="ui block header">Settings</div>

<div class="ui buttons icon">
    <div class="ui button basic">Last saved: {FormatTimeShort($player.timePlayed)} ago</div>
    <button class="ui button" on:click={Save}>Save <i class="download icon"></i></button>
    <button class="ui button" on:click={Load}>Load <i class="upload icon"></i></button>
</div>