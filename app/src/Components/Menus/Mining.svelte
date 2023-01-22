<script>
    import Decimal from "decimal.js";
    import { fly } from "svelte/transition";
    import { Englishfy, Format } from "../../javascript/Mathf";

    import { MiningDoubleLiraAmountPrice, MiningFillRate, MiningFillRatePrice, MiningFiveLiraAmountPrice, MiningLiraAmount, MiningLiraChance,
             MiningLiraChancePrice, PurchaseMiningDoubleLiraAmount, PurchaseMiningFillRate,
              PurchaseMiningFiveLiraAmount, PurchaseMiningLiraChance, PurchaseMiningAutomation, EstimatedLirasPerSecond} from "../../javascript/Production/LiraProduction";

    import { MiningCollect } from "../../javascript/Mechanics/Mining";

    import { player } from "../../stores/player";
    import UpgradeButton from "../UpgradeButton.svelte";

</script>

<div class="ui block header">Cave</div>

<div class="ui grid stackable">
    <div class="sixteen wide column">
        <div class="ui active progress indicating fluid">
            <div class="bar" style="width: {$player.mining.progress}%;"></div>
            <div class="label">Mining...</div>
        </div>
        {#if !$player.mining.automateBought && $player.mining.progress >= 100}
        <button on:click={MiningCollect} transition:fly={{y: -50}} class="ui button">Collect</button>
        {/if}
    </div>
    <div class="eight wide column">
        <div class="ui statistic blue">
            <div class="value">{Format($player.resources.liras.amount, 0)}</div>
            <div class="label">{Englishfy($player.resources.liras.amount, "liras", "lira")}</div>
        </div>
    </div>
    <div class="eight wide column">
        <div class="ui statistic green">
            <div class="value">~{Format(EstimatedLirasPerSecond($player.resources.liras.amount), 2)}</div>
            <div class="label">Per Second</div>
        </div>
    </div>
    <div class="four wide column">
        <UpgradeButton description="Increase bar fill up rate"
                        effect="x{Format(MiningFillRate($player.mining.barFillUpBought), 2)} → x{Format(MiningFillRate($player.mining.barFillUpBought+1), 2)}"
                        moneyIcon={$player.resources.money.icon}
                        money={$player.resources.money.amount}
                        price={MiningFillRatePrice($player.mining.barFillUpBought)}
                        click={PurchaseMiningFillRate}/>
    </div>
    {#if !$player.mining.automateBought}
    <div transition:fly={{y:100}} class="four wide column">
        <UpgradeButton description="Automate bar collection"
                        effect="Manual → Automatic"
                        fullyBought={$player.mining.automateBought}
                        moneyIcon={$player.resources.liras.icon}
                        price={new Decimal(10)}
                        money={$player.resources.liras.amount}
                        click={PurchaseMiningAutomation}/>
    </div>
    {/if}
    {#if $player.mining.liraChanceBought < 90}
    <div transition:fly={{y:100}} class="four wide column">
        <UpgradeButton description="Increase chance to receive a lira"
                        effect="{(MiningLiraChance($player.mining.liraChanceBought)*100).toFixed(0)}% → {(MiningLiraChance($player.mining.liraChanceBought+1)*100).toFixed(0)}%"
                        fullyBought={$player.mining.liraChanceBought >= 99}
                        moneyIcon={$player.resources.liras.icon}
                        money={$player.resources.liras.amount}
                        price={MiningLiraChancePrice($player.mining.liraChanceBought)}
                        click={PurchaseMiningLiraChance}/>
    </div>
    {/if}
    <div class="four wide column">
        <UpgradeButton description="More liras"
                        effect="{Format(MiningLiraAmount($player.mining.doubleAmountBought, $player.mining.fiveAmountBought), 0)} → {Format(MiningLiraAmount($player.mining.doubleAmountBought+1, $player.mining.fiveAmountBought), 0)}"
                        moneyIcon={$player.resources.liras.icon}
                        money={$player.resources.liras.amount}
                        price={MiningDoubleLiraAmountPrice($player.mining.doubleAmountBought)}
                        click={PurchaseMiningDoubleLiraAmount}/>
    </div>
    <div class="four wide column">
        <UpgradeButton description="Even more liras"
                        effect="{Format(MiningLiraAmount($player.mining.doubleAmountBought, $player.mining.fiveAmountBought), 0)} → {Format(MiningLiraAmount($player.mining.doubleAmountBought, $player.mining.fiveAmountBought+1), 0)}"
                        moneyIcon={$player.resources.liras.icon}
                        money={$player.resources.liras.amount}
                        price={MiningFiveLiraAmountPrice($player.mining.fiveAmountBought)}
                        click={PurchaseMiningFiveLiraAmount}/>
    </div>
</div>