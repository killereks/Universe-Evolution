<script>
// @ts-nocheck

	import "./css/modal.css";

	import { fly } from 'svelte/transition';

	import { onMount } from 'svelte';

	import Decimal from 'decimal.js';

	import {Clamp, Format, FormatTimeLong, FormatTimeShort} from './javascript/Mathf';
	import ResourceDisplay from './Components/ResourceDisplay.svelte';
	import MenuItem from './Components/MenuItem.svelte';

	// menus
	import AchievementMenu from './Components/Menus/AchievementMenu.svelte';
	import SettingsMenu from './Components/Menus/SettingsMenu.svelte';
	import GovernmentMenu from './Components/Menus/GovernmentMenu.svelte';

	import { player } from './stores/player.js';

    import { FoodProduction } from './javascript/Production/FoodProduction';
	import { ToolProduction } from './javascript/Production/ToolProduction';

	import { CreateNotification } from './javascript/Notifications';
    import { PrestigeRequirementsString, EraPrestige, CanEraPrestige } from './javascript/Prestige';
    import ConstructionMenu from './Components/Menus/ConstructionMenu.svelte';
    import { Save, Load } from './javascript/SaveLoad';
    import Mining from "./Components/Menus/Mining.svelte";
	import {MiningTick} from "./javascript/Mechanics/Mining";

	const allAges = ["Prehistoric","Ancient","Classical","Medieval","Renaissance","Industrial","Modern",
					"Post-modern","Futuristic","Space Colonization","Post-Singularity","Transhumanism",
				"Post-Scarcity","Intergalactic","Virtual Reality","Time Travel","Transdimensional"];

	var game_speed = 1;
	var can_prestige = false;

	function loop(){
		$player.lastUpdate = Date.now();

		let dt = 1 / $player.settings.fps;

		TimeTick(dt * game_speed);

		$player.lastSaved += dt;

		if ($player.lastSaved >= 30){
			Save();
		}

		setTimeout(loop, dt * 1000);
	}
	loop();

	function TimeTick(tick){
		$player.timePlayed += tick;

		document.title = Format($player.resources.money.amount) + " - " + allAges[$player.currentAge];

		PeopleTick();
		MoneyTick();

		MiningTick(tick);

		WorkersTick(tick);

		ResourceTick($player.resources.people, tick);
		ResourceTick($player.resources.money, tick);
		ResourceTick($player.resources.food, tick);
		ResourceTick($player.resources.tools, tick);
	}

	setInterval(CheckUnlocks, 250);

	function PeopleTick(){
		var foodBonus = Decimal.log($player.resources.food.amount.add(1), 10);
		$player.resources.people.perSecond = Decimal.max(0, foodBonus);
	}

	function MoneyTick(){
		var moneyPerSec = new Decimal(1);

		if ($player.upgrades.includes("taxation")){
			moneyPerSec = moneyPerSec.add($player.resources.people.amount.mul(0.1));
		}

		$player.resources.money.perSecond = moneyPerSec;
	}

	function WorkersTick(dt){
		var workers = $player.workers;
		var res = $player.resources;

		// farmers
		res.food.perSecond = FoodProduction(workers.farmers.amount);
		// blacksmiths
		res.tools.perSecond = ToolProduction(workers.blacksmiths.amount);
	}

	function ResourceTick(res, tick){
		res.amount = res.amount.add(res.perSecond.mul(tick));
	}

	function CheckUnlocks(){
		// government and food
		if (!$player.resources.food.unlocked){
			if ($player.resources.money.amount.gte(5)){
				$player.resources.food.unlocked = true;
				$player.menuTabs.government = true;
				CreateNotification("Unlocked government tab!", "orange");
				CreateNotification("Unlocked food!", "green");
			}
		}

		can_prestige = CanEraPrestige();

		// era prestige
		if (!$player.featuresUnlocked.prestige){
			if ($player.resources.food.amount.gte(15)){
				$player.featuresUnlocked.prestige = true;
				CreateNotification("Unlocked era prestige!", "orange");
			}
		}

		// construction
		if (!$player.menuTabs.construction){
			if ($player.currentAge === 1){
				$player.menuTabs.construction = true;
				CreateNotification("Unlocked construction tab!", "orange");
			}
		}
	}

	function OpenMenu(name){
		$player.menu = name;
	}

	onMount(() => {
		// don't accidentally overwrite save
		$player.lastSaved = 0;
		Load();
		OfflineProgress();
	});

	let offlineProgress = {
		calculating: false,
		currentTick: 0,
		percent: 0,
	}

	function OfflineProgress(){
		var now = Date.now();
		var dt = (now - $player.lastUpdate) / 1000;

		if (dt < 0){
			dt = 0;
		}

		if (dt < 5){
			return;
		}

		offlineProgress.currentTick = 0;

		function runOfflineProgress(ticks){
			let deltaTime = dt / ticks;

			let ticksAtTime = 100;

			offlineProgress.calculating = true;

			for (let i = 0; i < ticksAtTime; i++){
				offlineProgress.currentTick++;

				if (offlineProgress.currentTick <= ticks){
					TimeTick(deltaTime);
				} else {
					offlineProgress.calculating = false;
					return;
				}
			}

			offlineProgress.percent = offlineProgress.currentTick / ticks;
			
			requestAnimationFrame(() => runOfflineProgress(ticks));
		}

		runOfflineProgress($player.settings.offlineTicks);
	}

	function onKeyDown(e) {
		if (e.key == "s" && e.ctrlKey){
			Save();
		}

		// F5
		if (e.keyCode == 116){
			location.reload();
		}
	}
</script>

<main>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css">
	
	<link rel="stylesheet" href="https://raw.githubusercontent.com/silvio-r/spop/gh-pages/dist/spop.min.css">

	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

	<script src="https://cdn.tailwindcss.com"></script>

	<div class="ui segment">
		<div class="ui block header">CHEATS</div>
		<div class="ui input labeled big">
			<div class="ui label">Game Speed</div>
			<input bind:value={game_speed} type="number">
		</div>
	</div>

	<div class="notifications"></div>

	{#if offlineProgress.calculating}
	<div class="custom-modal" transition:fly={{y:-100}}>
		<div class="ui segment">
			<div class="ui header">Calculating Offline Progress...</div>
			<p>
				While you were offline, our trusty time-travelling historians were working hard to keep your progress up to date. <br>
				Please wait while they calculate your progress.
			</p>
			<div class="content">
				<div class="ui active progress small green indicating">
					<div class="bar" style="width: {offlineProgress.percent * 100}%;"></div>
					<div class="label">{offlineProgress.currentTick} / {$player.settings.offlineTicks} ticks</div>
				</div>
			</div>
		</div>
	</div>
	{/if}

	<div class="ui segment basic padded">
		<div class="ui secondary pointing menu stackable">
			<MenuItem on:click={() => {}} title={allAges[$player.currentAge]} unlocked={true}/>
			<MenuItem on:click={() => OpenMenu("Automation")} title="🤖 Automation" unlocked={$player.menuTabs.automation}/>
			<MenuItem on:click={() => OpenMenu("Cave") } title="🏔️ Cave" unlocked={$player.menuTabs.cave}/>
			<MenuItem on:click={() => OpenMenu("Construction")} title="🛠️ Construction" unlocked={$player.menuTabs.construction}/>
			<MenuItem on:click={() => OpenMenu("Government")} title="🏛️ Government" unlocked={$player.menuTabs.government}/>
			<MenuItem on:click={() => OpenMenu("Military")} title="⚔️ Military" unlocked={$player.menuTabs.military}/>
			<MenuItem on:click={() => OpenMenu("Research")} title="📜 Research" unlocked={$player.menuTabs.research}/>
			<MenuItem on:click={() => OpenMenu("Trade")} title="🏦 Trade" unlocked={$player.menuTabs.trade}/>
			<MenuItem on:click={() => OpenMenu("Upgrades")} title="🔧 Upgrades" unlocked={$player.menuTabs.upgrades}/>

			<div class="right menu">
				<MenuItem title="🏆 Achievements" unlocked={$player.menuTabs.achievements} on:click={() => OpenMenu("Achievements")}/>
				<MenuItem title="⚙️ Settings" unlocked={true} on:click={() => OpenMenu("Settings")}/>
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class="item">Played for {FormatTimeShort($player.timePlayed)}</a>
			</div>
		</div>
		<div class="ui grid stackable">
			<div class="four wide column">
				<div class="ui segment">
					<div class="ui relaxed divided big list">
						<ResourceDisplay resource={$player.resources.money} />
						<ResourceDisplay resource={$player.resources.people} places={0} />
						<ResourceDisplay resource={$player.resources.food} />
						<ResourceDisplay resource={$player.resources.tools} />
					</div>
				</div>
				<!-- <div class="ui segment">
					<div class="ui relaxed divided big list">
						<ResourceDisplay resource={$player.resources.wood} />
						<ResourceDisplay resource={$player.resources.stone} />
						<ResourceDisplay resource={$player.resources.ore} />
						<ResourceDisplay resource={$player.resources.herbs} />
					</div>
				</div> -->
				{#if $player.featuresUnlocked.prestige}
				<div class="ui segment fluid" transition:fly={{x:200}}>
					<div class="ui list big divided">
						{@html PrestigeRequirementsString($player.currentAge)}
					</div>
					{#if can_prestige}
						<button class="ui button fluid" on:click={EraPrestige}>Prestige to {allAges[$player.currentAge + 1]}</button>
					{:else}
						<button class="ui button fluid disabled">Can't Prestige.</button>
					{/if}
				</div>
				{/if}
			</div>
			<div class="twelve wide column">
				<div class="ui segment basic padded">
					{#if $player.menu == "Automation"}
						<!-- <AutomationMenu /> -->
					{:else if $player.menu == "Upgrades"}
						<!-- <UpgradesMenu /> -->
					{:else if $player.menu == "Construction"}
						<ConstructionMenu/>
					{:else if $player.menu == "Cave"}
						<Mining />
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

<!-- <svelte:window on:keydown|preventDefault={onKeyDown} /> -->
<svelte:window on:keydown={onKeyDown} />

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
		pointer-events: none;
	}

	* {
		user-select: none;
	}

</style>