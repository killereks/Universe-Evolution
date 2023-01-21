import Decimal from "decimal.js";

import { writable } from "svelte/store";

const defaultPlayer = {
	lastUpdate: Date.now(),
	timePlayed: 0,

	lastSaved: 0,

	menu: "none",

	currentAge: 0,

	menuTabs: {
		automation: false,
		upgrades: false,
		construction: false,
		military: false,
		research: false,
		trade: false,
		government: false,
		achievements: false,
	},

	featuresUnlocked: {
		prestige: false,
	},

	upgrades: [],

	workers: {
		farmers: {
			icon: "👨‍🌾",
			amount: new Decimal(0),
			unlocked: true,
		},
		blacksmiths: {
			icon: "🛠️",
			amount: new Decimal(0),
			unlocked: false,
		},
	},
	
	resources: {
		money: {
			icon: "💰",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: true,
		},
		people: {
			icon: "👨‍👩‍👧‍👦",
			amount: new Decimal(5),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		food: {
			icon: "🍲",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		tools: {
			icon: "🔨",
			amount: new Decimal(0),
			perSecond: new Decimal(0),
			unlocked: false,
		},
	},
	settings: {
		format: "default",
		fps: 30,
		offlineTicks: 20000
	}
};

export let player = writable(defaultPlayer);