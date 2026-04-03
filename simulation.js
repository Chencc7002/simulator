import { roleDefaults, simDefaults } from "./data.js";

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

export function simulateComparison({ hero, starLevel, extra, baselineExtra = null, target, duration = 25 }) {
  const baseline = simulateSingle({ hero, starLevel, extra: baselineExtra, target, duration });
  const candidate = simulateSingle({ hero, starLevel, extra, target, duration });

  candidate.summary.extraOutput25 =
    baseline.summary.damageAt25 > 0 ? round(candidate.summary.damageAt25 / baseline.summary.damageAt25, 2) : 0;

  return { baseline, candidate };
}

export function simulateSingle({ hero, starLevel, extra, target, duration = 25 }) {
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
