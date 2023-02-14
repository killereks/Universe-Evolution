import Decimal from "decimal.js";
import { writable } from "svelte/store";

const defaultPlayer = {
	lastUpdate: Date.now(),
	timePlayed: 0,

	lastSaved: 0,

	menu: "none", // "none"

	currentAge: 0,

	menuTabs: {
		actions: true,
		achievements: false,
	},

	featuresUnlocked: {
		prestige: false,
	},

	upgrades: {},
	
	resources: {
		money: {
			icon: "money",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		people: {
			icon: "people",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: true,
		},
		food: {
			icon: "food",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		wood: {
			icon: "wood",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: false,
		}
	},

	actions: {
		current: "",
		progress: 0
	},

	settings: {
		format: "default",
		fps: 30,
		offlineTicks: 50000,
		displayTimeLeft: false
	}
};

export let player = writable(defaultPlayer);