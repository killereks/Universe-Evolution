<script>
    import UpgradeButton from "../UpgradeButton.svelte";

    import { player } from "../../stores/player";

    import { Format } from "../../javascript/Mathf"
    import Decimal from "decimal.js";

    import { PurchaseUpgradeUsingFood, PurchaseUpgradeUsingTools } from "../../javascript/Upgrades/PurchaseUpgrade";

    let farming_tools_price = new Decimal('2');
    let taxation_price = new Decimal('10');

</script>

<div class="ui block header">Construction</div>

<div class="ui grid four columns">
    <div class="column">
        <UpgradeButton click={() => PurchaseUpgradeUsingTools("farming_tools", farming_tools_price)} description={`Farming Tools`}
                       effect={"You'll be reaping twice the crops with half the effort!"} 
                       price={farming_tools_price}
                       money={$player.resources.tools.amount}
                       moneyIcon={$player.resources.tools.icon}
                       fullyBought={$player.upgrades.includes("farming_tools")}/>
    </div>
    <div class="column">
        <UpgradeButton  click={() => PurchaseUpgradeUsingFood("taxation", taxation_price)} description={`Taxation`}
                        effect={"The Tax-Man: Impose taxes, increase resources, with a funny twist."} 
                        price={taxation_price}
                        money={$player.resources.food.amount}
                        moneyIcon={$player.resources.food.icon}
                        fullyBought={$player.upgrades.includes("taxation")}/>
    </div>
</div>