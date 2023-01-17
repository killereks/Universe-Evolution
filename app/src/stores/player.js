import Decimal from "decimal.js";

import { writable } from "svelte/store";

const defaultPlayer = {
	lastUpdate: Date.now(),
	timePlayed: 0,

	lastSaved: 0,

	menu: "",

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

	workers: {
		farmers: {
			icon: "👨‍🌾",
			amount: new Decimal(0),
			unlocked: true,
		},
		woodcutters: {
			icon: "🪓",
			amount: new Decimal(0),
			unlocked: false,
		},
		miners: {
			icon: "⛏️",
			amount: new Decimal(0),
			unlocked: false,
		},
		blacksmiths: {
			icon: "🛠️",
			amount: new Decimal(0),
			unlocked: false,
		},
	},
	
	resources: {
		people: {
			icon: "👨‍👩‍👧‍👦",
			amount: new Decimal(3),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: true,
		},
		food: {
			icon: "🍲",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		wood: {
			icon: "🌲",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		stone: {
			icon: "🪨",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		ore: {
			icon: "💎",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		herbs: {
			icon: "🌱",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		livestock: {
			icon: "🐄",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: false,
		},
		money: {
			icon: "💰",
			amount: new Decimal(0),
			amountMax: new Decimal(100),
			perSecond: new Decimal(0),
			unlocked: true,
		}
	}
};

export let player = writable(defaultPlayer);