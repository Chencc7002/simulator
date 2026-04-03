const roleDefaults = {
  tank: { manaPerAttack: 5, manaRegenPerSecond: 0, castTime: 1, manaLock: 0.5 },
  fighter: { manaPerAttack: 10, manaRegenPerSecond: 0, castTime: 1, manaLock: 0.5 },
  caster: { manaPerAttack: 7, manaRegenPerSecond: 2, castTime: 1, manaLock: 0.5 },
  marksman: { manaPerAttack: 10, manaRegenPerSecond: 0, castTime: 1, manaLock: 0.5 },
  assassin: { manaPerAttack: 10, manaRegenPerSecond: 0, castTime: 1, manaLock: 0.5 },
};
const simDefaults = {
  canCastAfterAutoProgress: 0.3,
  requiresAttackBetweenCasts: false,
  projectileDelay: 0,
  tickInterval: null,
};
const targetPresets = {
  standard_frontline: { name: "\u6807\u51c6\u524d\u6392", hp: 1800, armor: 100, mr: 100 },
  squishy: { name: "\u8106\u76ae", hp: 1200, armor: 45, mr: 45 },
  heavy_tank: { name: "\u91cd\u5766", hp: 2800, armor: 160, mr: 160 },
};
const heroes = [
  {
    id: "ahri",
    name: "\u963f\u72f8",
    cost: 2,
    role: "caster",
    traits: ["Astral", "Invoker"],
    base: {
      hp: [650, 1170, 2106],
      ad: [30, 45, 68],
      as: 0.8,
      armor: 20,
      mr: 20,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 0,
      manaMax: 30,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u7075\u706b",
      type: "magic",
      baseValues: { damage: [130, 195, 310] },
      scalings: { apRatio: 0.85 },
      spellCrit: false,
      description: "Launches fox-fire bolts that deal magic damage.",
    },
  },
  {
    id: "shen",
    name: "\u614e",
    cost: 5,
    role: "tank",
    traits: ["Duskwall", "Bastion"],
    base: {
      hp: [1300, 2340, 4212],
      ad: [50, 75, 113],
      as: 0.95,
      armor: 75,
      mr: 75,
      range: 1,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 10,
      manaMax: 70,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u73b0\u5b9e\u6495\u88c2",
      type: "magic",
      baseValues: { damage: [329, 487, 3793], shield: [329, 487, 3793] },
      scalings: { apRatio: 0.55, healthRatio: 0.08 },
      spellCrit: false,
      description: "Leaps into the enemy cluster, deals magic damage, and gains a shield.",
    },
  },
  {
    id: "samira",
    name: "\u838e\u5f25\u62c9",
    cost: 4,
    role: "marksman",
    traits: ["Gunslinger", "Breaker"],
    base: {
      hp: [900, 1620, 2916],
      ad: [72, 108, 162],
      as: 0.85,
      armor: 45,
      mr: 45,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 15,
      manaMax: 70,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u98ce\u683c\u5f39\u5e55",
      type: "physical",
      baseValues: { damage: [220, 330, 520] },
      scalings: { adRatio: 1.8 },
      spellCrit: false,
      description: "Dashes and unloads multiple physical shots into the current target.",
    },
    override: {
      requiresAttackBetweenCasts: true,
    },
  },
  {
    id: "ashe",
    name: "\u827e\u5e0c",
    cost: 3,
    role: "marksman",
    traits: ["Aurora", "Sniper"],
    base: {
      hp: [700, 1260, 2268],
      ad: [56, 84, 126],
      as: 0.78,
      armor: 30,
      mr: 30,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 10,
      manaMax: 60,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u51b0\u971c\u9f50\u5c04",
      type: "physical",
      baseValues: { damage: [145, 218, 340] },
      scalings: { adRatio: 1.25 },
      spellCrit: false,
      description: "Empowers follow-up attacks to deal bonus physical damage.",
    },
  },
  {
    id: "vex",
    name: "\u8587\u53e4\u4e1d",
    cost: 3,
    role: "caster",
    traits: ["Shade", "Sorcerer"],
    base: {
      hp: [720, 1296, 2333],
      ad: [40, 60, 90],
      as: 0.75,
      armor: 30,
      mr: 30,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 0,
      manaMax: 40,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u9634\u90c1\u7206\u88c2",
      type: "magic",
      baseValues: { damage: [190, 285, 450] },
      scalings: { apRatio: 0.95 },
      spellCrit: false,
      description: "Detonates gloom energy in a dense area for magic damage.",
    },
  },
  {
    id: "seraphine",
    name: "\u8428\u52d2\u82ac\u59ae",
    cost: 2,
    role: "caster",
    traits: ["Resonance", "Astral"],
    base: {
      hp: [620, 1116, 2009],
      ad: [25, 38, 56],
      as: 0.75,
      armor: 20,
      mr: 20,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 0,
      manaMax: 30,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u56de\u54cd\u8282\u62cd",
      type: "magic",
      baseValues: { damage: [120, 180, 280] },
      scalings: { apRatio: 0.8 },
      spellCrit: false,
      description: "Releases a wave that deals magic damage and boosts later casts.",
    },
  },
  {
    id: "darius",
    name: "\u5fb7\u83b1\u5384\u65af",
    cost: 2,
    role: "fighter",
    traits: ["Ironblood", "Bruiser"],
    base: {
      hp: [780, 1404, 2527],
      ad: [60, 90, 135],
      as: 0.75,
      armor: 45,
      mr: 45,
      range: 1,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 20,
      manaMax: 70,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u65ad\u5934\u53f0",
      type: "physical",
      baseValues: { damage: [180, 270, 430] },
      scalings: { adRatio: 1.5 },
      spellCrit: false,
      description: "Swings through the target and deals high physical damage.",
    },
  },
  {
    id: "jhin",
    name: "\u70ec",
    cost: 4,
    role: "marksman",
    traits: ["Reaper", "Sniper"],
    base: {
      hp: [820, 1476, 2656],
      ad: [68, 102, 153],
      as: 0.74,
      armor: 35,
      mr: 35,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 0,
      manaMax: 55,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u5b8c\u7f8e\u8c22\u5e55",
      type: "physical",
      baseValues: { damage: [210, 315, 500] },
      scalings: { adRatio: 1.65 },
      spellCrit: false,
      description: "Loads an empowered shot that deals extra physical damage.",
    },
  },
  {
    id: "illaoi",
    name: "\u4fc4\u6d1b\u4f0a",
    cost: 3,
    role: "tank",
    traits: ["Abyss", "Bastion"],
    base: {
      hp: [980, 1764, 3175],
      ad: [55, 83, 124],
      as: 0.7,
      armor: 55,
      mr: 55,
      range: 1,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 30,
      manaMax: 80,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u89e6\u624b\u98ce\u66b4",
      type: "magic",
      baseValues: { damage: [150, 225, 350], shield: [250, 375, 600] },
      scalings: { apRatio: 0.7, healthRatio: 0.06 },
      spellCrit: false,
      description: "Slams the ground for magic damage and gains a shield.",
    },
  },
  {
    id: "ziggs",
    name: "\u5409\u683c\u65af",
    cost: 1,
    role: "caster",
    traits: ["Boom", "Mechanic"],
    base: {
      hp: [540, 972, 1749],
      ad: [20, 30, 45],
      as: 0.75,
      armor: 15,
      mr: 15,
      range: 4,
      critChance: 0.25,
      critDamage: 1.4,
      manaStart: 0,
      manaMax: 30,
      apBase: 1,
      damageAmpBase: 1,
    },
    ability: {
      name: "\u5f39\u8df3\u70b8\u5f39",
      type: "magic",
      baseValues: { damage: [100, 150, 235] },
      scalings: { apRatio: 0.78 },
      spellCrit: false,
      description: "Throws a bomb that explodes for area magic damage.",
    },
  },
];

const makeExtra = (id, name, category, order, config) => ({
  id,
  name,
  category,
  order,
  flatStats: {},
  hooks: {},
  notes: "",
  ...config,
});
const categories = [
  { id: "craftable", label: "\u53ef\u5408\u6210" },
  { id: "artifact", label: "\u5965\u672f\u88c5\u5907" },
  { id: "radiant", label: "\u5149\u660e\u88c5\u5907" },
  { id: "emblem", label: "\u7eb9\u7ae0" },
  { id: "trait", label: "\u7f81\u7eca" },
  { id: "buff", label: "\u5f3a\u5316\u7b26\u6587/Buff" },
];
const extras = [
  makeExtra("rabadon", "Rabadon's Deathcap", "craftable", 43, { flatStats: { apFlat: 0.7 } }),
  makeExtra("archangel", "Archangel's Staff", "craftable", 5, {
    flatStats: { apFlat: 0.25 },
    hooks: { perSecondAp: 0.025, maxPerSecondAp: 0.5 },
  }),
  makeExtra("jeweled-gauntlet", "Jeweled Gauntlet", "craftable", 30, {
    flatStats: { apFlat: 0.35, critChance: 0.25 },
    hooks: { enableSpellCrit: true },
  }),
  makeExtra("giant-slayer", "Giant Slayer", "craftable", 18, {
    flatStats: { adFlat: 12, apFlat: 0.15 },
    hooks: { conditionalDamageAmp: { targetHpAtLeast: 1600, amp: 0.22 } },
  }),
  makeExtra("void-staff", "Void Staff", "craftable", 76, {
    flatStats: { apFlat: 0.15, manaRegen: 3 },
    hooks: { magicPenFlat: 35 },
  }),
  makeExtra("shojin", "Spear of Shojin", "craftable", 67, {
    flatStats: { adFlat: 15, manaRegen: 1 },
    hooks: { bonusManaOnAttack: 5 },
  }),
  makeExtra("guinsoo", "Guinsoo's Rageblade", "craftable", 22, {
    flatStats: { asFlat: 0.12 },
    hooks: { attackSpeedPerAttack: 0.035, attackSpeedCapBonus: 1.15 },
  }),
  makeExtra("giant-slayer-lite", "Giant Slayer (no Giant)", "craftable", 19, {
    flatStats: { adFlat: 12, apFlat: 0.15 },
  }),
  makeExtra("tacticians-crown", "Tactician's Crown", "craftable", 71, {
    flatStats: { apFlat: 0.25, asFlat: 0.15, damageAmp: 0.08 },
  }),
  makeExtra("hand-of-justice", "Hand of Justice", "craftable", 25, {
    flatStats: { critChance: 0.2, apFlat: 0.15, adFlat: 10 },
    hooks: { conditionalDamageAmp: { targetHpAtLeast: 0, amp: 0.12 } },
  }),
  makeExtra("deaths-defiance", "Death's Defiance", "artifact", 3, {
    flatStats: { adFlat: 24, asFlat: 0.18 },
    hooks: { onHitTrueBonus: 12 },
  }),
  makeExtra("lich-bane", "Lich Bane", "artifact", 7, {
    flatStats: { apFlat: 0.35 },
    hooks: { afterCastBonusMagic: 80 },
  }),
  makeExtra("snipers-focus", "Sniper's Focus", "artifact", 12, {
    flatStats: { adFlat: 18, critChance: 0.2, damageAmp: 0.1 },
  }),
  makeExtra("eternal-whisper", "Eternal Whisper", "artifact", 16, {
    flatStats: { apFlat: 0.3, manaRegen: 2 },
    hooks: { magicPenFlat: 20, perSecondAp: 0.015, maxPerSecondAp: 0.3 },
  }),
  makeExtra("rabadon-radiant", "Radiant Deathcap", "radiant", 9, {
    flatStats: { apFlat: 1.1, damageAmp: 0.08 },
  }),
  makeExtra("shojin-radiant", "Radiant Shojin", "radiant", 14, {
    flatStats: { adFlat: 20, manaRegen: 3 },
    hooks: { bonusManaOnAttack: 8 },
  }),
  makeExtra("guinsoo-radiant", "Radiant Rageblade", "radiant", 18, {
    flatStats: { asFlat: 0.22, damageAmp: 0.05 },
    hooks: { attackSpeedPerAttack: 0.05, attackSpeedCapBonus: 1.4 },
  }),
  makeExtra("jg-radiant", "Radiant Jeweled Gauntlet", "radiant", 24, {
    flatStats: { apFlat: 0.5, critChance: 0.35 },
    hooks: { enableSpellCrit: true, bonusSpellCritDamage: 0.15 },
  }),
  makeExtra("bastion-emblem", "Bastion Emblem", "emblem", 2, { flatStats: { armorFlat: 25, mrFlat: 25 } }),
  makeExtra("sorcerer-emblem", "Sorcerer Emblem", "emblem", 8, { flatStats: { apFlat: 0.3 } }),
  makeExtra("marksman-emblem", "Marksman Emblem", "emblem", 11, {
    flatStats: { adFlat: 12, critChance: 0.15 },
  }),
  makeExtra("fighter-emblem", "Fighter Emblem", "emblem", 15, { flatStats: { hpFlat: 180, adFlat: 10 } }),
  makeExtra("chrono-emblem", "Chrono Emblem", "emblem", 20, { flatStats: { asFlat: 0.15, manaRegen: 1 } }),
  makeExtra("trait-bastion-4", "Bastion 4", "trait", 4, { flatStats: { armorFlat: 35, mrFlat: 35 }, traitKey: "bastion" }),
  makeExtra("trait-sorcerer-4", "Sorcerer 4", "trait", 6, { flatStats: { apFlat: 0.45 }, traitKey: "sorcerer" }),
  makeExtra("trait-sniper-2", "Sniper 2", "trait", 10, { flatStats: { damageAmp: 0.12 }, traitKey: "sniper" }),
  makeExtra("trait-vanguard-4", "Vanguard 4", "trait", 13, { flatStats: { hpFlat: 260, armorFlat: 20 }, traitKey: "vanguard" }),
  makeExtra("trait-arcane-3", "Arcane 3", "trait", 21, { flatStats: { manaRegen: 2, apFlat: 0.18 }, traitKey: "arcane" }),
  makeExtra("buff-blue", "Blue Buff", "buff", 1, { flatStats: { manaRegen: 3, apFlat: 0.15 } }),
  makeExtra("buff-red", "Red Buff", "buff", 5, { flatStats: { damageAmp: 0.14, adFlat: 8 } }),
  makeExtra("buff-gold", "Gold Buff", "buff", 7, { flatStats: { apFlat: 0.2, hpFlat: 180, manaRegen: 1 } }),
  makeExtra("buff-purple", "Prismatic Buff", "buff", 12, {
    flatStats: { critChance: 0.2, critDamage: 0.2, damageAmp: 0.05 },
  }),
  makeExtra("buff-green", "Green Buff", "buff", 14, { flatStats: { hpFlat: 320, apFlat: 0.1 } }),
];



const DAMAGE_COLORS = {
  physical: "#e55645",
  magic: "#37acd8",
  true: "#d5dde7",
  bonus: "#f3cb63",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function valueAtStar(value, index) {
  if (Array.isArray(value)) return value[index] ?? value[0] ?? 0;
  return value ?? 0;
}

function mitigation(rawDamage, resistance) {
  return rawDamage * (100 / (100 + Math.max(0, resistance)));
}

function buildScaledDamagePacket(packet, combatStats, targetState, starLevel, fallbackType = "magic") {
  if (!packet) return { damage: 0, type: fallbackType };

  const starIndex = clamp(starLevel - 1, 0, 2);
  const baseDamage = valueAtStar(packet.damage ?? 0, starIndex);
  const apRatio = packet.apRatio ?? 0;
  const adRatio = packet.adRatio ?? 0;
  const healthRatio = packet.healthRatio ?? 0;
  const bonusAp = Math.max(0, combatStats.ap - 1);

  let rawDamage = baseDamage + baseDamage * apRatio * bonusAp + combatStats.ad * adRatio + combatStats.hp * healthRatio;
  rawDamage *= combatStats.damageAmp * (packet.multiplier ?? 1);

  const packetType = packet.type ?? fallbackType;
  let postMitigationDamage = rawDamage;
  let resolvedType = packetType;

  if (packetType === "magic") {
    postMitigationDamage = mitigation(rawDamage, targetState.mr);
    resolvedType = "magic";
  } else if (packetType === "physical") {
    postMitigationDamage = mitigation(rawDamage, targetState.armor);
    resolvedType = "physical";
  } else if (packetType === "mixed") {
    postMitigationDamage = mitigation(rawDamage * 0.55, targetState.mr) + mitigation(rawDamage * 0.45, targetState.armor);
    resolvedType = "bonus";
  } else if (packetType === "true") {
    postMitigationDamage = rawDamage;
    resolvedType = "true";
  }

  if (packet.spellSource && combatStats.spellCrit && resolvedType !== "true" && combatStats.critChance > 0) {
    postMitigationDamage *= 1 + combatStats.critChance * (combatStats.critDamage - 1);
  }

  return { damage: postMitigationDamage, type: resolvedType };
}

function buildHeroState(hero, starLevel, extra, target) {
  const starIndex = clamp(starLevel - 1, 0, 2);
  const baseRole = roleDefaults[hero.role];
  const override = hero.override ?? {};
  const stats = {
    hp: hero.base.hp[starIndex],
    ad: hero.base.ad[starIndex],
    baseAs: hero.base.as,
    as: hero.base.as,
    armor: hero.base.armor,
    mr: hero.base.mr,
    range: hero.base.range,
    critChance: hero.base.critChance,
    critDamage: hero.base.critDamage,
    manaStart: hero.base.manaStart,
    manaMax: hero.base.manaMax,
    ap: hero.base.apBase,
    damageAmp: hero.base.damageAmpBase,
    manaPerAttack: baseRole.manaPerAttack,
    manaRegenPerSecond: baseRole.manaRegenPerSecond,
    castTime: baseRole.castTime,
    manaLock: baseRole.manaLock,
    spellCrit: hero.ability.spellCrit,
    canCastAfterAutoProgress: simDefaults.canCastAfterAutoProgress,
    requiresAttackBetweenCasts: simDefaults.requiresAttackBetweenCasts,
    manaGainMultiplier: 1,
    special: hero.special ?? null,
  };

  if (override.requiresAttackBetweenCasts !== undefined) {
    stats.requiresAttackBetweenCasts = override.requiresAttackBetweenCasts;
  }

  if (stats.special?.castTimeOverride !== undefined) {
    stats.castTime = stats.special.castTimeOverride;
  }

  if (stats.special?.manaLockOverride !== undefined) {
    stats.manaLock = stats.special.manaLockOverride;
  }

  if (extra) {
    const flat = extra.flatStats ?? {};
    stats.hp += flat.hpFlat ?? 0;
    stats.ad = stats.ad * (1 + (flat.adPercent ?? 0)) + (flat.adFlat ?? 0);
    stats.as = stats.as * (1 + (flat.asPercent ?? 0)) + (flat.asFlat ?? 0);
    stats.armor += flat.armorFlat ?? 0;
    stats.mr += flat.mrFlat ?? 0;
    stats.critChance += flat.critChance ?? 0;
    stats.critDamage += flat.critDamage ?? 0;
    stats.ap += flat.apFlat ?? 0;
    stats.damageAmp += flat.damageAmp ?? 0;
    stats.manaPerAttack += flat.manaPerAttack ?? 0;
    stats.manaRegenPerSecond += flat.manaRegen ?? 0;
  }

  if (extra?.hooks?.enableSpellCrit) {
    if (stats.spellCrit && extra?.hooks?.precisionCritDamageBonus) {
      stats.critDamage += extra.hooks.precisionCritDamageBonus;
    }
    stats.spellCrit = true;
  }
  if (extra?.hooks?.bonusSpellCritDamage) stats.critDamage += extra.hooks.bonusSpellCritDamage;
  if (extra?.hooks?.manaGainMultiplier) stats.manaGainMultiplier += extra.hooks.manaGainMultiplier;
  if (extra?.hooks?.backlineAdApPercent && !["tank", "fighter"].includes(hero.role)) {
    stats.ad *= 1 + extra.hooks.backlineAdApPercent;
    stats.ap += extra.hooks.backlineAdApPercent;
  }

  if (stats.special?.fixedAttackSpeed) {
    const fixedAttackSpeed = valueAtStar(stats.special.fixedAttackSpeed, starIndex);
    stats.attackSpeedSource = stats.as;
    stats.as = fixedAttackSpeed;
  }

  stats.critChance = clamp(stats.critChance, 0, 1);
  stats.critDamage = clamp(stats.critDamage, 1, 3.5);
  stats.as = clamp(stats.as, 0.35, 2.5 + (extra?.hooks?.attackSpeedCapBonus ?? 0));

  const targetState = {
    hp: target.hp,
    baseHp: target.hp,
    baseArmor: target.armor,
    baseMr: target.mr,
  };

  if (extra?.hooks?.conditionalDamageAmp && target.hp >= extra.hooks.conditionalDamageAmp.targetHpAtLeast) {
    stats.damageAmp += extra.hooks.conditionalDamageAmp.amp;
  }

  stats.apStaticBase = stats.ap;

  return { stats, targetState };
}

function buildSpellDamage(hero, combatStats, targetState, starLevel, specialState = null) {
  const starIndex = clamp(starLevel - 1, 0, 2);
  const shieldValue = hero.ability.baseValues.shield ?? 0;
  let packet = {
    damage: hero.ability.baseValues.damage ?? 0,
    apRatio: hero.ability.scalings.apRatio ?? 0,
    adRatio: hero.ability.scalings.adRatio ?? 0,
    healthRatio: hero.ability.scalings.healthRatio ?? 0,
    type: hero.ability.type,
  };

  if (hero.special?.spellCycle) {
    const cycleLength = valueAtStar(hero.special.spellCycle.cycleLength, starIndex);
    const currentCastCount = specialState?.castCount ?? 0;
    if (cycleLength > 0 && currentCastCount > 0 && currentCastCount % cycleLength === 0) {
      packet = {
        ...packet,
        damage: hero.special.spellCycle.alternateDamage,
        type: hero.special.spellCycle.type ?? packet.type,
      };
    }
  }

  if (hero.special?.shenPassive) {
    const nextCastCount = Math.max(1, specialState?.castCount ?? 0);
    packet = {
      damage: hero.special.shenPassive.bonusDamage.map((value) => value * nextCastCount),
      apRatio: hero.ability.scalings.apRatio ?? 0,
      adRatio: 0,
      healthRatio: 0,
      type: nextCastCount >= hero.special.shenPassive.trueAfterCastCount ? "true" : "magic",
    };
  }

  if (hero.special?.cloneAfterEachCast) {
    packet = { damage: [0, 0, 0], apRatio: 0, adRatio: 0, healthRatio: 0, type: "bonus" };
  }

  const scaled = buildScaledDamagePacket(packet, combatStats, targetState, starLevel, hero.ability.type);

  let spellCritMultiplier = 1;
  if (combatStats.spellCrit && combatStats.critChance > 0) {
    spellCritMultiplier += combatStats.critChance * (combatStats.critDamage - 1);
  }

  return {
    damage: scaled.damage * spellCritMultiplier,
    type: scaled.type,
    shield: valueAtStar(shieldValue, starIndex) + combatStats.hp * (packet.healthRatio ?? 0),
  };
}

function buildAutoDamage(combatStats, targetState) {
  const critMultiplier = 1 + combatStats.critChance * (combatStats.critDamage - 1);
  const rawPhysical = combatStats.ad * critMultiplier * combatStats.damageAmp * (combatStats.autoDamageMultiplier ?? 1);
  return mitigation(rawPhysical, targetState.armor);
}

function buildCombatStats(baseStats, dynamicState) {
  let convertedAd = 0;
  let computedAs = clamp(baseStats.as + dynamicState.asFlat + (dynamicState.temporaryAsFlat ?? 0), 0.35, 2.5 + dynamicState.attackSpeedCapBonus);

  if (baseStats.special?.fixedAttackSpeed) {
    const sourceAs = (baseStats.attackSpeedSource ?? baseStats.as) + dynamicState.asFlat + (dynamicState.temporaryAsFlat ?? 0);
    const fixedAs = baseStats.as;
    const bonusAs = Math.max(0, sourceAs - fixedAs);
    convertedAd = bonusAs * (baseStats.special.attackSpeedToAdFactor ?? 0);
    computedAs = fixedAs;
  }

  return {
    hp: baseStats.hp,
    ad: baseStats.ad * (1 + dynamicState.adPercent) + convertedAd,
    ap: baseStats.ap + dynamicState.apFlat,
    as: computedAs,
      critChance: baseStats.critChance,
      critDamage: baseStats.critDamage,
      damageAmp: baseStats.damageAmp + dynamicState.damageAmp,
      spellCrit: baseStats.spellCrit,
      autoDamageMultiplier: baseStats.special?.autoDamageMultiplier
        ? valueAtStar(baseStats.special.autoDamageMultiplier, dynamicState.starIndex ?? 0)
        : 1,
    };
}

function buildCurrentTargetState(baseTargetState, extra, dynamicState) {
  let armor = baseTargetState.baseArmor;
  let mr = baseTargetState.baseMr;

  if (extra?.hooks?.magicPenFlat) {
    mr = Math.max(0, mr - extra.hooks.magicPenFlat);
  }

  if (timeWithin(dynamicState.mrShredUntil, dynamicState.timeCursor)) {
    mr = Math.max(0, mr * (1 - dynamicState.mrShredPercent));
  }

  if (timeWithin(dynamicState.armorShredUntil, dynamicState.timeCursor)) {
    armor = Math.max(0, armor * (1 - dynamicState.armorShredPercent));
  }

  return {
    hp: baseTargetState.hp,
    armor,
    mr,
  };
}

function timeWithin(until, currentTime) {
  return until !== null && until > currentTime;
}

function pushEvent(results, currentTime, damage, type, currentAs, manaState, sourceLabel) {
  results.totalDamage += damage;
  results.damageByType[type] = (results.damageByType[type] ?? 0) + damage;
  results.timeline.push({
    time: round(currentTime),
    cumulativeDamage: round(results.totalDamage),
  });
  results.eventLog.push({
    time: round(currentTime),
    damage: round(damage),
    type,
    attackSpeed: round(currentAs, 2),
    manaState,
    source: sourceLabel,
  });
}

function findDamageAtMark(timeline, mark) {
  const point = [...timeline].reverse().find((entry) => entry.time <= mark);
  return point?.cumulativeDamage ?? 0;
}
function simulateComparison({ hero, starLevel, extra, baselineExtra = null, target, duration = 25 }) {
  const baseline = simulateSingle({ hero, starLevel, extra: baselineExtra, target, duration });
  const candidate = simulateSingle({ hero, starLevel, extra, target, duration });

  candidate.summary.extraOutput25 =
    baseline.summary.damageAt25 > 0 ? round(candidate.summary.damageAt25 / baseline.summary.damageAt25, 2) : 0;

  return { baseline, candidate };
}
function simulateSingle({ hero, starLevel, extra, target, duration = 25 }) {
  const { stats, targetState } = buildHeroState(hero, starLevel, extra, target);
  const results = {
    totalDamage: 0,
    damageByType: { physical: 0, magic: 0, true: 0, bonus: 0 },
    timeline: [{ time: 0, cumulativeDamage: 0 }],
    eventLog: [],
    summary: {},
  };

  const dt = 0.05;
  const starIndex = clamp(starLevel - 1, 0, 2);
  let time = 0;
  let mana = stats.manaStart;
  let attackProgress = 0;
  let manaLockedUntil = 0;
  let castEndTime = null;
  let pendingSpellEmpower = 0;
  let empoweredAttacksRemaining = 0;
  let attacksSinceCast = 99;
  let burnState = null;
  const pendingDamageEvents = [];
  const critAmpInstances = [];
  const dynamicState = {
    starIndex,
    adPercent: 0,
    apFlat: 0,
    asFlat: 0,
    temporaryAsFlat: 0,
    temporaryAsUntil: null,
    damageAmp: 0,
    armorShredUntil: null,
    armorShredPercent: 0,
    mrShredUntil: null,
    mrShredPercent: 0,
    attackSpeedCapBonus: extra?.hooks?.attackSpeedCapBonus ?? 0,
    titanStacks: 0,
    krakenStacks: 0,
    timeCursor: 0,
  };
  const specialState = {
    castCount: 0,
    attackCount: 0,
    shadowStrikeCount: 0,
    cloneCount: 0,
    nextPeriodicDamageAt: hero.special?.periodicPassive ? valueAtStar(hero.special.periodicPassive.interval, starIndex) : null,
  };

  const applyBurn = (currentTime, sourceKind, currentTargetState) => {
    const canApply =
      extra?.hooks?.burnPercent &&
      ((sourceKind === "attack" && extra?.hooks?.burnOnAttack) || (sourceKind === "spell" && extra?.hooks?.burnOnSpell));
    if (!canApply) return;

    const ticksPerSecond = extra?.hooks?.burnTicksPerSecond ?? 1;
    const burnDamage = mitigation(
      (currentTargetState.hp * (extra.hooks.burnPercent / 100)) / ticksPerSecond,
      currentTargetState.mr,
    );

    burnState = {
      damagePerTick: burnDamage,
      nextTickAt: currentTime + 1 / ticksPerSecond,
      endTime: currentTime + (extra?.hooks?.burnDuration ?? 5),
      tickInterval: 1 / ticksPerSecond,
    };
  };

  const applyCritAmpStacks = (expectedCritEvents) => {
    if (extra?.hooks?.damageAmpPerCritStack && expectedCritEvents > 0) {
      critAmpInstances.push({
        amount: expectedCritEvents,
        expiresAt: time + (extra?.hooks?.damageAmpStackDuration ?? 5),
      });
    }
  };

  const applyOnAttackStacks = (attackStats, critRollCount = 1) => {
    if (extra?.hooks?.attackSpeedPerAttack) {
      const nextAsFlat = dynamicState.asFlat + stats.baseAs * extra.hooks.attackSpeedPerAttack;
      dynamicState.asFlat = Math.min(stats.baseAs * (extra?.hooks?.attackSpeedCapBonus ?? 1.5), nextAsFlat);
    }

    if (extra?.hooks?.titanStackCap && dynamicState.titanStacks < extra.hooks.titanStackCap) {
      dynamicState.titanStacks += 1;
      dynamicState.adPercent += extra?.hooks?.titanAdPerStack ?? 0;
      dynamicState.apFlat += extra?.hooks?.titanApPerStack ?? 0;

      if (dynamicState.titanStacks >= extra.hooks.titanStackCap) {
        dynamicState.damageAmp = Math.max(dynamicState.damageAmp, extra?.hooks?.titanAmpAtCap ?? 0);
      }
    }

    if (extra?.hooks?.krakenStackCap && dynamicState.krakenStacks < extra.hooks.krakenStackCap) {
      dynamicState.krakenStacks += 1;
      dynamicState.adPercent += extra?.hooks?.krakenAdPerStack ?? 0;

      if (dynamicState.krakenStacks >= extra.hooks.krakenStackCap && extra?.hooks?.krakenAsAtCap) {
        dynamicState.asFlat = Math.max(dynamicState.asFlat, stats.baseAs * extra.hooks.krakenAsAtCap);
      }
    }

    const expectedCritEvents = (attackStats?.critChance ?? stats.critChance) * Math.max(1, critRollCount);

    applyCritAmpStacks(expectedCritEvents);

    if (extra?.hooks?.armorShredOnCritPercent && expectedCritEvents > 0) {
      dynamicState.armorShredPercent = extra.hooks.armorShredOnCritPercent;
      dynamicState.armorShredUntil = time + (extra?.hooks?.armorShredDuration ?? 3);
    }

    if (extra?.hooks?.mrShredPercent) {
      dynamicState.mrShredPercent = extra.hooks.mrShredPercent;
      dynamicState.mrShredUntil = time + (extra?.hooks?.mrShredDuration ?? 5);
    }
  };

  const applyOnSpellHitShreds = () => {
    if (extra?.hooks?.mrShredPercent) {
      dynamicState.mrShredPercent = extra.hooks.mrShredPercent;
      dynamicState.mrShredUntil = time + (extra?.hooks?.mrShredDuration ?? 5);
    }
  };

  const resolveShadowStrikeThresholds = (currentCombatStats, currentTargetState, currentManaState) => {
    const interval = valueAtStar(hero.special?.everyNAttacksBonus?.interval, starIndex);
    if (!interval || interval <= 0) return;
    const beforeTriggers = Math.floor((specialState.shadowStrikeCount - 1) / interval);
    const afterTriggers = Math.floor(specialState.shadowStrikeCount / interval);
    const extraTriggers = Math.max(0, afterTriggers - beforeTriggers);
    for (let triggerIndex = 0; triggerIndex < extraTriggers; triggerIndex += 1) {
      const triggeredBonus = buildScaledDamagePacket(
        hero.special.everyNAttacksBonus,
        currentCombatStats,
        currentTargetState,
        starLevel,
        hero.special.everyNAttacksBonus.type ?? "magic",
      );
      pushEvent(results, time, triggeredBonus.damage, triggeredBonus.type, currentCombatStats.as, currentManaState, `${hero.name} Passive Trigger`);
      applyOnSpellHitShreds();
    }
  };

  const refreshTimedEffects = (currentTime) => {
    dynamicState.timeCursor = currentTime;

    for (let index = critAmpInstances.length - 1; index >= 0; index -= 1) {
      if (critAmpInstances[index].expiresAt <= currentTime) {
        critAmpInstances.splice(index, 1);
      }
    }

    const critAmpStacks = critAmpInstances.reduce((sum, entry) => sum + entry.amount, 0);
    const critAmpCap = extra?.hooks?.damageAmpMaxStacks ?? critAmpStacks;
    const critAmpBonus = Math.min(critAmpCap, critAmpStacks) * (extra?.hooks?.damageAmpPerCritStack ?? 0);

    const titanAmp = dynamicState.titanStacks >= (extra?.hooks?.titanStackCap ?? Number.POSITIVE_INFINITY) ? extra?.hooks?.titanAmpAtCap ?? 0 : 0;
    dynamicState.damageAmp = Math.max(titanAmp, 0) + critAmpBonus;

    if (dynamicState.temporaryAsUntil !== null && dynamicState.temporaryAsUntil <= currentTime) {
      dynamicState.temporaryAsFlat = 0;
      dynamicState.temporaryAsUntil = null;
    }

    while (
      hero.special?.periodicPassive &&
      specialState.nextPeriodicDamageAt !== null &&
      specialState.nextPeriodicDamageAt <= currentTime
    ) {
      const periodicCombatStats = buildCombatStats(stats, dynamicState);
      const periodicTargetState = buildCurrentTargetState(targetState, extra, dynamicState);
      const periodic = buildScaledDamagePacket(
        hero.special.periodicPassive,
        periodicCombatStats,
        periodicTargetState,
        starLevel,
        hero.special.periodicPassive.type ?? "magic",
      );
      pushEvent(
        results,
        specialState.nextPeriodicDamageAt,
        periodic.damage,
        periodic.type,
        periodicCombatStats.as,
        `${Math.floor(mana)}/${stats.manaMax}`,
        `${hero.ability.name} Passive`,
      );
      applyOnSpellHitShreds();
      if (hero.special.periodicPassive?.spellSource && periodic.type !== "true") {
        applyCritAmpStacks(periodicCombatStats.critChance ?? 0);
      }
      specialState.nextPeriodicDamageAt += valueAtStar(hero.special.periodicPassive.interval, starIndex);
    }

    while (pendingDamageEvents.length && pendingDamageEvents[0].time <= currentTime) {
      const pendingEvent = pendingDamageEvents.shift();
      const pendingCombatStats = buildCombatStats(stats, dynamicState);
      const pendingTargetState = buildCurrentTargetState(targetState, extra, dynamicState);
      const resolved = buildScaledDamagePacket(
        pendingEvent.packet,
        pendingCombatStats,
        pendingTargetState,
        starLevel,
        pendingEvent.packet.type ?? "magic",
      );
      pushEvent(
        results,
        pendingEvent.time,
        resolved.damage,
        resolved.type,
        pendingCombatStats.as,
        `${Math.floor(mana)}/${stats.manaMax}`,
        pendingEvent.source,
      );
      applyOnSpellHitShreds();
      if (pendingEvent.packet.spellSource && resolved.type !== "true") {
        applyCritAmpStacks((pendingCombatStats.critChance ?? 0) * (pendingEvent.critRollCount ?? 1));
      }
      if (pendingEvent.countsAsShadowStrike) {
        specialState.shadowStrikeCount += 1;
        resolveShadowStrikeThresholds(pendingCombatStats, pendingTargetState, `${Math.floor(mana)}/${stats.manaMax}`);
      }
    }

    while (burnState && burnState.nextTickAt <= currentTime && burnState.nextTickAt <= burnState.endTime) {
      pushEvent(
        results,
        burnState.nextTickAt,
        burnState.damagePerTick,
        "magic",
        buildCombatStats(stats, dynamicState).as,
        `${Math.floor(mana)}/${stats.manaMax}`,
        "Burn",
      );
      burnState.nextTickAt += burnState.tickInterval;
    }

    if (burnState && burnState.endTime < currentTime && burnState.nextTickAt > burnState.endTime) {
      burnState = null;
    }
  };

  while (time < duration + 1e-9) {
    refreshTimedEffects(time);
    const combatStats = buildCombatStats(stats, dynamicState);
    const currentTargetState = buildCurrentTargetState(targetState, extra, dynamicState);

    if (castEndTime !== null && time >= castEndTime) {
      const spell = buildSpellDamage(hero, combatStats, currentTargetState, starLevel, specialState);
      if (spell.damage > 0) {
        pushEvent(
          results,
          time,
          spell.damage,
          spell.type,
          combatStats.as,
          `${Math.floor(mana)}/${stats.manaMax}`,
          hero.ability.name,
        );
        applyOnSpellHitShreds();
        if (combatStats.spellCrit && spell.type !== "true") {
          const spellCritRollCount =
            hero.special?.activeShadowStrikePacket && hero.special?.activeShadowStrikes
              ? 0
              : 1;
          applyCritAmpStacks((combatStats.critChance ?? 0) * spellCritRollCount);
        }
        applyBurn(time, "spell", currentTargetState);
      }

      if (extra?.hooks?.afterCastBonusMagic) {
        pendingSpellEmpower += extra.hooks.afterCastBonusMagic * combatStats.damageAmp;
      }

      if (stats.special?.empoweredAttackCount) {
        empoweredAttacksRemaining = valueAtStar(stats.special.empoweredAttackCount, starLevel - 1);
      }

      if (hero.special?.cloneAfterEachCast) {
        const replicationFactor = hero.special.cloneReplicationFactor ?? 0;
        const bonusClones = Math.floor(specialState.cloneCount * replicationFactor);
        specialState.cloneCount = Math.min(
          (hero.special.cloneMaxStacks ?? Number.POSITIVE_INFINITY),
          specialState.cloneCount + 1 + bonusClones,
        );
      }

      if (hero.special?.activeShadowStrikes && hero.special?.everyNAttacksBonus) {
        const addedShadowStrikes = valueAtStar(hero.special.activeShadowStrikes, starIndex);
        const packet = hero.special.activeShadowStrikePacket;
        if (packet && addedShadowStrikes > 0) {
          const spacing = Math.max(dt, stats.manaLock / addedShadowStrikes);
          for (let strikeIndex = 0; strikeIndex < addedShadowStrikes; strikeIndex += 1) {
            pendingDamageEvents.push({
              time: round(time + spacing * (strikeIndex + 1), 4),
              packet,
              source: hero.ability.name,
              countsAsShadowStrike: true,
              critRollCount: 1,
            });
          }
          pendingDamageEvents.sort((left, right) => left.time - right.time);
        }
      }

      manaLockedUntil = time + stats.manaLock;
      castEndTime = null;
      if (!stats.special?.canAttackDuringCast) {
        attackProgress = 0;
      }
      attacksSinceCast = 0;
    }

    const canActDuringCast = Boolean(stats.special?.canAttackDuringCast);
    const canAttack = castEndTime === null || canActDuringCast;
    const canGainMana = time >= manaLockedUntil && (castEndTime === null || canActDuringCast);

    if (canAttack) {
      const ramp = extra?.hooks?.perSecondAp
        ? Math.min(extra.hooks.maxPerSecondAp ?? extra.hooks.perSecondAp * duration, extra.hooks.perSecondAp * time)
        : 0;
      stats.ap = stats.apStaticBase + ramp;

      const currentCombatStats = buildCombatStats(stats, dynamicState);
      attackProgress += currentCombatStats.as * dt;
      if (canGainMana) {
        mana = Math.min(stats.manaMax, mana + stats.manaRegenPerSecond * dt * stats.manaGainMultiplier);
      }

      while (attackProgress >= 1) {
        const attackStats = buildCombatStats(stats, dynamicState);
        const attackTargetState = buildCurrentTargetState(targetState, extra, dynamicState);
        const attackDamage =
          buildAutoDamage(attackStats, attackTargetState) +
          (extra?.hooks?.onHitTrueBonus ?? 0) +
          (pendingSpellEmpower > 0 ? pendingSpellEmpower : 0);
        const type = pendingSpellEmpower > 0 ? "bonus" : "physical";
        pushEvent(results, time, attackDamage, type, attackStats.as, `${Math.floor(mana)}/${stats.manaMax}`, "Auto Attack");
        specialState.attackCount += 1;

        if (hero.special?.everyAttackBonus) {
          const everyAttackBonus = buildScaledDamagePacket(
            hero.special.everyAttackBonus,
            attackStats,
            attackTargetState,
            starLevel,
            hero.special.everyAttackBonus.type ?? "magic",
          );
          pushEvent(
            results,
            time,
            everyAttackBonus.damage,
            everyAttackBonus.type,
            attackStats.as,
            `${Math.floor(mana)}/${stats.manaMax}`,
            `${hero.name} Passive`,
          );
          applyOnSpellHitShreds();
          if (hero.special.everyAttackBonus.spellSource && everyAttackBonus.type !== "true") {
            applyCritAmpStacks(attackStats.critChance ?? 0);
          }
          specialState.shadowStrikeCount += 1;
          resolveShadowStrikeThresholds(attackStats, attackTargetState, `${Math.floor(mana)}/${stats.manaMax}`);
        }

        if (hero.special?.everyNAttacksBonus) {
          const interval = valueAtStar(hero.special.everyNAttacksBonus.interval, starIndex);
          if (interval > 0 && specialState.shadowStrikeCount > 0 && specialState.shadowStrikeCount % interval === 0) {
            const nthAttackBonus = buildScaledDamagePacket(
              hero.special.everyNAttacksBonus,
              attackStats,
              attackTargetState,
              starLevel,
              hero.special.everyNAttacksBonus.type ?? "magic",
            );
            pushEvent(
              results,
              time,
              nthAttackBonus.damage,
              nthAttackBonus.type,
              attackStats.as,
              `${Math.floor(mana)}/${stats.manaMax}`,
              `${hero.name} Trigger`,
            );
            applyOnSpellHitShreds();
            if (hero.special.everyNAttacksBonus.spellSource && nthAttackBonus.type !== "true") {
              applyCritAmpStacks(attackStats.critChance ?? 0);
            }
          }
        }

        if (hero.special?.shenPassive && specialState.castCount > 0) {
          const shenBonus = buildScaledDamagePacket(
            {
              damage: hero.special.shenPassive.bonusDamage.map((value) => value * specialState.castCount),
              apRatio: 1,
              type: specialState.castCount >= hero.special.shenPassive.trueAfterCastCount ? "true" : "magic",
            },
            attackStats,
            attackTargetState,
            starLevel,
            "magic",
          );
          pushEvent(
            results,
            time,
            shenBonus.damage,
            shenBonus.type,
            attackStats.as,
            `${Math.floor(mana)}/${stats.manaMax}`,
            `${hero.name} Empowered Attack`,
          );
          applyOnSpellHitShreds();
          if (shenBonus.type !== "true") {
            applyCritAmpStacks(attackStats.critChance ?? 0);
          }
        }

        if (empoweredAttacksRemaining > 0 && stats.special?.empoweredAttackDamage) {
          const shotIndex = valueAtStar(stats.special.empoweredAttackCount, starLevel - 1) - empoweredAttacksRemaining;
          const handCount = valueAtStar(stats.special.empoweredAttackHands, starLevel - 1);
          const rawAdComponent = valueAtStar(stats.special.empoweredAttackDamage, starLevel - 1);
          const rawApComponent = valueAtStar(stats.special.empoweredAttackApDamage, starLevel - 1);
          const adComponent = stats.special.empoweredAttackUsesAdPercent
            ? attackStats.ad * (rawAdComponent / 100)
            : rawAdComponent;
          const apComponent = stats.special.empoweredAttackUsesApMultiplier
            ? rawApComponent * attackStats.ap
            : rawApComponent * Math.max(0, attackStats.ap - 1);
          const handDamage = (adComponent + apComponent) * handCount;
          const finalBonus =
            empoweredAttacksRemaining === 1 ? 1 + valueAtStar(stats.special.finalAttackBonus, starLevel - 1) : 1;
          const critMultiplier =
            stats.special.empoweredAttackNeedsSpellCrit && !attackStats.spellCrit
              ? 1
              : 1 + attackStats.critChance * (attackStats.critDamage - 1);
          const empoweredDamage = mitigation(
            handDamage * finalBonus * attackStats.damageAmp * critMultiplier,
            attackTargetState.armor,
          );
          pushEvent(
            results,
            time,
            empoweredDamage,
            "physical",
            attackStats.as,
            `${Math.floor(mana)}/${stats.manaMax}`,
            `${hero.ability.name} Shot ${shotIndex + 1}`,
          );
          empoweredAttacksRemaining -= 1;
        }

        if (hero.special?.cloneAfterEachCast && specialState.cloneCount > 0) {
          pushEvent(
            results,
            time,
            attackDamage * (hero.special.cloneAttackMultiplier ?? 1) * specialState.cloneCount,
            type,
            attackStats.as,
            `${Math.floor(mana)}/${stats.manaMax}`,
            `${hero.name} Clone Attack x${specialState.cloneCount}`,
          );
        }
        applyBurn(time, "attack", attackTargetState);
        pendingSpellEmpower = 0;
        if (canGainMana) {
          mana = Math.min(
            stats.manaMax,
            mana +
              (stats.manaPerAttack +
                (extra?.hooks?.bonusManaOnAttack ?? 0) +
                stats.critChance * (extra?.hooks?.bonusManaOnCrit ?? 0)) *
                stats.manaGainMultiplier,
          );
        }
        attackProgress -= 1;
        attacksSinceCast += 1;
        let critRollCount = 1;
        if (empoweredAttacksRemaining > 0 && stats.special?.empoweredAttackHands) {
          critRollCount += valueAtStar(stats.special.empoweredAttackHands, starLevel - 1);
        }
        applyOnAttackStacks(attackStats, critRollCount);
      }

      const canCastNow =
        mana >= stats.manaMax &&
        castEndTime === null &&
        attackProgress >= stats.canCastAfterAutoProgress &&
        (!stats.special?.lockCastWhileEmpowered || empoweredAttacksRemaining <= 0) &&
        (!stats.requiresAttackBetweenCasts || attacksSinceCast > 0);

      if (canCastNow) {
        mana = 0;
        specialState.castCount += 1;
        if (hero.special?.shenPassive) {
          dynamicState.temporaryAsFlat = stats.baseAs * valueAtStar(hero.special.shenPassive.selfAs, starIndex);
          dynamicState.temporaryAsUntil = time + valueAtStar(hero.special.shenPassive.buffDuration, starIndex);
        }
        castEndTime = time + stats.castTime;
      }
    }

    time = round(time + dt, 4);
  }

  const damageAt5 = round(findDamageAtMark(results.timeline, 5));
  const damageAt10 = round(findDamageAtMark(results.timeline, 10));
  const damageAt15 = round(findDamageAtMark(results.timeline, 15));
  const damageAt20 = round(findDamageAtMark(results.timeline, 20));
  const damageAt25 = round(findDamageAtMark(results.timeline, 25));

  results.summary = {
    damageAt5,
    dpsAt5: round(damageAt5 / 5),
    damageAt10,
    damageAt15,
    dpsAt15: round(damageAt15 / 15),
    damageAt20,
    damageAt25,
    extraOutput25: 0,
  };

  const total = Math.max(results.totalDamage, 1);
  results.damageDistribution = [
    {
      key: "physical",
      label: "Physical",
      value: results.damageByType.physical,
      color: DAMAGE_COLORS.physical,
      percent: round((results.damageByType.physical / total) * 100, 1),
    },
    {
      key: "magic",
      label: "Magic",
      value: results.damageByType.magic,
      color: DAMAGE_COLORS.magic,
      percent: round((results.damageByType.magic / total) * 100, 1),
    },
    {
      key: "true",
      label: "True",
      value: results.damageByType.true + results.damageByType.bonus,
      color: DAMAGE_COLORS.true,
      percent: round(((results.damageByType.true + results.damageByType.bonus) / total) * 100, 1),
    },
  ];

  return results;
}




const NONE_ID = "none";
const MAX_GLOBAL_BUFFS = 10;
const LINE_COLORS = ["#7889a7", "#55d5ff", "#ff3c9b", "#f7c95f", "#73f1a8", "#b88cff"];
const generatedItemsCatalog = Array.isArray(globalThis.__GENERATED_ITEMS__) ? globalThis.__GENERATED_ITEMS__ : [];
const generatedChampionsCatalog = Array.isArray(globalThis.__GENERATED_CHAMPIONS__) ? globalThis.__GENERATED_CHAMPIONS__ : [];
const generatedItemExtraCache = new Map();

function mapGeneratedRoleToRuntime(roleApiName) {
  switch (roleApiName) {
    case "ADCarry":
    case "ADSpecialist":
      return "marksman";
    case "APCarry":
    case "APCaster":
    case "ADCaster":
      return "caster";
    case "ADFighter":
    case "APFighter":
    case "HFighter":
      return "fighter";
    case "ADReaper":
    case "APReaper":
      return "assassin";
    case "ADTank":
    case "APTank":
      return "tank";
    default:
      return "caster";
  }
}

function inferAbilityType(ability) {
  const description = ability?.descriptionRaw ?? "";
  if (description.includes("<physicalDamage>") && description.includes("<magicDamage>")) return "mixed";
  if (description.includes("<physicalDamage>")) return "physical";
  if (description.includes("<magicDamage>")) return "magic";
  return "magic";
}

function inferDamageArray(baseValues, abilityType) {
  const entries = Object.entries(baseValues ?? {}).filter(([, value]) => Array.isArray(value) && value.every((item) => typeof item === "number"));
  const byName = (matcher) => entries.find(([key]) => matcher.test(key))?.[1];

  if (abilityType === "physical") {
    return (
      byName(/ADDamage|AttackDamage|PhysicalDamage|ModifiedDamage|DamagePerSecond|Damage/i) ??
      entries.find(([key]) => /Damage/i.test(key) && !/Reduction|Mitigation/i.test(key))?.[1] ??
      [0, 0, 0]
    );
  }

  return (
    byName(/APDamage|MagicDamage|ModifiedDamage|DamagePerSecond|Damage/i) ??
    entries.find(([key]) => /Damage/i.test(key) && !/Reduction|Mitigation/i.test(key))?.[1] ??
    [0, 0, 0]
  );
}

function inferShieldArray(baseValues) {
  return Object.entries(baseValues ?? {}).find(([key, value]) => /Shield/i.test(key) && Array.isArray(value))?.[1] ?? [0, 0, 0];
}

function multiplyArray(values, multiplier) {
  return (values ?? [0, 0, 0]).map((value) => value * multiplier);
}

function addArrays(left, right) {
  return [0, 1, 2].map((index) => (left?.[index] ?? 0) + (right?.[index] ?? 0));
}

function buildAbilityDamageProfile(champion, abilityType) {
  const baseValues = champion.ability?.baseValues ?? {};
  const baseDamage = inferDamageArray(baseValues, abilityType);

  if (champion.apiName === "TFT17_Jhin") {
    const addDamage = baseValues.ADDamage ?? [0, 0, 0];
    return {
      damage: [0, 0, 0],
      special: {
        fixedAttackSpeed: baseValues.FixedAS ?? [champion.stats.as, champion.stats.as, champion.stats.as],
        attackSpeedToAdFactor: 75,
        empoweredAttackCount: baseValues.NumAttacks ?? [0, 0, 0],
        empoweredAttackHands: baseValues.NumHands ?? [1, 1, 1],
        empoweredAttackDamage: addDamage,
        empoweredAttackApDamage: baseValues.APDamage ?? [0, 0, 0],
        finalAttackBonus: baseValues.FinalShotPercentDamageIncrease ?? [0, 0, 0],
        lockCastWhileEmpowered: true,
        empoweredAttackNeedsSpellCrit: true,
        empoweredAttackUsesAdPercent: true,
        empoweredAttackUsesApMultiplier: true,
      },
      typeOverride: "physical",
    };
  }

  if (champion.apiName === "TFT17_Morgana") {
    const duration = baseValues.Duration ?? [1, 1, 1];
    const tether = baseValues.TetherDamagePerSecond ?? [0, 0, 0];
    const finalDamage = baseValues.FinalDamage ?? [0, 0, 0];
    return {
      damage: [0, 1, 2].map((index) => (tether[index] ?? 0) * (duration[index] ?? 1) + (finalDamage[index] ?? 0)),
      typeOverride: "magic",
    };
  }

  if (champion.apiName === "TFT17_Blitzcrank") {
    return {
      damage: addArrays(baseValues.UppercutDamage ?? [0, 0, 0], baseValues.ExplosionDamage ?? [0, 0, 0]),
      typeOverride: "magic",
      special: {
        periodicPassive: {
          interval: baseValues.BoltCooldown ?? [2, 2, 2],
          damage: baseValues.BoltDamage ?? [0, 0, 0],
          type: "magic",
          apRatio: 1,
          spellSource: true,
        },
      },
    };
  }

  if (champion.apiName === "TFT17_Fiora") {
    return {
      damage: multiplyArray(baseValues.VitalDamage ?? [0, 0, 0], baseValues.NumVitals?.[0] ?? 6),
      typeOverride: "true",
      special: {
        everyNAttacksBonus: {
          interval: baseValues.NumAttacks ?? [2, 2, 2],
          damage: baseValues.VitalDamage ?? [0, 0, 0],
          type: "true",
          adRatio: 1,
        },
      },
    };
  }

  if (champion.apiName === "TFT17_Graves") {
    return {
      damage: baseValues.Damage ?? baseDamage,
      typeOverride: "physical",
      special: {
        autoDamageMultiplier: [0, 1, 2].map((index) => (baseValues.NumProjectiles?.[index] ?? 1) * (baseValues.PassivePercentBAD?.[index] ?? 1)),
      },
    };
  }

  if (champion.apiName === "TFT17_Shen") {
    return {
      damage: baseValues.BonusDamageOnAttack ?? [0, 0, 0],
      typeOverride: "magic",
      special: {
        shenPassive: {
          bonusDamage: baseValues.BonusDamageOnAttack ?? [0, 0, 0],
          selfAs: baseValues.BonusAS ?? [0, 0, 0],
          buffDuration: baseValues.BuffDebuffDuration ?? [3, 3, 3],
          trueAfterCastCount: 3,
        },
      },
    };
  }

  if (champion.apiName === "TFT17_Sona") {
    return {
      damage: baseValues.DebrisDamage ?? [0, 0, 0],
      typeOverride: "magic",
      special: {
        spellCycle: {
          cycleLength: baseValues.NumCasts ?? [5, 5, 5],
          alternateDamage: addArrays(baseValues.DebrisRipDamage ?? [0, 0, 0], baseValues.SlamDamage ?? [0, 0, 0]),
          type: "magic",
        },
      },
    };
  }

  if (champion.apiName === "TFT17_Vex") {
    return {
      damage: [0, 0, 0],
      typeOverride: "magic",
      special: {
        castTimeOverride: 0,
        manaLockOverride: 0.5,
        canAttackDuringCast: true,
        everyAttackBonus: {
          damage: baseValues.ShadowHandDamage ?? [0, 0, 0],
          type: "magic",
          apRatio: 1,
          spellSource: true,
        },
        activeShadowStrikes: baseValues.NumActiveStrikes ?? [3, 3, 3],
        activeShadowStrikePacket: {
          damage: baseValues.ShadowHandMagicDamage ?? [0, 0, 0],
          type: "magic",
          apRatio: 1,
          spellSource: true,
        },
        everyNAttacksBonus: {
          interval: baseValues.NumStrikesForPassive ?? [5, 5, 5],
          damage: baseValues.ShadowHandDamage ?? [0, 0, 0],
          type: "magic",
          apRatio: 1,
          spellSource: true,
        },
      },
    };
  }

  if (champion.apiName === "TFT17_Zed") {
    return {
      damage: [0, 0, 0],
      typeOverride: "bonus",
      special: {
        cloneAfterEachCast: true,
        cloneAttackMultiplier: 0.85,
        cloneMaxStacks: 12,
        cloneReplicationFactor: 0.5,
      },
    };
  }

  if (Array.isArray(baseValues.DamagePerSecond) && Array.isArray(baseValues.Duration)) {
    return { damage: [0, 1, 2].map((index) => (baseValues.DamagePerSecond[index] ?? 0) * (baseValues.Duration[index] ?? 1)) };
  }

  if (Array.isArray(baseValues.ShadowHandMagicDamage) && Array.isArray(baseValues.NumActiveStrikes)) {
    return {
      damage: [0, 1, 2].map(
        (index) => (baseValues.ShadowHandMagicDamage[index] ?? 0) * (baseValues.NumActiveStrikes[index] ?? 1),
      ),
    };
  }

  if (Array.isArray(baseValues.Damage) && Array.isArray(baseValues.SecondaryDamage)) {
    return { damage: addArrays(baseValues.Damage, baseValues.SecondaryDamage) };
  }

  return { damage: baseDamage };
}

function inferScalings(champion, abilityType) {
  const description = champion.ability?.descriptionRaw ?? "";
  const baseValues = champion.ability?.baseValues ?? {};

  if (champion.apiName === "TFT17_Jhin") {
    return { apRatio: 0, adRatio: 0, healthRatio: 0 };
  }

  if (champion.apiName === "TFT17_Fiora") {
    return { apRatio: 0, adRatio: 1, healthRatio: 0 };
  }

  if (Array.isArray(baseValues.DamagePerSecond)) {
    return { apRatio: description.includes("%i:scaleAP%") ? 1 : 0, adRatio: 0, healthRatio: 0 };
  }

  if (Array.isArray(baseValues.Damage) || Array.isArray(baseValues.ShadowHandMagicDamage)) {
    return {
      apRatio: description.includes("%i:scaleAP%") ? 1 : 0,
      adRatio: description.includes("%i:scaleAD%") ? 1 : 0,
      healthRatio: 0,
    };
  }

  return {
    apRatio: abilityType !== "physical" && description.includes("%i:scaleAP%") ? 1 : 0,
    adRatio: description.includes("%i:scaleAD%") ? 1 : 0,
    healthRatio: 0,
  };
}

function normalizeStarArray(values, fallback) {
  if (Array.isArray(values) && values.length === 3 && values.every((value) => value !== null && value !== undefined)) {
    return values;
  }
  return [fallback, fallback, fallback];
}

function normalizeGeneratedChampion(champion) {
  const runtimeRole = mapGeneratedRoleToRuntime(champion.role?.apiName);
  const inferredAbilityType = inferAbilityType(champion.ability);
  const abilityType = inferredAbilityType;
  const damageProfile = buildAbilityDamageProfile(champion, abilityType);

  return {
    id: champion.id,
    apiName: champion.apiName,
    name: champion.shortName || champion.name,
    cost: champion.cost,
    role: runtimeRole,
    traits: (champion.traits ?? []).map((trait) => trait.name || trait.apiName),
    base: {
      hp: normalizeStarArray(champion.displayStatsByStar?.hp, champion.stats.hp),
      ad: normalizeStarArray(champion.displayStatsByStar?.ad, champion.stats.ad),
      as: champion.stats.as,
      armor: champion.stats.armor,
      mr: champion.stats.mr,
      range: champion.stats.range,
      critChance: champion.stats.critChance,
      critDamage: champion.stats.critDamage,
      manaStart: champion.stats.manaStart,
      manaMax: champion.stats.manaMax,
      apBase: champion.stats.apBase ?? 1,
      damageAmpBase: champion.stats.damageAmpBase ?? 1,
    },
    ability: {
      name: champion.ability?.name || champion.ability?.rawName || champion.name,
      type: damageProfile.typeOverride ?? inferredAbilityType,
      baseValues: {
        damage: damageProfile.damage,
        shield: inferShieldArray(champion.ability?.baseValues),
      },
      scalings: inferScalings(champion, abilityType),
      spellCrit: Boolean(champion.ability?.spellCrit),
      description: champion.ability?.descriptionZh || champion.ability?.descriptionRaw || "",
    },
    special: damageProfile.special ?? null,
  };
}

const runtimeHeroes = generatedChampionsCatalog.length ? generatedChampionsCatalog.map(normalizeGeneratedChampion) : heroes;

const UI_TEXT = {
  noItem: "\u65e0\u88c5\u5907",
  noBuff: "\u65e0\u5f3a\u5316",
  armor: "\u62a4\u7532",
  mr: "\u9b54\u6297",
  attack: "\u653b\u51fb\u529b:",
  attackSpeed: "\u653b\u901f:",
  ap: "\u6cd5\u5f3a:",
  mana: "\u6cd5\u529b\u503c:",
  manaRegen: "\u6cd5\u529b\u503c Regen:",
  manaText: "\u6cd5\u529b\u503c",
  displayFive: "\u0035\u79d2\u8f93\u51fa",
  displayFifteen: "\u0031\u0035\u79d2\u8f93\u51fa",
  attackStat: "\u653b\u51fb\u529b",
  attackSpeedStat: "\u653b\u901f",
  apStat: "\u6cd5\u5f3a",
};

const ITEM_OVERRIDE_BY_API = {
  TFT_Item_ArchangelsStaff: {
    hooks: { perSecondAp: 0.04, maxPerSecondAp: 0.4 },
  },
  TFT_Item_JeweledGauntlet: {
    hooks: { enableSpellCrit: true },
  },
  TFT_Item_InfinityEdge: {
    hooks: { enableSpellCrit: true, precisionCritDamageBonus: 0.1 },
  },
  TFT_Item_StatikkShiv: {
    hooks: { mrShredPercent: 0.3, mrShredDuration: 5 },
  },
  TFT_Item_SpearOfShojin: {
    hooks: { bonusManaOnAttack: 5 },
  },
  TFT_Item_GuinsoosRageblade: {
    hooks: { attackSpeedPerAttack: 0.07, attackSpeedCapBonus: 1.5 },
  },
  TFT_Item_AdaptiveHelm: {
    hooks: { manaGainMultiplier: 0.15, backlineAdApPercent: 0.1 },
  },
  TFT_Item_LastWhisper: {
    hooks: { armorShredOnCritPercent: 0.3, armorShredDuration: 3 },
  },
  TFT_Item_Leviathan: {
    hooks: { bonusManaOnCrit: 4 },
  },
  TFT_Item_Morellonomicon: {
    hooks: { burnPercent: 1, burnTicksPerSecond: 1, burnDuration: 10, burnOnSpell: true },
  },
  TFT_Item_PowerGauntlet: {
    flatStats: { damageAmp: 0.05 },
    hooks: { damageAmpPerCritStack: 0.05, damageAmpStackDuration: 5, damageAmpMaxStacks: 4 },
  },
  TFT_Item_RapidFireCannon: {
    hooks: { burnPercent: 1, burnTicksPerSecond: 1, burnDuration: 5, burnOnAttack: true, burnOnSpell: true },
  },
  TFT_Item_RunaansHurricane: {
    hooks: { krakenAdPerStack: 0.035, krakenStackCap: 15, krakenAsAtCap: 0.15 },
  },
  TFT_Item_TitansResolve: {
    hooks: { titanAdPerStack: 0.02, titanApPerStack: 0.02, titanStackCap: 25, titanAmpAtCap: 0.1 },
  },
  TFT_Item_UnstableConcoction: {
    flatStats: { adPercent: 0.3, apFlat: 0.3 },
    hooks: {},
  },
  TFT_Item_RabadonsDeathcap: {
    hooks: {},
  },
};

const GLOBAL_BUFF_META = {
  "buff-blue": {
    levels: [1, 2, 3],
    param: { key: "gold", label: "\u91d1\u5e01", min: 0, max: 100, step: 1, defaultValue: 20 },
    levelFactors: { 1: 0.7, 2: 1, 3: 1.3 },
  },
  "buff-red": {
    levels: [1, 2, 3],
    param: { key: "lvlOverride", label: "Lvl Override", min: 0, max: 10, step: 1, defaultValue: 0 },
    levelFactors: { 1: 0.65, 2: 1, 3: 1.25 },
  },
  "buff-gold": {
    levels: [1, 2, 3],
    param: { key: "gold", label: "\u91d1\u5e01", min: 0, max: 100, step: 1, defaultValue: 20 },
    levelFactors: { 1: 0.75, 2: 1, 3: 1.2 },
  },
  "buff-purple": {
    levels: [1, 2, 3],
    param: { key: "lvlOverride", label: "Lvl Override", min: 0, max: 10, step: 1, defaultValue: 0 },
    levelFactors: { 1: 0.8, 2: 1, 3: 1.2 },
  },
  "buff-green": {
    levels: [1, 2, 3],
    param: { key: "gold", label: "\u91d1\u5e01", min: 0, max: 100, step: 1, defaultValue: 12 },
    levelFactors: { 1: 0.7, 2: 1, 3: 1.15 },
  },
  "trait-bastion-4": {
    levels: [1, 2, 3],
    param: { key: "isTraitActive", label: "Is Bastion", min: 0, max: 1, step: 1, defaultValue: 1 },
    levelFactors: { 1: 0.45, 2: 0.75, 3: 1 },
  },
  "trait-sorcerer-4": {
    levels: [1, 2, 3],
    param: { key: "isTraitActive", label: "Is \u6cd5\u5e08", min: 0, max: 1, step: 1, defaultValue: 1 },
    levelFactors: { 1: 0.45, 2: 0.75, 3: 1 },
  },
  "trait-sniper-2": {
    levels: [1, 2, 3],
    param: { key: "isTraitActive", label: "Is Sniper", min: 0, max: 1, step: 1, defaultValue: 1 },
    levelFactors: { 1: 0.45, 2: 0.75, 3: 1 },
  },
  "trait-vanguard-4": {
    levels: [1, 2, 3],
    param: { key: "isTraitActive", label: "Is Vanguard", min: 0, max: 1, step: 1, defaultValue: 1 },
    levelFactors: { 1: 0.45, 2: 0.75, 3: 1 },
  },
  "trait-arcane-3": {
    levels: [1, 2, 3],
    param: { key: "isTraitActive", label: "Is Arcane", min: 0, max: 1, step: 1, defaultValue: 1 },
    levelFactors: { 1: 0.45, 2: 0.75, 3: 1 },
  },
};

const state = {
  heroId: runtimeHeroes[0]?.id ?? "ahri",
  starLevel: 1,
  targetDummy: { ...targetPresets.standard_frontline },
  stage: "4-1",
  tacticianLevel: 4,
  numberOfBuffs: 3,
  categoryId: "craftable",
  selectedExtras: new Set(),
  globalItemIds: [NONE_ID, NONE_ID, NONE_ID],
  globalBuffIds: Array.from({ length: MAX_GLOBAL_BUFFS }, () => NONE_ID),
  globalBuffLevels: Array.from({ length: MAX_GLOBAL_BUFFS }, () => 1),
  globalBuffParams: Array.from({ length: MAX_GLOBAL_BUFFS }, () => ({ value: 0 })),
  bonusStats: {
    apFlat: 0,
    adFlat: 0,
    asFlat: 0,
    damageAmp: 0,
  },
  rowResults: [],
  baseline: null,
  showDpsColumns: false,
};

const els = {
  heroSelect: document.querySelector("#hero-select"),
  starSelect: document.querySelector("#star-select"),
  stageSelect: document.querySelector("#stage-select"),
  categoryTabs: document.querySelector("#category-tabs"),
  resultsBody: document.querySelector("#results-body"),
  heroVsTitle: document.querySelector("#hero-vs-title"),
  baseStatsGrid: document.querySelector("#base-stats-grid"),
  chartPanel: document.querySelector("#chart-panel"),
  damageChart: document.querySelector("#damage-chart"),
  logSelect: document.querySelector("#log-select"),
  logBody: document.querySelector("#log-body"),
  donutChart: document.querySelector("#donut-chart"),
  donutLegend: document.querySelector("#donut-legend"),
  tacticianLevel: document.querySelector("#tactician-level"),
  tacticianLevelValue: document.querySelector("#tactician-level-value"),
  globalItem1: document.querySelector("#global-item-1"),
  globalItem2: document.querySelector("#global-item-2"),
  globalItem3: document.querySelector("#global-item-3"),
  globalBuffList: document.querySelector("#global-buff-list"),
  buffCount: document.querySelector("#buff-count"),
  buffCountValue: document.querySelector("#buff-count-value"),
  targetHp: document.querySelector("#target-hp"),
  targetArmor: document.querySelector("#target-armor"),
  targetMr: document.querySelector("#target-mr"),
  bonusAp: document.querySelector("#bonus-ap"),
  bonusAd: document.querySelector("#bonus-ad"),
  bonusAs: document.querySelector("#bonus-as"),
  bonusDmgAmp: document.querySelector("#bonus-dmgamp"),
  displayDpsToggle: document.querySelector("#display-dps-toggle"),
  colFive: document.querySelector("#col-five"),
  colFifteen: document.querySelector("#col-fifteen"),
};

function formatNumber(value, digits = 2) {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toFixed(digits).replace(/\.00$/, "");
}

function getHero() {
  return runtimeHeroes.find((hero) => hero.id === state.heroId) ?? runtimeHeroes[0];
}

function getTargetDummy() {
  return state.targetDummy;
}

function getExtrasForCurrentCategory() {
  if (state.categoryId === "craftable" && generatedItemsCatalog.length) {
    return generatedItemsCatalog.map((item, index) => ({
      ...buildGeneratedItemExtra(item),
      category: "craftable",
      order: index + 1,
      rawName: item.rawName,
      icon: item.icon,
    }));
  }
  return extras.filter((extra) => extra.category === state.categoryId);
}

function getSelectableItems() {
  const runtimeItems = generatedItemsCatalog.map((item) => ({
    id: item.apiName,
    name: item.name,
  }));
  if (runtimeItems.length) {
    return [{ id: NONE_ID, name: UI_TEXT.noItem }, ...runtimeItems];
  }
  return [
    { id: NONE_ID, name: UI_TEXT.noItem },
    ...extras.filter((extra) => ["craftable", "artifact", "radiant"].includes(extra.category)),
  ];
}

function buildGeneratedItemExtra(item) {
  const effects = item.effects ?? {};
  const flatStats = {};
  const hooks = {};
  const override = ITEM_OVERRIDE_BY_API[item.apiName];

  if (typeof effects.AD === "number") flatStats.adPercent = (flatStats.adPercent ?? 0) + effects.AD;
  if (typeof effects.AP === "number") flatStats.apFlat = (flatStats.apFlat ?? 0) + effects.AP / 100;
  if (typeof effects.AS === "number") flatStats.asPercent = (flatStats.asPercent ?? 0) + effects.AS / 100;
  if (typeof effects.Health === "number") flatStats.hpFlat = (flatStats.hpFlat ?? 0) + effects.Health;
  if (typeof effects.Armor === "number") flatStats.armorFlat = (flatStats.armorFlat ?? 0) + effects.Armor;
  if (typeof effects.MagicResist === "number") flatStats.mrFlat = (flatStats.mrFlat ?? 0) + effects.MagicResist;
  if (typeof effects.CritChance === "number") flatStats.critChance = (flatStats.critChance ?? 0) + effects.CritChance / 100;
  if (typeof effects.CritDamage === "number") flatStats.critDamage = (flatStats.critDamage ?? 0) + effects.CritDamage / 100;
  if (typeof effects.ManaRegen === "number") flatStats.manaRegen = (flatStats.manaRegen ?? 0) + effects.ManaRegen;
  if (typeof effects.BonusDamage === "number") flatStats.damageAmp = (flatStats.damageAmp ?? 0) + effects.BonusDamage;
  if (typeof effects.DamageAmp === "number") flatStats.damageAmp = (flatStats.damageAmp ?? 0) + effects.DamageAmp;
  if (typeof effects.ModifiedADAP === "number") {
    flatStats.adPercent = (flatStats.adPercent ?? 0) + effects.ModifiedADAP;
    flatStats.apFlat = (flatStats.apFlat ?? 0) + effects.ModifiedADAP;
  }

  if (typeof effects.FlatManaRestore === "number") hooks.bonusManaOnAttack = (hooks.bonusManaOnAttack ?? 0) + effects.FlatManaRestore;
  if (typeof effects.BaseManaOnHit === "number") hooks.bonusManaOnAttack = (hooks.bonusManaOnAttack ?? 0) + effects.BaseManaOnHit;
  if (typeof effects.ManaOnCrit === "number") hooks.bonusManaOnAttack = (hooks.bonusManaOnAttack ?? 0) + effects.ManaOnCrit;
  if (typeof effects.MRShred === "number") hooks.mrShredPercent = Math.max(hooks.mrShredPercent ?? 0, effects.MRShred / 100);
  if (typeof effects.MRShredDuration === "number") hooks.mrShredDuration = Math.max(hooks.mrShredDuration ?? 0, effects.MRShredDuration);
  if (typeof effects.AttackSpeedPerStack === "number") {
    hooks.attackSpeedPerAttack = effects.AttackSpeedPerStack / 100;
    hooks.attackSpeedCapBonus = 1.5;
  }

  if (override?.flatStats) {
    Object.entries(override.flatStats).forEach(([key, value]) => {
      flatStats[key] = (flatStats[key] ?? 0) + value;
    });
  }

  if (override?.hooks) {
    Object.entries(override.hooks).forEach(([key, value]) => {
      hooks[key] = typeof value === "number" ? (hooks[key] ?? 0) + value : value;
    });
  }

  return {
    id: item.apiName,
    name: item.name,
    category: "generated-item",
    flatStats,
    hooks,
  };
}

function getGeneratedItemExtraById(id) {
  if (!id || id === NONE_ID) return null;
  if (generatedItemExtraCache.has(id)) return generatedItemExtraCache.get(id);
  const item = generatedItemsCatalog.find((entry) => entry.apiName === id);
  if (!item) return null;
  const mapped = buildGeneratedItemExtra(item);
  generatedItemExtraCache.set(id, mapped);
  return mapped;
}

function getSelectableBuffs() {
  const hero = getHero();
  const normalizedHeroTraits = new Set((hero.traits ?? []).map((trait) => String(trait).toLowerCase()));
  const buffPool = extras.filter((extra) => ["buff", "trait"].includes(extra.category));

  return [
    { id: NONE_ID, name: UI_TEXT.noBuff },
    ...buffPool.sort((left, right) => {
      const leftHeroTrait = normalizedHeroTraits.has((left.traitKey ?? "").toLowerCase()) ? 0 : 1;
      const rightHeroTrait = normalizedHeroTraits.has((right.traitKey ?? "").toLowerCase()) ? 0 : 1;
      if (leftHeroTrait !== rightHeroTrait) return leftHeroTrait - rightHeroTrait;
      return left.order - right.order;
    }),
  ];
}

function getBuffMeta(extra) {
  if (!extra) {
    return {
      levels: [1, 2, 3],
      param: { key: "value", label: "\u503c", min: 0, max: 10, step: 1, defaultValue: 0 },
      levelFactors: { 1: 0.6, 2: 1, 3: 1.2 },
    };
  }
  return (
    GLOBAL_BUFF_META[extra.id] ?? {
      levels: [1, 2, 3],
      param:
        extra.category === "trait"
          ? {
              key: "isTraitActive",
              label: `Is ${extra.name.split(" ")[0]}`,
              min: 0,
              max: 1,
              step: 1,
              defaultValue: 1,
            }
          : { key: "value", label: "\u503c", min: 0, max: 100, step: 1, defaultValue: 0 },
      levelFactors: { 1: 0.6, 2: 1, 3: 1.2 },
    }
  );
}

function scaleExtraValue(value, factor) {
  if (typeof value === "number") return value * factor;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        ["targetHpAtLeast", "min", "max"].includes(key) ? nestedValue : scaleExtraValue(nestedValue, factor),
      ]),
    );
  }
  return value;
}

function buildGlobalBuffExtra(buffId, level, rawParam) {
  const baseExtra = extras.find((extra) => extra.id === buffId);
  if (!baseExtra) return null;

  const meta = getBuffMeta(baseExtra);
  const factor = meta.levelFactors[level] ?? 1;
  const normalizedParam = Number(rawParam ?? meta.param.defaultValue ?? 0);
  const paramFactor =
    meta.param.key === "gold"
      ? 1 + normalizedParam / 100
      : meta.param.key === "lvlOverride"
        ? 1 + normalizedParam * 0.03
        : meta.param.key === "isTraitActive"
          ? (normalizedParam ? 1 : 0)
          : 1;

  return {
    id: `${baseExtra.id}-slot`,
    name: baseExtra.name,
    category: "global-buff",
    flatStats: scaleExtraValue(baseExtra.flatStats ?? {}, factor * paramFactor),
    hooks: scaleExtraValue(baseExtra.hooks ?? {}, factor * paramFactor),
  };
}

function buildCombinedExtra(extraList, name = "baseline") {
  const merged = {
    id: extraList.map((item) => item.id).join("+") || "baseline",
    name,
    category: "combined",
    flatStats: {},
    hooks: {},
  };

  const mergeHook = (key, currentValue, nextValue) => {
    if (typeof nextValue === "boolean") {
      return Boolean(currentValue) || nextValue;
    }

    if (typeof nextValue !== "number") {
      return nextValue;
    }

    const maxMergedKeys = new Set([
      "attackSpeedCapBonus",
      "armorShredDuration",
      "mrShredPercent",
      "mrShredDuration",
      "damageAmpStackDuration",
      "damageAmpMaxStacks",
      "burnDuration",
      "burnTicksPerSecond",
      "krakenStackCap",
      "krakenAsAtCap",
      "titanStackCap",
      "titanAmpAtCap",
      "maxPerSecondAp",
      "manaLockReductionCap",
    ]);

    if (maxMergedKeys.has(key)) {
      return Math.max(currentValue ?? 0, nextValue);
    }

    return (currentValue ?? 0) + nextValue;
  };

  extraList.forEach((extra) => {
    if (!extra) return;

    Object.entries(extra.flatStats ?? {}).forEach(([key, value]) => {
      merged.flatStats[key] = (merged.flatStats[key] ?? 0) + value;
    });

      Object.entries(extra.hooks ?? {}).forEach(([key, value]) => {
        merged.hooks[key] = mergeHook(key, merged.hooks[key], value);
      });
    });

  if (state.bonusStats.apFlat) merged.flatStats.apFlat = (merged.flatStats.apFlat ?? 0) + state.bonusStats.apFlat;
  if (state.bonusStats.adFlat) merged.flatStats.adFlat = (merged.flatStats.adFlat ?? 0) + state.bonusStats.adFlat;
  if (state.bonusStats.asFlat) merged.flatStats.asFlat = (merged.flatStats.asFlat ?? 0) + state.bonusStats.asFlat;
  if (state.bonusStats.damageAmp) {
    merged.flatStats.damageAmp = (merged.flatStats.damageAmp ?? 0) + state.bonusStats.damageAmp;
  }

  return merged;
}

function getBaselineExtra() {
  const selectedItems = state.globalItemIds.map((id) => getGeneratedItemExtraById(id) ?? extras.find((extra) => extra.id === id)).filter(Boolean);
  const selectedBuffs = state.globalBuffIds
    .map((id, index) =>
      index < state.numberOfBuffs ? buildGlobalBuffExtra(id, state.globalBuffLevels[index], state.globalBuffParams[index].value) : null,
    )
    .filter(Boolean);
  return buildCombinedExtra([...selectedItems, ...selectedBuffs], "baseline");
}

function getComputedHeroStats() {
  const hero = getHero();
  const starIndex = state.starLevel - 1;
  const role = roleDefaults[hero.role];
  const baselineExtra = getBaselineExtra();
  const flat = baselineExtra.flatStats ?? {};
  const backlineBonus =
    baselineExtra.hooks.backlineAdApPercent && !["tank", "fighter"].includes(hero.role) ? baselineExtra.hooks.backlineAdApPercent : 0;
  const manaGainMultiplier = 1 + (baselineExtra.hooks.manaGainMultiplier ?? 0);
  const manaPerAttackBase =
    role.manaPerAttack + (flat.manaPerAttack ?? 0) + (baselineExtra.hooks.bonusManaOnAttack ?? 0) + hero.base.critChance * (baselineExtra.hooks.bonusManaOnCrit ?? 0);

  return {
    ad: (hero.base.ad[starIndex] * (1 + (flat.adPercent ?? 0)) + (flat.adFlat ?? 0)) * (1 + backlineBonus),
    ap: hero.base.apBase + (flat.apFlat ?? 0) + backlineBonus,
    damageAmp: hero.base.damageAmpBase + (flat.damageAmp ?? 0),
    as: hero.base.as * (1 + (flat.asPercent ?? 0)) + (flat.asFlat ?? 0),
    critChance: hero.base.critChance + (flat.critChance ?? 0),
    critDamage: hero.base.critDamage + (flat.critDamage ?? 0),
    manaPerAttack: manaPerAttackBase * manaGainMultiplier,
    manaRegen: (role.manaRegenPerSecond + (flat.manaRegen ?? 0)) * manaGainMultiplier,
    role: hero.role,
    spellCrit: hero.ability.spellCrit || Boolean(baselineExtra.hooks.enableSpellCrit),
    castTime: role.castTime,
    manaStart: hero.base.manaStart,
    manaMax: hero.base.manaMax,
  };
}

function initControls() {
  els.heroSelect.innerHTML = runtimeHeroes.map((hero) => `<option value="${hero.id}">${hero.name}</option>`).join("");
  els.heroSelect.value = state.heroId;

  const itemOptions = getSelectableItems().map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  [els.globalItem1, els.globalItem2, els.globalItem3].forEach((select, index) => {
    select.innerHTML = itemOptions;
    select.value = state.globalItemIds[index];
    select.addEventListener("change", () => {
      state.globalItemIds[index] = select.value;
      refreshAll();
    });
  });

  els.buffCount.value = String(state.numberOfBuffs);
  els.buffCountValue.textContent = String(state.numberOfBuffs);
  const syncBuffCount = () => {
    state.numberOfBuffs = Number(els.buffCount.value);
    els.buffCountValue.textContent = String(state.numberOfBuffs);
    renderGlobalBuffControls();
    refreshAll();
  };
  els.buffCount.addEventListener("input", syncBuffCount);
  els.buffCount.addEventListener("change", syncBuffCount);

  els.targetHp.value = String(state.targetDummy.hp);
  els.targetArmor.value = String(state.targetDummy.armor);
  els.targetMr.value = String(state.targetDummy.mr);

  els.heroSelect.addEventListener("change", () => {
    state.heroId = els.heroSelect.value;
    state.selectedExtras.clear();
    refreshAll();
  });

  els.starSelect.addEventListener("change", () => {
    state.starLevel = Number(els.starSelect.value);
    refreshAll();
  });

  els.stageSelect.addEventListener("change", () => {
    state.stage = els.stageSelect.value;
    refreshAll();
  });

  [
    [els.targetHp, "hp", 1],
    [els.targetArmor, "armor", 0],
    [els.targetMr, "mr", 0],
  ].forEach(([input, key, min]) => {
    input.addEventListener("input", () => {
      const fallback = targetPresets.standard_frontline[key];
      const nextValue = Number(input.value);
      state.targetDummy[key] = Number.isFinite(nextValue) ? Math.max(min, nextValue) : fallback;
      refreshAll();
    });
  });

  els.tacticianLevel.addEventListener("input", () => {
    state.tacticianLevel = Number(els.tacticianLevel.value);
    els.tacticianLevelValue.textContent = String(state.tacticianLevel);
  });

  [
    [els.bonusAp, "apFlat"],
    [els.bonusAd, "adFlat"],
    [els.bonusAs, "asFlat"],
    [els.bonusDmgAmp, "damageAmp"],
  ].forEach(([input, key]) => {
    input.addEventListener("input", () => {
      state.bonusStats[key] = Number(input.value || 0);
      refreshAll();
    });
  });

  els.displayDpsToggle.addEventListener("change", () => {
    state.showDpsColumns = els.displayDpsToggle.checked;
    renderTableHeaders();
    renderTable();
  });

  renderGlobalBuffControls();
}

function renderGlobalBuffControls() {
  const buffOptions = getSelectableBuffs().map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  const rowsHtml = Array.from({ length: MAX_GLOBAL_BUFFS }, (_, index) => {
    const extra = extras.find((candidate) => candidate.id === state.globalBuffIds[index]);
    const meta = getBuffMeta(extra);
    const levels = meta.levels.map((level) => `<option value="${level}" ${state.globalBuffLevels[index] === level ? "selected" : ""}>${level}</option>`).join("");
    const paramValue = state.globalBuffParams[index].value ?? meta.param.defaultValue;
    const disabled = extra ? "" : "disabled";
    const label = extra ? meta.param.label : "\u53c2\u6570";
    const value = extra ? paramValue : 0;
    const min = extra ? meta.param.min : 0;
    const max = extra ? meta.param.max : 0;
    const step = extra ? meta.param.step : 1;
    const hiddenClass = index < state.numberOfBuffs ? "" : "buff-row-hidden";

    return `
      <div class="buff-row ${hiddenClass}" data-buff-row="${index}">
        <div class="buff-row-grid">
          <label class="field buff-main-field">
            <span class="field-label">Buff ${index + 1}</span>
            <select class="field-control dark" data-buff-select="${index}">
              ${buffOptions}
            </select>
          </label>
          <label class="field buff-level-field">
            <span class="field-label">Level</span>
            <select class="field-control dark" data-buff-level="${index}" ${disabled}>
              ${levels}
            </select>
          </label>
          <label class="field buff-aux-field">
            <span class="field-label" data-buff-param-label="${index}">${label}</span>
            <input data-buff-param="${index}" type="number" class="field-control dark" min="${min}" max="${max}" step="${step}" value="${value}" ${disabled} />
          </label>
        </div>
      </div>
    `;
  }).join("");

  els.globalBuffList.innerHTML = rowsHtml;

  els.globalBuffList.querySelectorAll("[data-buff-select]").forEach((select) => {
    const index = Number(select.dataset.buffSelect);
    select.value = state.globalBuffIds[index];
    select.addEventListener("change", () => {
      state.globalBuffIds[index] = select.value;
      const currentExtra = extras.find((extra) => extra.id === select.value);
      const meta = getBuffMeta(currentExtra);
      state.globalBuffLevels[index] = meta.levels[0];
      state.globalBuffParams[index] = { value: meta.param.defaultValue };
      refreshAll();
    });
  });

  els.globalBuffList.querySelectorAll("[data-buff-level]").forEach((select) => {
    const index = Number(select.dataset.buffLevel);
    select.addEventListener("change", () => {
      state.globalBuffLevels[index] = Number(select.value);
      refreshAll();
    });
  });

  els.globalBuffList.querySelectorAll("[data-buff-param]").forEach((input) => {
    const index = Number(input.dataset.buffParam);
    input.addEventListener("input", () => {
      state.globalBuffParams[index] = { value: Number(input.value || 0) };
      refreshAll();
    });
  });
}

function renderCategoryTabs() {
  els.categoryTabs.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-tab ${category.id === state.categoryId ? "active" : ""}`;
    button.textContent = category.label;
    button.addEventListener("click", () => {
      state.categoryId = category.id;
      state.selectedExtras.clear();
      refreshAll();
    });
    els.categoryTabs.appendChild(button);
  });
}

function computeRows() {
  const hero = getHero();
  const target = getTargetDummy();
  const baselineExtra = getBaselineExtra();
  const rows = getExtrasForCurrentCategory().map((extra) => {
    const candidateExtra = buildCombinedExtra([baselineExtra, extra], `${baselineExtra.name} + ${extra.name}`);
    return {
      extra,
      ...simulateComparison({
        hero,
        starLevel: state.starLevel,
        extra: candidateExtra,
        baselineExtra,
        target,
        duration: 25,
      }),
    };
  });

  rows.sort((left, right) => {
    if (right.candidate.summary.damageAt20 !== left.candidate.summary.damageAt20) {
      return right.candidate.summary.damageAt20 - left.candidate.summary.damageAt20;
    }
    if (right.candidate.summary.damageAt25 !== left.candidate.summary.damageAt25) {
      return right.candidate.summary.damageAt25 - left.candidate.summary.damageAt25;
    }
    if (right.candidate.summary.dpsAt15 !== left.candidate.summary.dpsAt15) {
      return right.candidate.summary.dpsAt15 - left.candidate.summary.dpsAt15;
    }
    return right.candidate.summary.dpsAt5 - left.candidate.summary.dpsAt5;
  });

  state.rowResults = rows;
  state.baseline = rows[0]?.baseline ?? null;
}

function renderHeaderAndStats() {
  const hero = getHero();
  const target = getTargetDummy();
  const stats = getComputedHeroStats();
  const role = roleDefaults[hero.role];
  const baseAd = hero.base.ad[state.starLevel - 1];
  const baseAs = hero.base.as;
  const bonusAs = stats.as - baseAs;
  const bonusAp = stats.ap - 1;
  const bonusDmgAmp = stats.damageAmp - 1;
  const bonusCrit = stats.critChance - 0.25;
  const bonusCritDmg = stats.critDamage - 1.4;
  const bonusManaRegen = stats.manaRegen - role.manaRegenPerSecond;
  const bonusManaPerAttack = stats.manaPerAttack - role.manaPerAttack;

  els.heroVsTitle.textContent = `${hero.name} ${state.starLevel} vs ${target.hp} HP, ${target.armor} ${UI_TEXT.armor}, ${target.mr} ${UI_TEXT.mr}`;

  const lines = [
    [UI_TEXT.attack, `${formatNumber(stats.ad, 1)} = ${formatNumber(baseAd, 1)} * `, `${formatNumber(stats.ad / baseAd, 2)} ${UI_TEXT.attackStat}`],
    [UI_TEXT.attackSpeed, `${formatNumber(stats.as, 2)} = ${formatNumber(baseAs, 2)} * (1 + `, `${formatNumber(bonusAs, 2)} ${UI_TEXT.attackSpeedStat})`],
    [UI_TEXT.ap, `${formatNumber(stats.ap, 2)} = 1 + `, `${formatNumber(bonusAp, 2)} ${UI_TEXT.apStat}`],
    ["Crit Chance:", `${formatNumber(stats.critChance, 2)} = 0.25 + `, `${formatNumber(bonusCrit, 2)} Crit`],
    ["DmgAmp:", `${formatNumber(stats.damageAmp, 2)} = 1 + `, `${formatNumber(bonusDmgAmp, 2)} DmgAmp`],
    ["Crit Dmg:", `${formatNumber(stats.critDamage, 2)} = 1.4 + `, `${formatNumber(bonusCritDmg, 2)} CritDmg`],
    [UI_TEXT.mana, `${stats.manaStart} / ${stats.manaMax}`, ""],
    ["ManaPerAttack:", `${formatNumber(stats.manaPerAttack, 2)} = ${role.manaPerAttack} + `, `${formatNumber(bonusManaPerAttack, 2)} ${UI_TEXT.manaText}`],
    [UI_TEXT.manaRegen, `${formatNumber(stats.manaRegen, 2)} = ${role.manaRegenPerSecond} + `, `${formatNumber(bonusManaRegen, 2)} ${UI_TEXT.manaText}`],
    ["Role:", toRoleLabel(hero.role), ""],
    ["CastTime:", `${formatNumber(stats.castTime, 1)} seconds`, ""],
    ["Can SpellCrit:", stats.spellCrit ? "True" : "False", ""],
  ];

  els.baseStatsGrid.innerHTML = lines
    .map(
      ([label, main, extra]) => `
        <div class="stat-line">
          <span class="stat-name">${label}</span>
          <span class="stat-primary">${main}</span>
          ${extra ? `<span class="stat-secondary">${extra}</span>` : ""}
        </div>
      `,
    )
    .join("");
}

function toRoleLabel(role) {
  const labels = {
    tank: "Tank",
    fighter: "Fighter",
    caster: "Caster",
    marksman: "Marksman",
    assassin: "Assassin",
  };
  return labels[role] ?? role;
}

function renderTableHeaders() {
  els.colFive.textContent = state.showDpsColumns ? "DPS at 5" : UI_TEXT.displayFive;
  els.colFifteen.textContent = state.showDpsColumns ? "DPS at 15" : UI_TEXT.displayFifteen;
}

function getFiveColumnValue(summary) {
  return state.showDpsColumns ? summary.dpsAt5 : summary.damageAt5;
}

function getFifteenColumnValue(summary) {
  return state.showDpsColumns ? summary.dpsAt15 : summary.damageAt15;
}

function renderTable() {
  els.resultsBody.innerHTML = "";

  state.rowResults.forEach((row) => {
    const checked = state.selectedExtras.has(row.extra.id);
    const summary = row.candidate.summary;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.extra.order ?? ""}</td>
      <td>${row.extra.name}</td>
      <td>${formatNumber(getFiveColumnValue(summary))}</td>
      <td>${formatNumber(summary.damageAt10)}</td>
      <td>${formatNumber(getFifteenColumnValue(summary))}</td>
      <td>${formatNumber(summary.damageAt20)}</td>
      <td>${formatNumber(summary.damageAt25)}</td>
      <td>${formatNumber(summary.extraOutput25)}</td>
      <td class="checkbox-cell"><input type="checkbox" data-extra-id="${row.extra.id}" ${checked ? "checked" : ""}></td>
    `;
    els.resultsBody.appendChild(tr);
  });

  els.resultsBody.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const extraId = event.currentTarget.dataset.extraId;
      if (event.currentTarget.checked) state.selectedExtras.add(extraId);
      else state.selectedExtras.delete(extraId);
      renderCharts();
    });
  });
}

function renderCharts() {
  const selectedRows = state.rowResults.filter((row) => state.selectedExtras.has(row.extra.id));
  if (selectedRows.length === 0 || !state.baseline) {
    els.chartPanel.classList.add("hidden");
    return;
  }

  els.chartPanel.classList.remove("hidden");
  const hero = getHero();
  const datasets = [
    {
      id: "baseline",
      shortLabel: "Baseline",
      result: state.baseline,
      color: LINE_COLORS[0],
    },
    ...selectedRows.map((row, index) => ({
      id: row.extra.id,
      shortLabel: `${row.extra.order}: ${row.extra.name}`,
      result: row.candidate,
      color: LINE_COLORS[(index + 1) % LINE_COLORS.length],
    })),
  ];

  drawDamageChart(datasets, `${hero.name} ${state.starLevel} Damage Chart`);
  populateLogSelect(datasets);
}

function drawDamageChart(datasets, title) {
  const svg = els.damageChart;
  svg.innerHTML = "";

  const width = 960;
  const height = 600;
  const margin = { top: 76, right: 28, bottom: 78, left: 90 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxDamage = Math.max(...datasets.flatMap((set) => set.result.timeline.map((point) => point.cumulativeDamage)), 100);

  const createSvg = (tag, attrs = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  svg.appendChild(createSvg("rect", { x: 0, y: 0, width, height, fill: "#0e1117", rx: 18 }));

  const titleNode = createSvg("text", {
    x: width / 2,
    y: 36,
    fill: "#f4f7fb",
    "font-size": 28,
    "text-anchor": "middle",
  });
  titleNode.textContent = title;
  svg.appendChild(titleNode);

  for (let i = 0; i <= 5; i += 1) {
    const y = margin.top + (innerHeight / 5) * i;
    svg.appendChild(
      createSvg("line", {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        stroke: "#2a303b",
        "stroke-width": 1,
      }),
    );
    const label = createSvg("text", {
      x: margin.left - 18,
      y: y + 6,
      fill: "#d0d6df",
      "font-size": 16,
      "text-anchor": "end",
    });
    label.textContent = Math.round(maxDamage - (maxDamage / 5) * i).toLocaleString();
    svg.appendChild(label);
  }

  for (let i = 0; i <= 6; i += 1) {
    const x = margin.left + (innerWidth / 6) * i;
    svg.appendChild(
      createSvg("line", {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: height - margin.bottom,
        stroke: "#2a303b",
        "stroke-width": 1,
      }),
    );
    const label = createSvg("text", {
      x,
      y: height - 34,
      fill: "#d0d6df",
      "font-size": 16,
      "text-anchor": "middle",
    });
    label.textContent = String(Math.round((25 / 6) * i));
    svg.appendChild(label);
  }

  const xLabel = createSvg("text", {
    x: width / 2,
    y: height - 4,
    fill: "#eef2f7",
    "font-size": 18,
    "text-anchor": "middle",
  });
  xLabel.textContent = "Time (s)";
  svg.appendChild(xLabel);

  const yLabel = createSvg("text", {
    x: 34,
    y: height / 2,
    fill: "#eef2f7",
    "font-size": 18,
    transform: `rotate(-90 34 ${height / 2})`,
    "text-anchor": "middle",
  });
  yLabel.textContent = "Damage";
  svg.appendChild(yLabel);

  const legendBox = createSvg("rect", {
    x: 56,
    y: 84,
    width: 222,
    height: 28 + datasets.length * 28,
    fill: "rgba(18, 21, 28, 0.9)",
    rx: 4,
    stroke: "#202733",
  });
  svg.appendChild(legendBox);

  datasets.forEach((dataset, index) => {
    const stepPoints = buildStepPoints(dataset.result.timeline, margin, innerWidth, innerHeight, maxDamage);
    svg.appendChild(
      createSvg("polyline", {
        points: stepPoints,
        fill: "none",
        stroke: dataset.color,
        "stroke-width": 4,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      }),
    );

    const legendY = 108 + index * 28;
    svg.appendChild(
      createSvg("line", {
        x1: 76,
        y1: legendY,
        x2: 120,
        y2: legendY,
        stroke: dataset.color,
        "stroke-width": 4,
      }),
    );

    const legendText = createSvg("text", {
      x: 130,
      y: legendY + 6,
      fill: "#f3f6fb",
      "font-size": 15,
    });
    legendText.textContent = dataset.shortLabel;
    svg.appendChild(legendText);
  });
}

function buildStepPoints(timeline, margin, innerWidth, innerHeight, maxDamage) {
  if (!timeline.length) return "";

  const points = [];
  const toCoord = (time, damage) => {
    const x = margin.left + (time / 25) * innerWidth;
    const y = margin.top + innerHeight - (damage / maxDamage) * innerHeight;
    return [x, y];
  };

  let [prevX, prevY] = toCoord(timeline[0].time, timeline[0].cumulativeDamage);
  points.push(`${prevX},${prevY}`);

  for (let index = 1; index < timeline.length; index += 1) {
    const point = timeline[index];
    const [nextX, nextY] = toCoord(point.time, point.cumulativeDamage);
    points.push(`${nextX},${prevY}`);
    points.push(`${nextX},${nextY}`);
    prevX = nextX;
    prevY = nextY;
  }

  return points.join(" ");
}

function populateLogSelect(datasets) {
  const currentValue = els.logSelect.value;
  els.logSelect.innerHTML = datasets.map((dataset) => `<option value="${dataset.id}">${dataset.shortLabel}</option>`).join("");
  els.logSelect.value = datasets.some((dataset) => dataset.id === currentValue) ? currentValue : datasets[1]?.id ?? datasets[0]?.id;
  els.logSelect.onchange = () => renderLogAndDonut(datasets);
  renderLogAndDonut(datasets);
}

function renderLogAndDonut(datasets) {
  const selectedId = els.logSelect.value || datasets[0]?.id;
  const selected = datasets.find((dataset) => dataset.id === selectedId) ?? datasets[0];
  if (!selected) return;

  els.logBody.innerHTML = selected.result.eventLog
    .slice(0, 14)
    .map(
      (entry) =>
        `<tr><td>${formatNumber(entry.time)}</td><td>${formatNumber(entry.damage)}</td><td>${entry.type}</td><td>${formatNumber(entry.attackSpeed)}</td><td>${entry.manaState}</td></tr>`,
    )
    .join("");

  let accumulated = 0;
  const gradientStops = selected.result.damageDistribution.map((part) => {
    const start = accumulated;
    accumulated += part.percent;
    return `${part.color} ${start}% ${accumulated}%`;
  });
  els.donutChart.style.background = `conic-gradient(${gradientStops.join(", ")})`;

  els.donutLegend.innerHTML = selected.result.damageDistribution
    .map(
      (part) =>
        `<div class="legend-row"><span class="legend-swatch" style="background:${part.color}"></span><span>${part.label}</span><strong>${formatNumber(part.percent)}%</strong></div>`,
    )
    .join("");
}

function refreshAll() {
  renderGlobalBuffControls();
  renderCategoryTabs();
  renderTableHeaders();
  computeRows();
  renderHeaderAndStats();
  renderTable();
  renderCharts();
}

initControls();
refreshAll();
