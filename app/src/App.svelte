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
	import SettingsMenu from './Components/Menus/SettingsMenu.svelte';

	import { player } from './stores/player.js';

    import { Save, Load } from './javascript/SaveLoad';
    import UpgradeButton from "./Components/UpgradeButton.svelte";

	import { upgradeManager } from "./javascript/Upgrades/UpgradeManager";

	const allAges = ["Prehistoric","Ancient","Classical","Medieval","Renaissance","Industrial","Modern",
					"Post-modern","Futuristic","Space Colonization","Post-Singularity","Transhumanism",
				"Post-Scarcity","Intergalactic","Virtual Reality","Time Travel","Transdimensional"];

	var game_speed = 1;

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

		CalculatePeoplePerSec();
		CalculateMoneyPerSec();
		CalculateFoodPerSec();

		ResourceTick($player.resources.money, tick);
		ResourceTick($player.resources.people, tick);
		ResourceTick($player.resources.food, tick);
	}

	setInterval(CheckUnlocks, 250);

	function CalculatePeoplePerSec(){
		let perSec = new Decimal(0);
		
		if ($player.resources.food.amount > 0){
			perSec = new Decimal(0.2);
		}
		$player.resources.people.perSecond = perSec;
	}

	function CalculateMoneyPerSec(){
		if (!$player.resources.money.unlocked) return;

		var moneyPerSec = new Decimal(1);
		$player.resources.money.perSecond = moneyPerSec;
	}

	function CalculateFoodPerSec(){
		var foodPerSec = $player.resources.people.amount.mul(-0.05);

		foodPerSec = foodPerSec.add(upgradeManager.GetUpgrade("food_production").GetValue());

		$player.resources.food.perSecond = foodPerSec;
	}

	function ResourceTick(res, tick){
		if (!res.unlocked) return;

		if (res.perSecond.lt(0) && res.amount.lt(-res.perSecond.mul(tick))){
			res.amount = new Decimal(0);
		} else {
			res.amount = res.amount.add(res.perSecond.mul(tick));
		}
	}

	function CheckUnlocks(){
		
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
					Save();
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
					</div>
				</div>
				<!-- Prestige requirements here -->
			</div>
			<div class="twelve wide column">
				<div class="ui segment basic padded">
					{#if $player.menu == "Settings"}
					<SettingsMenu/>
					{/if}
					<UpgradeButton upgradeRef={upgradeManager.GetUpgrade("food_production")}/>
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