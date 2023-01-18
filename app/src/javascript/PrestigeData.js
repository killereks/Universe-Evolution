import { Decimal } from 'decimal.js';

import { get } from 'svelte/store';
import { player } from '../stores/player';

export const requirements = [
    // prehistoric -> Ancient
    {
        requirements: {
            money: new Decimal(30),
            food: new Decimal(50),
        },
        unlocks: {
            resources: ["tools", "people"],
            workers: ["blacksmiths"]
        }
    },
    // Ancient -> Classical
    {
        requirements: {
            money: new Decimal('2000'),
            people: new Decimal('1000'),
            food: new Decimal('2000'),
        }
    }
];