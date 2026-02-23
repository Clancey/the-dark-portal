/**
 * Level Boost Starter Gear Data for WotLK
 *
 * Class IDs:
 * 1 = Warrior, 2 = Paladin, 3 = Hunter, 4 = Rogue, 5 = Priest,
 * 6 = Death Knight, 7 = Shaman, 8 = Mage, 9 = Warlock, 11 = Druid
 */

// Class names for display
export const CLASS_NAMES = {
  1: 'Warrior',
  2: 'Paladin',
  3: 'Hunter',
  4: 'Rogue',
  5: 'Priest',
  6: 'Death Knight',
  7: 'Shaman',
  8: 'Mage',
  9: 'Warlock',
  11: 'Druid',
};

// Race names for display
export const RACE_NAMES = {
  1: 'Human',
  2: 'Orc',
  3: 'Dwarf',
  4: 'Night Elf',
  5: 'Undead',
  6: 'Tauren',
  7: 'Gnome',
  8: 'Troll',
  10: 'Blood Elf',
  11: 'Draenei',
};

// Specs by class with role type
export const CLASS_SPECS = {
  1: [ // Warrior
    {id: 'arms', name: 'Arms', role: 'melee_dps'},
    {id: 'fury', name: 'Fury', role: 'melee_dps'},
    {id: 'protection', name: 'Protection', role: 'tank'},
  ],
  2: [ // Paladin
    {id: 'holy', name: 'Holy', role: 'healer'},
    {id: 'protection', name: 'Protection', role: 'tank'},
    {id: 'retribution', name: 'Retribution', role: 'melee_dps'},
  ],
  3: [ // Hunter
    {id: 'beast_mastery', name: 'Beast Mastery', role: 'ranged_physical'},
    {id: 'marksmanship', name: 'Marksmanship', role: 'ranged_physical'},
    {id: 'survival', name: 'Survival', role: 'ranged_physical'},
  ],
  4: [ // Rogue
    {id: 'assassination', name: 'Assassination', role: 'melee_dps'},
    {id: 'combat', name: 'Combat', role: 'melee_dps'},
    {id: 'subtlety', name: 'Subtlety', role: 'melee_dps'},
  ],
  5: [ // Priest
    {id: 'discipline', name: 'Discipline', role: 'healer'},
    {id: 'holy', name: 'Holy', role: 'healer'},
    {id: 'shadow', name: 'Shadow', role: 'caster_dps'},
  ],
  6: [ // Death Knight
    {id: 'blood', name: 'Blood', role: 'tank'},
    {id: 'frost', name: 'Frost', role: 'melee_dps'},
    {id: 'unholy', name: 'Unholy', role: 'melee_dps'},
  ],
  7: [ // Shaman
    {id: 'elemental', name: 'Elemental', role: 'caster_dps'},
    {id: 'enhancement', name: 'Enhancement', role: 'melee_dps'},
    {id: 'restoration', name: 'Restoration', role: 'healer'},
  ],
  8: [ // Mage
    {id: 'arcane', name: 'Arcane', role: 'caster_dps'},
    {id: 'fire', name: 'Fire', role: 'caster_dps'},
    {id: 'frost', name: 'Frost', role: 'caster_dps'},
  ],
  9: [ // Warlock
    {id: 'affliction', name: 'Affliction', role: 'caster_dps'},
    {id: 'demonology', name: 'Demonology', role: 'caster_dps'},
    {id: 'destruction', name: 'Destruction', role: 'caster_dps'},
  ],
  11: [ // Druid
    {id: 'balance', name: 'Balance', role: 'caster_dps'},
    {id: 'feral_dps', name: 'Feral (DPS)', role: 'melee_dps'},
    {id: 'feral_tank', name: 'Feral (Tank)', role: 'tank'},
    {id: 'restoration', name: 'Restoration', role: 'healer'},
  ],
};

// Get armor type based on class
/**
 * @param classId
 */
function getArmorType(classId) {
  if ([8, 5, 9].includes(classId)) return 'cloth';
  if ([11, 4].includes(classId)) return 'leather';
  if ([3, 7].includes(classId)) return 'mail';
  return 'plate';
}

// Gear sets by role and level
// These item IDs are examples - adjust based on your server's available items
const ROLE_GEAR = {
  // Tank gear - high stamina, defense stats
  tank: {
    60: {
      plate: [43837, 43838, 43839, 43840, 43841], // Tempered Saronite set (placeholder)
      leather: [43842, 43843, 43844, 43845, 43846], // Heavy Borean Leather set
    },
    70: {
      plate: [34675, 34676, 34677, 34678, 34679],
      leather: [34680, 34681, 34682, 34683, 34684],
    },
    80: {
      plate: [40545, 40546, 40547, 40548, 40549], // Tempered Titansteel
      leather: [40550, 40551, 40552, 40553, 40554],
    },
  },
  // Melee DPS - strength/agility, attack power
  melee_dps: {
    60: {
      plate: [43855, 43856, 43857, 43858, 43859],
      leather: [43860, 43861, 43862, 43863, 43864],
      mail: [43865, 43866, 43867, 43868, 43869],
    },
    70: {
      plate: [34685, 34686, 34687, 34688, 34689],
      leather: [34690, 34691, 34692, 34693, 34694],
      mail: [34695, 34696, 34697, 34698, 34699],
    },
    80: {
      plate: [40555, 40556, 40557, 40558, 40559],
      leather: [40560, 40561, 40562, 40563, 40564],
      mail: [40565, 40566, 40567, 40568, 40569],
    },
  },
  // Ranged physical DPS (Hunter)
  ranged_physical: {
    60: {
      mail: [43870, 43871, 43872, 43873, 43874],
    },
    70: {
      mail: [34700, 34701, 34702, 34703, 34704],
    },
    80: {
      mail: [40570, 40571, 40572, 40573, 40574],
    },
  },
  // Caster DPS - intellect, spell power, hit
  caster_dps: {
    60: {
      cloth: [43875, 43876, 43877, 43878, 43879],
      leather: [43880, 43881, 43882, 43883, 43884],
      mail: [43885, 43886, 43887, 43888, 43889],
    },
    70: {
      cloth: [34705, 34706, 34707, 34708, 34709],
      leather: [34710, 34711, 34712, 34713, 34714],
      mail: [34715, 34716, 34717, 34718, 34719],
    },
    80: {
      cloth: [40575, 40576, 40577, 40578, 40579],
      leather: [40580, 40581, 40582, 40583, 40584],
      mail: [40585, 40586, 40587, 40588, 40589],
    },
  },
  // Healer - intellect, spell power, mp5, haste
  healer: {
    60: {
      cloth: [43890, 43891, 43892, 43893, 43894],
      leather: [43895, 43896, 43897, 43898, 43899],
      mail: [43900, 43901, 43902, 43903, 43904],
      plate: [43905, 43906, 43907, 43908, 43909],
    },
    70: {
      cloth: [34720, 34721, 34722, 34723, 34724],
      leather: [34725, 34726, 34727, 34728, 34729],
      mail: [34730, 34731, 34732, 34733, 34734],
      plate: [34735, 34736, 34737, 34738, 34739],
    },
    80: {
      cloth: [40590, 40591, 40592, 40593, 40594],
      leather: [40595, 40596, 40597, 40598, 40599],
      mail: [40600, 40601, 40602, 40603, 40604],
      plate: [40605, 40606, 40607, 40608, 40609],
    },
  },
};

// Weapons by role
const ROLE_WEAPONS = {
  tank: {
    plate: {
      60: [43910, 43911], // 1H weapon + shield
      70: [34740, 34741],
      80: [40610, 40611],
    },
    leather: {
      60: [43912, 43913], // Staff or dual wield
      70: [34742, 34743],
      80: [40612, 40613],
    },
  },
  melee_dps: {
    plate: {
      60: [43914], // 2H weapon
      70: [34744],
      80: [40614],
    },
    leather: {
      60: [43915, 43916], // Dual wield daggers/swords
      70: [34745, 34746],
      80: [40615, 40616],
    },
    mail: {
      60: [43917, 43918],
      70: [34747, 34748],
      80: [40617, 40618],
    },
  },
  ranged_physical: {
    mail: {
      60: [43919], // Bow/Gun
      70: [34749],
      80: [40619],
    },
  },
  caster_dps: {
    cloth: {
      60: [43920], // Staff
      70: [34750],
      80: [40620],
    },
    leather: {
      60: [43921],
      70: [34751],
      80: [40621],
    },
    mail: {
      60: [43922, 43923], // 1H + Shield or 1H + OH
      70: [34752, 34753],
      80: [40622, 40623],
    },
  },
  healer: {
    cloth: {
      60: [43924], // Staff or 1H + OH
      70: [34754],
      80: [40624],
    },
    leather: {
      60: [43925],
      70: [34755],
      80: [40625],
    },
    mail: {
      60: [43926, 43927],
      70: [34756, 34757],
      80: [40626, 40627],
    },
    plate: {
      60: [43928, 43929],
      70: [34758, 34759],
      80: [40628, 40629],
    },
  },
};

// Bags given with boost (16 slot bags)
const BOOST_BAGS = [
  14156, // Bottomless Bag (16 slot)
  14156,
  14156,
  14156,
];

// Gold given with boost (in copper)
const BOOST_GOLD = {
  60: 1000 * 100 * 100, // 1000 gold
  70: 2500 * 100 * 100, // 2500 gold
  80: 5000 * 100 * 100, // 5000 gold
};

// Mount items by faction
const BOOST_MOUNTS = {
  alliance: {
    60: 18776, // Swift Palomino
    70: 25473, // Swift Blue Gryphon
    80: 25473,
  },
  horde: {
    60: 18796, // Swift Brown Wolf
    70: 25531, // Swift Green Wind Rider
    80: 25531,
  },
};

// Alliance races
/**
 * @param race
 */
export function getFaction(race) {
  const allianceRaces = [1, 3, 4, 7, 11];
  return allianceRaces.includes(race) ? 'alliance' : 'horde';
}

// Get spec info by class and spec ID
/**
 * @param classId
 * @param specId
 */
export function getSpecInfo(classId, specId) {
  const specs = CLASS_SPECS[classId];
  if (!specs) return null;
  return specs.find((s) => s.id === specId) || specs[0];
}

// Get gear for a specific class, level, and spec
/**
 * @param classId
 * @param level
 * @param race
 * @param specId
 */
export function getBoostGear(classId, level, race, specId) {
  const specs = CLASS_SPECS[classId];
  if (!specs) return {items: [], bags: BOOST_BAGS, gold: 0, mount: null};

  const spec = specs.find((s) => s.id === specId) || specs[0];
  const role = spec.role;
  const armorType = getArmorType(classId);
  const faction = getFaction(race);

  const items = [];

  // Get armor pieces
  const roleGear = ROLE_GEAR[role];
  if (roleGear && roleGear[level]) {
    const armorGear = roleGear[level][armorType];
    if (armorGear) {
      items.push(...armorGear);
    }
  }

  // Get weapons
  const roleWeapons = ROLE_WEAPONS[role];
  if (roleWeapons && roleWeapons[armorType] && roleWeapons[armorType][level]) {
    items.push(...roleWeapons[armorType][level]);
  }

  return {
    items: items.filter((id) => id > 0), // Filter out placeholder 0s
    bags: BOOST_BAGS,
    gold: BOOST_GOLD[level] || 0,
    mount: BOOST_MOUNTS[faction][level],
    spec: spec,
  };
}

// Get base stats for boosted characters
/**
 * @param classId
 * @param level
 */
export function getBaseStats(classId, level) {
  const healthMultiplier = {
    1: 1.5, // Warrior
    2: 1.3, // Paladin
    3: 1.0, // Hunter
    4: 0.9, // Rogue
    5: 0.8, // Priest
    6: 1.4, // Death Knight
    7: 1.1, // Shaman
    8: 0.7, // Mage
    9: 0.8, // Warlock
    11: 1.0, // Druid
  };

  const baseHealth = {
    60: 4000,
    70: 8000,
    80: 15000,
  };

  const baseMana = {
    60: 4000,
    70: 8000,
    80: 15000,
  };

  return {
    health: Math.floor(baseHealth[level] * (healthMultiplier[classId] || 1)),
    mana: baseMana[level],
  };
}

export default {
  CLASS_NAMES,
  RACE_NAMES,
  CLASS_SPECS,
  getBoostGear,
  getBaseStats,
  getFaction,
  getSpecInfo,
};
