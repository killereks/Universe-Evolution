<script>
    import UpgradeButton from "../UpgradeButton.svelte";

    import { player } from "../../stores/player";

    import { FoodProduction, FarmerPrice, PurchaseFarmer } from "../../javascript/Production/FoodProduction.js";
    import { ToolProduction, BlacksmithPrice, PurchaseBlacksmith } from "../../javascript/Production/ToolProduction.js";

    import { Format } from "../../javascript/Mathf"

</script>

<div class="ui block header">Government</div>

<div class="ui grid four columns stackable">
    <div class="column">
        <UpgradeButton click={() => PurchaseFarmer(1)} description={`Farmer (${$player.workers.farmers.amount})`}
                       effect={`Food production: ${Format($player.resources.food.perSecond)} → ${Format(FoodProduction($player.workers.farmers.amount.add(1)))}`} 
                       price={FarmerPrice($player.workers.farmers.amount)}
                       money={$player.resources.money.amount}
                       moneyIcon={$player.resources.money.icon}/>
    </div>
    <div class="column">
        {#if $player.workers.blacksmiths.unlocked}
        <UpgradeButton click={() => PurchaseBlacksmith(1)} description={`Blacksmith (${$player.workers.blacksmiths.amount})`}
            effect={`Tool production: ${Format($player.resources.tools.perSecond)} → ${Format(ToolProduction($player.workers.blacksmiths.amount.add(1)))}`} 
            price={BlacksmithPrice($player.workers.blacksmiths.amount)}
            money={$player.resources.money.amount}
            moneyIcon={$player.resources.money.icon}/>
        {/if}
    </div>
</div>