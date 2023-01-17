<script>
	import Decimal from 'decimal.js';
	import ProgressBar from './Components/ProgressBar.svelte';
	import UpgradeButton from './Components/UpgradeButton.svelte';

	import {Format, FormatTimeLong, FormatTimeShort} from './Mathf';
	import ResourceDisplay from './Components/ResourceDisplay.svelte';
	import MenuItem from './Components/MenuItem.svelte';

	// menus
	import AchievementMenu from './Components/Menus/AchievementMenu.svelte';
	import SettingsMenu from './Components/Menus/SettingsMenu.svelte';
	import GovernmentMenu from './Components/Menus/GovernmentMenu.svelte';

	import { player } from './stores/player.js';
    import { FoodProduction } from './javascript/Production';
    import Notification from './Components/Notification.svelte';

	const allAges = ["Prehistoric","Ancient","Classical","Medieval","Renaissance","Industrial","Modern",
					"Post-modern","Futuristic","Space Colonization","Post-Singularity","Transhumanism",
				"Post-Scarcity","Intergalactic","Virtual Reality","Time Travel","Transdimensional"];

	var game_speed = 1;

	function loop(){
		$player.lastUpdate = Date.now();

		let dt = 1 / $player.settings.fps;

		TimeTick(dt * game_speed);

		setTimeout(loop, dt * 1000);
	}
	loop();

	function TimeTick(tick){
		$player.timePlayed += tick;

		document.title = Format($player.resources.money.amount) + " - " + allAges[$player.currentAge];

		PeopleTick();
		MoneyTick();

		WorkersTick(tick);

		ResourceTick($player.resources.people, tick);
		ResourceTick($player.resources.money, tick);
		ResourceTick($player.resources.food, tick);
	}

	setInterval(CheckUnlocks, 1000);

	function PeopleTick(){
		var foodBonus = Decimal.log($player.resources.food.amount.add(1), 3);
		$player.resources.people.perSecond = $player.resources.people.amount.mul(0.01).mul(foodBonus);
	}

	function MoneyTick(){
		var moneyPerSec = $player.resources.people.amount.mul(0.1);
		$player.resources.money.perSecond = moneyPerSec;
	}

	function WorkersTick(dt){
		var workers = $player.workers;
		var res = $player.resources;

		// farmers
		res.food.perSecond = FoodProduction(workers.farmers.amount);
	}

	function ResourceTick(res, tick){
		if (res.amount.lt(res.amountMax)){
			res.amount = res.amount.add(res.perSecond.mul(tick));
		}

		res.amount = res.amount.add(res.perSecond.mul(tick));

		res.amount = res.amount.clamp(0, res.amountMax);
	}

	function CheckUnlocks(){
		if (!$player.resources.food.unlocked){
			if ($player.resources.money.amount.gte(10)){
				$player.resources.food.unlocked = true;
				$player.menuTabs.government = true;
				CreateNotification("Unlocked government tab!", "orange");
				CreateNotification("Unlocked food!", "green");
			}
		}
	}

	function OpenMenu(name){
		$player.menu = name;
		console.log($player.menu);
	}

	function CreateNotification(title, color){
		color = color || "orange";
		let notif = new Notification({target: document.querySelector('.notifications'), props: {title: title, color: color}});
		setTimeout(() => notif.$destroy(), 4000);
	}
</script>

<main>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css">
	
	<link rel="stylesheet" href="https://raw.githubusercontent.com/silvio-r/spop/gh-pages/dist/spop.min.css">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

	<script src="https://cdn.tailwindcss.com"></script>

	<div class="ui input labeled big">
		<div class="ui label">Game Speed</div>
		<input bind:value={game_speed} type="number">
	</div>

	<button class="ui button" on:click={() => CreateNotification("Test", "orange")}>Test</button>
	<button class="ui button" on:click={() => CreateNotification("TestTest")}>Test</button>
	<button class="ui button" on:click={() => CreateNotification("TestTestTest")}>Test</button>
	<button class="ui button" on:click={() => CreateNotification("Some very long description")}>Test</button>

	<div class="notifications"></div>

	<div class="ui segment basic padded">
		<div class="ui secondary pointing menu">
			<MenuItem on:click={() => {}} title={allAges[$player.currentAge]} unlocked={true}/>
			<MenuItem on:click={() => OpenMenu("Automation")} title="🤖 Automation" unlocked={$player.menuTabs.automation}/>
			<MenuItem on:click={() => OpenMenu("Construction")} title="🛠️ Construction" unlocked={$player.menuTabs.construction}/>
			<MenuItem on:click={() => OpenMenu("Government")} title="🏛️ Government" unlocked={$player.menuTabs.government}/>
			<MenuItem on:click={() => OpenMenu("Military")} title="⚔️ Military" unlocked={$player.menuTabs.military}/>
			<MenuItem on:click={() => OpenMenu("Research")} title="📜 Research" unlocked={$player.menuTabs.research}/>
			<MenuItem on:click={() => OpenMenu("Trade")} title="🏦 Trade" unlocked={$player.menuTabs.trade}/>
			<MenuItem on:click={() => OpenMenu("Upgrades")} title="🔧 Upgrades" unlocked={$player.menuTabs.upgrades}/>

			<div class="right menu">
				<MenuItem title="🏆 Achievements" unlocked={$player.menuTabs.achievements} on:click={() => OpenMenu("Achievements")}/>
				<MenuItem title="⚙️ Settings" unlocked={true} on:click={() => OpenMenu("Settings")}/>
				<a class="item">Played for {FormatTimeShort($player.timePlayed)}</a>
			</div>
		</div>
		<div class="ui grid">
			<div class="four wide column">
				<div class="ui segment">
					<div class="ui relaxed divided big list">
						<ResourceDisplay resource={$player.resources.money} />
						<ResourceDisplay resource={$player.resources.people} places={0} />
						<ResourceDisplay resource={$player.resources.food} />
						<ResourceDisplay resource={$player.resources.livestock} />
					</div>
				</div>
				<div class="ui segment">
					<div class="ui relaxed divided big list">
						<ResourceDisplay resource={$player.resources.wood} />
						<ResourceDisplay resource={$player.resources.stone} />
						<ResourceDisplay resource={$player.resources.ore} />
						<ResourceDisplay resource={$player.resources.herbs} />
					</div>
				</div>
				<button class="ui button fluid basic"></button>
			</div>
			<div class="twelve wide column">
				<div class="ui segment basic padded">
					{#if $player.menu == "Automation"}
						<!-- <AutomationMenu /> -->
					{:else if $player.menu == "Upgrades"}
						<!-- <UpgradesMenu /> -->
					{:else if $player.menu == "Construction"}
						<!-- <ConstructionMenu /> -->
					{:else if $player.menu == "Military"}
						<!-- <MilitaryMenu /> -->
					{:else if $player.menu == "Research"}
						<!-- <ResearchMenu /> -->
					{:else if $player.menu == "Trade"}
						<!-- <TradeMenu /> -->
					{:else if $player.menu == "Government"}
						<GovernmentMenu />
					{:else if $player.menu == "Achievements"}
						<AchievementMenu/>
					{:else if $player.menu == "Settings"}
						<SettingsMenu />
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

<style global>
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	main {
		text-align: center;
	}

	:global(*:not(i)) {
		font-family: 'Roboto', sans-serif !important;
	}

	.notifications {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 10;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-end;
		padding: 0.25rem;
	}

</style>