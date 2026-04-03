const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadRuntime() {
  const generatedChampions = loadJson(path.join(ROOT, "data", "generated", "champions.json"));
  const generatedItems = loadJson(path.join(ROOT, "data", "generated", "items.json"));

  let dataCode = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
  let simulationCode = fs.readFileSync(path.join(ROOT, "simulation.js"), "utf8");
  let appCode = fs.readFileSync(path.join(ROOT, "app-current.js"), "utf8");

  dataCode = dataCode.replace(/^\s*export\s+const\s+/gm, "const ");
  simulationCode = simulationCode
    .replace(/^\s*import .*$/gm, "")
    .replace(/^\s*export\s+function\s+/gm, "function ");
  appCode = appCode
    .replace(/^\s*import .*$/gm, "")
    .replace(/\binitControls\(\);\s*refreshAll\(\);\s*$/m, "");

  const harness = `
${dataCode}
globalThis.__GENERATED_CHAMPIONS__ = ${JSON.stringify(generatedChampions)};
globalThis.__GENERATED_ITEMS__ = ${JSON.stringify(generatedItems)};
${simulationCode}
const document = { querySelector: () => ({ addEventListener(){}, classList:{ add(){}, remove(){} }, style:{}, innerHTML:"", textContent:"", value:"", appendChild(){}, querySelectorAll(){ return []; } }) };
${appCode}
globalThis.__testExports = {
  runtimeHeroes,
  generatedItemsCatalog,
  buildGeneratedItemExtra,
  buildCombinedExtra,
  simulateComparison,
  simulateSingle
};
`;

  const context = {
    console,
    globalThis: {},
    Math,
    JSON,
    Set,
    Map,
    Array,
  };
  context.global = context.globalThis;
  vm.createContext(context);
  vm.runInContext(harness, context, { filename: "runtime-harness.js" });
  return context.globalThis.__testExports;
}

function run() {
  const runtime = loadRuntime();
  const heroList = runtime.runtimeHeroes.filter((hero) => hero.cost === 5);
  const items = runtime.generatedItemsCatalog
    .map((item) => runtime.buildGeneratedItemExtra(item))
    .filter((item) => item.category === "generated-item");
  const itemById = new Map(items.map((item) => [item.id, item]));

  const target = { hp: 1800, armor: 100, mr: 100 };
  const duration = 25;
  const starLevel = 1;

  const anomalies = [];

  for (const hero of heroList) {
    const baseline = runtime.simulateSingle({
      hero,
      starLevel,
      extra: runtime.buildCombinedExtra([], "baseline"),
      target,
      duration,
    });

    const rows = items.map((item) => {
      const comparison = runtime.simulateComparison({
        hero,
        starLevel,
        extra: runtime.buildCombinedExtra([item], item.name),
        baselineExtra: runtime.buildCombinedExtra([], "baseline"),
        target,
        duration,
      });
      return {
        hero: hero.name,
        item: item.name,
        damage20: comparison.candidate.summary.damageAt20,
        damage25: comparison.candidate.summary.damageAt25,
        ratio: comparison.candidate.summary.extraOutput25,
        belowBaseline20: comparison.candidate.summary.damageAt20 < baseline.summary.damageAt20,
        belowBaseline25: comparison.candidate.summary.damageAt25 < baseline.summary.damageAt25,
      };
    });

    const negatives = rows.filter((row) => row.belowBaseline20 || row.belowBaseline25);
    if (negatives.length) {
      anomalies.push({ hero: hero.name, negatives });
    }
  }

  const scenarios = [
    {
      heroId: "tft17-jhin",
      baseline: ["TFT_Item_Deathblade"],
      label: "Jhin: Deathblade (armor 0)",
      target: { hp: 1800, armor: 0, mr: 100 },
    },
    {
      heroId: "tft17-jhin",
      baseline: ["TFT_Item_Deathblade", "TFT_Item_InfinityEdge"],
      label: "Jhin: Deathblade + Infinity Edge",
    },
    {
      heroId: "tft17-jhin",
      baseline: ["TFT_Item_Deathblade", "TFT_Item_PowerGauntlet"],
      label: "Jhin: Deathblade + Striker's Flail",
    },
  ];

  const scenarioResults = scenarios.map((scenario) => {
    const hero = heroList.find((entry) => entry.id === scenario.heroId);
    const baselineItems = scenario.baseline.map((id) => itemById.get(id)).filter(Boolean);
    const baselineExtra = runtime.buildCombinedExtra(baselineItems, "baseline");
    const scenarioTarget = scenario.target ?? target;
    const rows = items.map((item) => {
      const candidateExtra = runtime.buildCombinedExtra([baselineExtra, item], item.name);
      const comparison = runtime.simulateComparison({
        hero,
        starLevel,
        extra: candidateExtra,
        baselineExtra,
        target: scenarioTarget,
        duration,
      });
      return {
        apiName: item.id,
        item: item.name,
        damage20: comparison.candidate.summary.damageAt20,
        damage25: comparison.candidate.summary.damageAt25,
        ratio: comparison.candidate.summary.extraOutput25,
      };
    });

    rows.sort((a, b) => b.damage20 - a.damage20 || b.damage25 - a.damage25);
    return {
      label: scenario.label,
      top10: rows.slice(0, 10),
      blueBuff: rows.find((row) => row.apiName === "TFT_Item_BlueBuff"),
      infinityEdge: rows.find((row) => row.apiName === "TFT_Item_InfinityEdge"),
      strikersFlail: rows.find((row) => row.apiName === "TFT_Item_PowerGauntlet"),
    };
  });

  console.log(
    JSON.stringify(
      {
        anomalies,
        scenarioResults,
      },
      null,
      2,
    ),
  );
}

run();
