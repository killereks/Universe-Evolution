<script>
    import { fly } from "svelte/transition";
    import { FormatTimeLong, FormatTimeShort } from "../../javascript/Mathf";
    import { ActionTimeLeft, GetActionPercentage, SetAction } from "../../javascript/Mechanics/Prehistoric/Actions";
    import { upgradeManager } from "../../javascript/Upgrades/UpgradeManager";
    import { player } from "../../stores/player";
    import UpgradeButton from "../UpgradeButton.svelte";

    let hunt_color = "grey";
    let explore_color = "grey";
    let collect_resources_color = "grey";
    let train_color = "grey";

    let actionsPercent = 0;
    let timeLeft = 0;

    let explore_unlocked = true;
    let hunt_unlocked = false;
    let collect_resources_unlocked = false;
    let train_unlocked = false;

    $: {
        function CheckColor(){
            let action = $player.actions.current;

            hunt_color = action == "hunt" ? "green" : "grey";
            explore_color = action == "explore" ? "green" : "grey";
            collect_resources_color = action == "collect_resources" ? "green" : "grey";
            train_color = action == "train" ? "green" : "grey";
        }

        CheckColor();

        actionsPercent = GetActionPercentage() * 100;
        timeLeft = ActionTimeLeft();

        hunt_unlocked = $player.resources.people.amount.gte(2);
        collect_resources_unlocked = $player.resources.people.amount.gte(15);
        train_unlocked = $player.resources.people.amount.gte(25);
    }

</script>


<div class="ui grid fluid stackable">
    {#if explore_unlocked}
    <div class="ui eight wide column" transition:fly={{y:50, duration: 150}}>
        <button class="ui fluid button big {explore_color}" on:click={() => SetAction("explore")}>Explore</button>
        <div class="ui horizontal divider hidden"></div>
    </div>
    {/if}
    {#if hunt_unlocked}
    <div class="ui eight wide column" transition:fly={{y:50, duration: 150}}>
        <button class="ui fluid button big {hunt_color}" on:click={() => SetAction("hunt")}>Hunt</button>
        <div class="ui horizontal divider hidden"></div>
    </div>
    {/if}
    {#if collect_resources_unlocked}
    <div class="ui eight wide column" transition:fly={{y:50, duration: 150}}>
        <button class="ui fluid button big {collect_resources_color}" on:click={() => SetAction("collect_resources")}>Collect Resources</button>
        <div class="ui horizontal divider hidden"></div>
    </div>
    {/if}
    {#if train_unlocked}
    <div class="ui eight wide column" transition:fly={{y:50, duration: 150}}>
        <button class="ui fluid button big {train_color}" on:click={() => SetAction("train")}>Train</button>
        <div class="ui horizontal divider hidden"></div>
    </div>
    {/if}
    {#if $player.actions.current != ""}
    <div class="ui sixteen wide column" transition:fly={{x:50, duration: 150}}>
        <div class="ui progress small green indicating">
            <div class="bar" style="width: {actionsPercent}%;"></div>
            <div class="label">{FormatTimeLong(timeLeft)}</div>
        </div>
    </div>
    {/if}

    <div class="ui sixteen wide column">
        <div class="ui block header">Upgrades</div>
    </div>
    
    <div class="four wide column">
        <UpgradeButton upgradeRef={upgradeManager.Get("hunting")}/>
    </div>
    <div class="four wide column">
        <UpgradeButton upgradeRef={upgradeManager.Get("shelter")}/>
    </div>
    <div class="four wide column">
        <UpgradeButton upgradeRef={upgradeManager.Get("fire")}/>
    </div>
    <div class="four wide column">
        <UpgradeButton upgradeRef={upgradeManager.Get("storage")}/>
    </div>
    <div class="four wide column">
        <UpgradeButton upgradeRef={upgradeManager.Get("wood_chopping")}/>
    </div>
</div>