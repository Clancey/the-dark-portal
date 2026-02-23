/**
 * Gear Finder - Queries the database for appropriate boost gear
 * Based on mod-playerbots autogear stat weighting system
 */

// Stat type IDs from item_template
const STAT_TYPES = {
  MANA: 0,
  HEALTH: 1,
  AGILITY: 3,
  STRENGTH: 4,
  INTELLECT: 5,
  SPIRIT: 6,
  STAMINA: 7,
  DEFENSE_RATING: 12,
  DODGE_RATING: 13,
  PARRY_RATING: 14,
  BLOCK_RATING: 15,
  HIT_MELEE_RATING: 16,
  HIT_RANGED_RATING: 17,
  HIT_SPELL_RATING: 18,
  CRIT_MELEE_RATING: 19,
  CRIT_RANGED_RATING: 20,
  CRIT_SPELL_RATING: 21,
  HIT_RATING: 31,
  CRIT_RATING: 32,
  RESILIENCE_RATING: 35,
  HASTE_RATING: 36,
  EXPERTISE_RATING: 37,
  ATTACK_POWER: 38,
  RANGED_ATTACK_POWER: 39,
  SPELL_POWER: 45,
  MANA_REGEN: 43,
  ARMOR_PENETRATION: 44,
  SPELL_PENETRATION: 47,
  BLOCK_VALUE: 48,
};

// Stat weights by role (based on playerbots weightscale_data)
// Values normalized to 0-100 scale
const STAT_WEIGHTS = {
  tank: {
    [STAT_TYPES.STAMINA]: 100,
    [STAT_TYPES.DODGE_RATING]: 80,
    [STAT_TYPES.DEFENSE_RATING]: 75,
    [STAT_TYPES.PARRY_RATING]: 70,
    [STAT_TYPES.BLOCK_RATING]: 60,
    [STAT_TYPES.BLOCK_VALUE]: 50,
    [STAT_TYPES.STRENGTH]: 55,
    [STAT_TYPES.AGILITY]: 60,
    [STAT_TYPES.EXPERTISE_RATING]: 65,
    [STAT_TYPES.HIT_RATING]: 40,
    [STAT_TYPES.ARMOR_PENETRATION]: 20,
  },
  healer: {
    [STAT_TYPES.SPELL_POWER]: 100,
    [STAT_TYPES.INTELLECT]: 80,
    [STAT_TYPES.MANA_REGEN]: 85,
    [STAT_TYPES.SPIRIT]: 70,
    [STAT_TYPES.HASTE_RATING]: 60,
    [STAT_TYPES.CRIT_RATING]: 40,
    [STAT_TYPES.CRIT_SPELL_RATING]: 40,
    [STAT_TYPES.STAMINA]: 30,
  },
  caster_dps: {
    [STAT_TYPES.SPELL_POWER]: 100,
    [STAT_TYPES.HIT_RATING]: 90,
    [STAT_TYPES.HIT_SPELL_RATING]: 90,
    [STAT_TYPES.HASTE_RATING]: 70,
    [STAT_TYPES.CRIT_RATING]: 65,
    [STAT_TYPES.CRIT_SPELL_RATING]: 65,
    [STAT_TYPES.INTELLECT]: 50,
    [STAT_TYPES.SPIRIT]: 40,
    [STAT_TYPES.SPELL_PENETRATION]: 35,
    [STAT_TYPES.STAMINA]: 20,
  },
  melee_dps: {
    [STAT_TYPES.HIT_RATING]: 100,
    [STAT_TYPES.HIT_MELEE_RATING]: 100,
    [STAT_TYPES.STRENGTH]: 85,
    [STAT_TYPES.AGILITY]: 80,
    [STAT_TYPES.ARMOR_PENETRATION]: 75,
    [STAT_TYPES.EXPERTISE_RATING]: 80,
    [STAT_TYPES.CRIT_RATING]: 70,
    [STAT_TYPES.CRIT_MELEE_RATING]: 70,
    [STAT_TYPES.ATTACK_POWER]: 60,
    [STAT_TYPES.HASTE_RATING]: 55,
    [STAT_TYPES.STAMINA]: 25,
  },
  ranged_physical: {
    [STAT_TYPES.AGILITY]: 100,
    [STAT_TYPES.HIT_RATING]: 95,
    [STAT_TYPES.HIT_RANGED_RATING]: 95,
    [STAT_TYPES.ARMOR_PENETRATION]: 85,
    [STAT_TYPES.CRIT_RATING]: 80,
    [STAT_TYPES.CRIT_RANGED_RATING]: 80,
    [STAT_TYPES.RANGED_ATTACK_POWER]: 75,
    [STAT_TYPES.ATTACK_POWER]: 70,
    [STAT_TYPES.HASTE_RATING]: 60,
    [STAT_TYPES.INTELLECT]: 30,
    [STAT_TYPES.STAMINA]: 25,
  },
};

// Armor subclass by armor type
const ARMOR_SUBCLASS = {
  cloth: 1,
  leather: 2,
  mail: 3,
  plate: 4,
};

// Inventory types for armor slots
const ARMOR_SLOTS = {
  head: 1,
  neck: 2,
  shoulder: 3,
  chest: 5,
  waist: 6,
  legs: 7,
  feet: 8,
  wrist: 9,
  hands: 10,
  finger: 11,
  trinket: 12,
  back: 16,
};

// Item level ranges by boost level
const ITEM_LEVEL_RANGES = {
  60: {min: 55, max: 92},
  70: {min: 100, max: 141},
  80: {min: 170, max: 232},
};

// Required level ranges
const REQUIRED_LEVEL_RANGES = {
  60: {min: 55, max: 60},
  70: {min: 68, max: 70},
  80: {min: 76, max: 80},
};

// Get armor type for class
/**
 * @param classId
 */
function getArmorType(classId) {
  // Cloth: Mage(8), Priest(5), Warlock(9)
  if ([8, 5, 9].includes(classId)) return 'cloth';
  // Leather: Druid(11), Rogue(4)
  if ([11, 4].includes(classId)) return 'leather';
  // Mail: Hunter(3), Shaman(7)
  if ([3, 7].includes(classId)) return 'mail';
  // Plate: Warrior(1), Paladin(2), Death Knight(6)
  return 'plate';
}

/**
 * Calculate item score based on stats and role weights
 *
 * @param item
 * @param roleWeights
 */
function calculateItemScore(item, roleWeights) {
  let score = 0;

  // Score from stats (stat_type1-10, stat_value1-10)
  for (let i = 1; i <= 10; i++) {
    const statType = item[`stat_type${i}`];
    const statValue = item[`stat_value${i}`];
    if (statType && statValue) {
      const weight = roleWeights[statType] || 0;
      score += statValue * weight;
    }
  }

  // Bonus for item level
  score += (item.ItemLevel || 0) * 10;

  // Bonus for quality (green=2, blue=3, purple=4)
  score += (item.Quality || 0) * 100;

  // Bonus for armor value for tanks
  if (roleWeights[STAT_TYPES.STAMINA] >= 80) {
    score += (item.armor || 0) * 0.5;
  }

  return score;
}

/**
 * Find best gear for a character boost using stat-weighted scoring
 *
 * @param {Object} worldDb - Sequelize connection to world database
 * @param {number} classId - Character class ID
 * @param {number} targetLevel - Target level (60, 70, 80)
 * @param {string} role - Role type (tank, healer, melee_dps, caster_dps, ranged_physical)
 * @returns {Promise<number[]>} Array of item entry IDs
 */
async function findBoostGear(worldDb, classId, targetLevel, role) {
  const armorType = getArmorType(classId);
  const armorSubclass = ARMOR_SUBCLASS[armorType];
  const iLvlRange = ITEM_LEVEL_RANGES[targetLevel];
  const reqLvlRange = REQUIRED_LEVEL_RANGES[targetLevel];
  const roleWeights = STAT_WEIGHTS[role] || STAT_WEIGHTS.melee_dps;
  const items = [];

  // Query for each armor slot
  for (const [slotName, inventoryType] of Object.entries(ARMOR_SLOTS)) {
    try {
      // Skip cloth-only slots that use different item class
      const itemClass = 4; // Armor
      let subclassCondition = `subclass = ${armorSubclass}`;

      // Neck, finger, trinket use subclass 0
      if ([2, 11, 12].includes(inventoryType)) {
        subclassCondition = 'subclass = 0';
      }
      // Back (cloaks) are subclass 1
      if (inventoryType === 16) {
        subclassCondition = 'subclass = 1';
      }

      const [results] = await worldDb.query(`
        SELECT entry, name, ItemLevel, Quality, armor,
               stat_type1, stat_value1, stat_type2, stat_value2,
               stat_type3, stat_value3, stat_type4, stat_value4,
               stat_type5, stat_value5, stat_type6, stat_value6,
               stat_type7, stat_value7, stat_type8, stat_value8,
               stat_type9, stat_value9, stat_type10, stat_value10
        FROM item_template
        WHERE class = :itemClass
        AND ${subclassCondition}
        AND InventoryType = :invType
        AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
        AND ItemLevel BETWEEN :minILvl AND :maxILvl
        AND Quality >= 2
        AND Quality <= 4
        AND BuyPrice > 0
        AND (AllowableClass = -1 OR AllowableClass & :classMask > 0)
        ORDER BY ItemLevel DESC, Quality DESC
        LIMIT 20
      `, {
        replacements: {
          itemClass,
          invType: inventoryType,
          minReqLvl: reqLvlRange.min,
          maxReqLvl: reqLvlRange.max,
          minILvl: iLvlRange.min,
          maxILvl: iLvlRange.max,
          classMask: 1 << (classId - 1),
        },
        type: 'SELECT',
      });

      if (results.length > 0) {
        // Score all items and pick the best
        let bestItem = results[0];
        let bestScore = calculateItemScore(results[0], roleWeights);

        for (let i = 1; i < results.length; i++) {
          const score = calculateItemScore(results[i], roleWeights);
          if (score > bestScore) {
            bestScore = score;
            bestItem = results[i];
          }
        }

        items.push(bestItem.entry);

        // For rings and trinkets, get two
        if (inventoryType === 11 || inventoryType === 12) {
          // Find second best different item
          const secondBest = results.find((r) =>
            r.entry !== bestItem.entry &&
            calculateItemScore(r, roleWeights) > 0,
          );
          if (secondBest) {
            items.push(secondBest.entry);
          }
        }
      }
    } catch (e) {
      console.error(`Error finding ${slotName} gear:`, e.message);
    }
  }

  // Add weapons based on role
  const weapons = await findWeapons(worldDb, classId, targetLevel, role, roleWeights);
  items.push(...weapons);

  // Add bags
  const bags = await findBags(worldDb, targetLevel);
  items.push(...bags);

  return items;
}

/**
 * Find weapons for the role with stat-weighted scoring
 *
 * @param worldDb
 * @param classId
 * @param targetLevel
 * @param role
 * @param roleWeights
 */
async function findWeapons(worldDb, classId, targetLevel, role, roleWeights) {
  const iLvlRange = ITEM_LEVEL_RANGES[targetLevel];
  const reqLvlRange = REQUIRED_LEVEL_RANGES[targetLevel];
  const weapons = [];

  try {
    if (role === 'tank') {
      // 1H weapon + shield for plate tanks
      // Staff for druid tanks
      const armorType = getArmorType(classId);
      if (armorType === 'leather') {
        // Druid tank - staff
        const [staff] = await worldDb.query(`
          SELECT entry, name, ItemLevel, Quality,
                 stat_type1, stat_value1, stat_type2, stat_value2,
                 stat_type3, stat_value3, stat_type4, stat_value4,
                 stat_type5, stat_value5
          FROM item_template
          WHERE class = 2 AND subclass = 10
          AND InventoryType = 17
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 5
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
          },
          type: 'SELECT',
        });
        if (staff.length > 0) {
          let best = staff[0];
          let bestScore = calculateItemScore(staff[0], roleWeights);
          for (const s of staff) {
            const score = calculateItemScore(s, roleWeights);
            if (score > bestScore) {
              bestScore = score;
              best = s;
            }
          }
          weapons.push(best.entry);
        }
      } else {
        // Plate/mail tank - 1H + shield
        const [weapon] = await worldDb.query(`
          SELECT entry FROM item_template
          WHERE class = 2
          AND InventoryType IN (13, 21)
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          AND (AllowableClass = -1 OR AllowableClass & :classMask > 0)
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 1
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
            classMask: 1 << (classId - 1),
          },
          type: 'SELECT',
        });
        if (weapon.length > 0) weapons.push(weapon[0].entry);

        // Shield
        const [shield] = await worldDb.query(`
          SELECT entry FROM item_template
          WHERE class = 4 AND subclass = 6
          AND InventoryType = 14
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 1
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
          },
          type: 'SELECT',
        });
        if (shield.length > 0) weapons.push(shield[0].entry);
      }
    } else if (role === 'caster_dps' || role === 'healer') {
      // Staff or 1H + offhand
      const [staff] = await worldDb.query(`
        SELECT entry, name, ItemLevel, Quality,
               stat_type1, stat_value1, stat_type2, stat_value2,
               stat_type3, stat_value3, stat_type4, stat_value4,
               stat_type5, stat_value5
        FROM item_template
        WHERE class = 2 AND subclass = 10
        AND InventoryType = 17
        AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
        AND ItemLevel BETWEEN :minILvl AND :maxILvl
        AND Quality >= 2
        ORDER BY ItemLevel DESC, Quality DESC
        LIMIT 5
      `, {
        replacements: {
          minReqLvl: reqLvlRange.min,
          maxReqLvl: reqLvlRange.max,
          minILvl: iLvlRange.min,
          maxILvl: iLvlRange.max,
        },
        type: 'SELECT',
      });
      if (staff.length > 0) {
        let best = staff[0];
        let bestScore = calculateItemScore(staff[0], roleWeights);
        for (const s of staff) {
          const score = calculateItemScore(s, roleWeights);
          if (score > bestScore) {
            bestScore = score;
            best = s;
          }
        }
        weapons.push(best.entry);
      }
    } else if (role === 'ranged_physical') {
      // Hunter - Bow, Gun, or Crossbow
      const [ranged] = await worldDb.query(`
        SELECT entry FROM item_template
        WHERE class = 2 AND subclass IN (2, 3, 18)
        AND InventoryType = 15
        AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
        AND ItemLevel BETWEEN :minILvl AND :maxILvl
        AND Quality >= 2
        ORDER BY ItemLevel DESC, Quality DESC
        LIMIT 1
      `, {
        replacements: {
          minReqLvl: reqLvlRange.min,
          maxReqLvl: reqLvlRange.max,
          minILvl: iLvlRange.min,
          maxILvl: iLvlRange.max,
        },
        type: 'SELECT',
      });
      if (ranged.length > 0) weapons.push(ranged[0].entry);

      // Also a melee weapon (polearm/staff) for stat stick
      const [melee] = await worldDb.query(`
        SELECT entry FROM item_template
        WHERE class = 2
        AND InventoryType = 17
        AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
        AND ItemLevel BETWEEN :minILvl AND :maxILvl
        AND Quality >= 2
        ORDER BY ItemLevel DESC, Quality DESC
        LIMIT 1
      `, {
        replacements: {
          minReqLvl: reqLvlRange.min,
          maxReqLvl: reqLvlRange.max,
          minILvl: iLvlRange.min,
          maxILvl: iLvlRange.max,
        },
        type: 'SELECT',
      });
      if (melee.length > 0) weapons.push(melee[0].entry);
    } else {
      // Melee DPS - 2H weapon or dual wield
      // For rogues, prefer dual wield
      if (classId === 4) {
        // Rogue - daggers/swords
        const [mainHand] = await worldDb.query(`
          SELECT entry FROM item_template
          WHERE class = 2 AND subclass IN (7, 15)
          AND InventoryType = 13
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 1
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
          },
          type: 'SELECT',
        });
        if (mainHand.length > 0) weapons.push(mainHand[0].entry);

        const [offHand] = await worldDb.query(`
          SELECT entry FROM item_template
          WHERE class = 2 AND subclass IN (7, 15)
          AND InventoryType IN (13, 22)
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 1
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
          },
          type: 'SELECT',
        });
        if (offHand.length > 0) weapons.push(offHand[0].entry);
      } else {
        // Other melee - 2H weapon
        const [twoHand] = await worldDb.query(`
          SELECT entry FROM item_template
          WHERE class = 2
          AND InventoryType = 17
          AND RequiredLevel BETWEEN :minReqLvl AND :maxReqLvl
          AND ItemLevel BETWEEN :minILvl AND :maxILvl
          AND Quality >= 2
          AND (AllowableClass = -1 OR AllowableClass & :classMask > 0)
          ORDER BY ItemLevel DESC, Quality DESC
          LIMIT 1
        `, {
          replacements: {
            minReqLvl: reqLvlRange.min,
            maxReqLvl: reqLvlRange.max,
            minILvl: iLvlRange.min,
            maxILvl: iLvlRange.max,
            classMask: 1 << (classId - 1),
          },
          type: 'SELECT',
        });
        if (twoHand.length > 0) weapons.push(twoHand[0].entry);
      }
    }
  } catch (e) {
    console.error('Error finding weapons:', e.message);
  }

  return weapons;
}

/**
 * Find bags
 *
 * @param worldDb
 * @param targetLevel
 */
async function findBags(worldDb, targetLevel) {
  const bags = [];
  const bagSize = targetLevel >= 70 ? 18 : 14;

  try {
    const [bag] = await worldDb.query(`
      SELECT entry FROM item_template
      WHERE class = 1 AND subclass = 0
      AND ContainerSlots >= :bagSize
      AND ContainerSlots <= 20
      AND Quality <= 2
      AND BuyPrice > 0
      ORDER BY ContainerSlots ASC, BuyPrice ASC
      LIMIT 1
    `, {
      replacements: {bagSize},
      type: 'SELECT',
    });

    if (bag.length > 0) {
      // Give 4 bags
      bags.push(bag[0].entry, bag[0].entry, bag[0].entry, bag[0].entry);
    }
  } catch (e) {
    console.error('Error finding bags:', e.message);
  }

  return bags;
}

/**
 * Find mount for faction
 *
 * @param worldDb
 * @param faction
 * @param targetLevel
 */
async function findMount(worldDb, faction, targetLevel) {
  try {
    // Known mount item IDs for each faction
    const mounts = {
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
    return mounts[faction][targetLevel] || mounts[faction][60];
  } catch (e) {
    return null;
  }
}

export {
  findBoostGear,
  findWeapons,
  findBags,
  findMount,
  getArmorType,
  STAT_TYPES,
  STAT_WEIGHTS,
};
