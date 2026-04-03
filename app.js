import { categories, extras, heroes, roleDefaults, targetPresets } from "./data.js";
import { simulateComparison } from "./simulation.js";

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
      damage: [0, 1, 2].map(
        (index) => (baseValues.ShadowHandMagicDamage?.[index] ?? 0) * (baseValues.NumActiveStrikes?.[index] ?? 1),
      ),
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
