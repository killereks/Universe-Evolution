<script>
    import UpgradeButton from "../UpgradeButton.svelte";

    import { player } from "../../stores/player";

    import { FoodProduction, FarmerPrice, PurchaseFarmer } from "../../javascript/Production.js";
    import { Format } from "../../javascript/Mathf"

</script>

<div class="ui block header">Government</div>

<div class="ui grid four columns">
    <div class="column">
        <UpgradeButton click={() => PurchaseFarmer(1)} description="Farmer" 
                       effect={`Food production: ${Format($player.resources.food.perSecond)} → ${Format(FoodProduction($player.workers.farmers.amount.add(1)))}`} 
                       price={FarmerPrice($player.workers.farmers.amount)}
                       money={$player.resources.money.amount}
                       moneyIcon={$player.resources.money.icon}/>
    </div>
</div>