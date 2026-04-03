const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const LOOKUP_PATH = path.join(ROOT, "TFTSet17_pbe_en_us.json");
const ZH_ITEMS_PATH = path.join(ROOT, "data", "source", "defaults", "zh-items.json5");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "items.json");
const BROWSER_OUTPUT_PATH = path.join(ROOT, "data", "generated", "items.browser.js");

function parseJson5Like(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return vm.runInNewContext(`(${text})`);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeBrowserJs(filePath, variableName, value) {
  fs.writeFileSync(filePath, `globalThis.${variableName} = ${JSON.stringify(value, null, 2)};\n`, "utf8");
}

const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, "utf8"));
const zhItems = parseJson5Like(ZH_ITEMS_PATH);

const MANUAL_EFFECT_OVERRIDES = {
  TFT_Item_Leviathan: {
    AP: 15,
  },
  TFT_Item_RabadonsDeathcap: {
    AP: 55,
  },
};

const includeRoles = new Set([
  "ADFighter",
  "APCaster",
  "ADCarry",
  "ADSpecialist",
  "APReaper",
  "ADCaster",
  "ADReaper",
  "APCarry",
  "APFighter",
  "HFighter",
]);

const itemsByApi = new Map((lookup.items || []).map((item) => [item.apiName, item]));

const selectedApiNames = new Set();
for (const role of Object.values(lookup.roles || {})) {
  if (!includeRoles.has(role.apiName)) {
    continue;
  }

  for (const apiName of role.items || []) {
    const item = itemsByApi.get(apiName);
    if (!item) {
      continue;
    }
    if ((item.composition || []).length !== 2) {
      continue;
    }
    if ((item.tags || []).includes("Artifact")) {
      continue;
    }
    selectedApiNames.add(apiName);
  }
}

const output = [...selectedApiNames]
  .sort()
  .map((apiName) => {
    const item = itemsByApi.get(apiName);
    const zh = (zhItems.items && zhItems.items[apiName]) || {};
    const effects = {
      ...(item.effects || {}),
      ...(MANUAL_EFFECT_OVERRIDES[apiName] || {}),
    };

    return {
      apiName,
      name: zh.name || item.name,
      rawName: item.name,
      icon: item.icon,
      composition: (item.composition || []).map((componentApiName) => ({
        apiName: componentApiName,
        name:
          (zhItems.components && zhItems.components[componentApiName]) ||
          componentApiName,
      })),
      effects,
      descRaw: item.desc || "",
      tags: item.tags || [],
    };
  });

writeJson(OUTPUT_PATH, output);
writeBrowserJs(BROWSER_OUTPUT_PATH, "__GENERATED_ITEMS__", output);
console.log(`Generated ${output.length} items -> ${OUTPUT_PATH}`);
