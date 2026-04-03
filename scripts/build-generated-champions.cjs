const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = process.cwd();
const CHAMPION_DIR = path.join(ROOT, "data", "source", "champions");
const ZH_DISPLAY_PATH = path.join(ROOT, "data", "source", "defaults", "zh-display.json5");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "champions.json");

function parseJson5Like(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return vm.runInNewContext(`(${text})`);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const zhDisplay = parseJson5Like(ZH_DISPLAY_PATH);

const roleMap = zhDisplay.roles || {};
const championMap = zhDisplay.champions || {};

const traitMap = {
  Anima: "\u5e7b\u7075\u6218\u961f",
  Arbiter: "\u4ef2\u88c1\u8005",
  Bastion: "\u575a\u5792\u536b\u58eb",
  Bulwark: "\u66ae\u5149\u94c1\u58c1",
  Challenger: "\u6311\u6218\u8005",
  Channeler: "\u5f15\u5bfc\u8005",
  Commander: "\u6307\u6325\u5b98",
  DarkLady: "\u9ed1\u6697\u9b54\u5973",
  "Dark Lady": "\u9ed1\u6697\u9b54\u5973",
  DarkStar: "\u6697\u661f",
  "Dark Star": "\u6697\u661f",
  DivineDuelist: "\u795e\u5723\u51b3\u6597\u5bb6",
  "Divine Duelist": "\u795e\u5723\u51b3\u6597\u5bb6",
  Doomer: "\u672b\u65e5\u4f7f\u8005",
  Eradicator: "\u6b7c\u706d\u8005",
  FactoryNew: "\u5168\u65b0\u51fa\u5382",
  "Factory New": "\u5168\u65b0\u51fa\u5382",
  Fateweaver: "\u7ec7\u547d\u8005",
  GalaxyHunter: "\u94f6\u6cb3\u730e\u624b",
  "Galaxy Hunter": "\u94f6\u6cb3\u730e\u624b",
  Marauder: "\u63a0\u593a\u8005",
  Mecha: "\u673a\u7532",
  Meeple: "\u7c73\u5b9d",
  "N.O.V.A.": "\u65b0\u661f",
  NOVA: "\u65b0\u661f",
  PartyAnimal: "\u6d3e\u5bf9\u52a8\u7269",
  "Party Animal": "\u6d3e\u5bf9\u52a8\u7269",
  Psionic: "\u7075\u80fd\u4f7f",
  Replicator: "\u590d\u5236\u4f53",
  Rogue: "\u6e38\u4fa0",
  Shepherd: "\u7267\u9b42\u4eba",
  Sniper: "\u72d9\u795e",
  SpaceGroove: "\u592a\u7a7a\u5f8b\u52a8",
  "Space Groove": "\u592a\u7a7a\u5f8b\u52a8",
  Stargazer: "\u89c2\u661f\u8005",
  Timebreaker: "\u65f6\u7a7a\u6218\u58eb",
  Vanguard: "\u5148\u950b",
  Voyager: "\u822a\u6d77\u8005",
};

const abilityMap = {
  "Asteroid Blaster": "\u9668\u661f\u7206\u7834",
  "Bubble Pop": "\u6ce1\u6ce1\u7206\u5f39",
  "Collateral Damage": "\u9644\u5e26\u4f24\u5bb3",
  "Cosmic Pursuit": "\u5b87\u5b99\u8ffd\u730e",
  "Dark Form": "\u9ed1\u6697\u5f62\u6001",
  "Deathbeam": "\u6b7b\u4ea1\u5149\u675f",
  "Fracture Reality": "\u5b9e\u754c\u6495\u88c2",
  "Lend Me a Hand, Shadow!": "\u6765\u642d\u628a\u624b\u5427\uff0c\u5f71\u5b50\uff01",
  "Party Crasher": "\u6d3e\u5bf9\u7838\u573a",
  "Perfect Bladework": "\u5b8c\u7f8e\u5251\u6280",
  "Psi Strikes": "\u7075\u80fd\u6253\u51fb",
  "Psionic Crush": "\u7075\u80fd\u78be\u538b",
  "Quantum Clone": "\u91cf\u5b50\u590d\u5236",
  "Reality Tear": "\u73b0\u5b9e\u6495\u88c2",
  "Singularity": "\u5947\u70b9",
  "Space Opera": "\u592a\u7a7a\u6b4c\u5267",
  "Stellar Ricochet": "\u661f\u5f39\u5f39\u5c04",
  "Time Warp": "\u65f6\u7a7a\u88c2\u65a9",
  "Ultra Friendly Object": "\u8d85\u7ea7\u53cb\u597d\u7269\u4f53",
};

function traitDisplayName(apiName) {
  return traitMap[apiName] || "\u5f85\u7ffb\u8bd1";
}

function championDisplay(apiName, fallback) {
  const display = championMap[apiName];
  if (!display) {
    return { name: fallback, shortName: fallback };
  }
  return {
    name: display.name || fallback,
    shortName: display.shortName || display.name || fallback,
  };
}

function roleDisplayName(apiName) {
  return roleMap[apiName] || "\u5f85\u7ffb\u8bd1";
}

function abilityDisplayName(rawName) {
  return abilityMap[rawName] || "\u5f85\u7ffb\u8bd1";
}

const champions = fs
  .readdirSync(CHAMPION_DIR)
  .filter((name) => /^tft17-.*\.json5$/.test(name) && name !== "_selection.json5")
  .sort()
  .map((fileName) => parseJson5Like(path.join(CHAMPION_DIR, fileName)))
  .map((champion) => {
    const display = championDisplay(champion.apiName, champion.identity.name);
    return {
      id: champion.id,
      apiName: champion.apiName,
      name: display.name,
      shortName: display.shortName,
      cost: champion.identity.cost,
      role: {
        apiName: champion.identity.role.apiName,
        name: roleDisplayName(champion.identity.role.apiName),
      },
      traits: (champion.identity.traits || []).map((trait) => ({
        apiName: trait,
        name: traitDisplayName(trait),
      })),
      avatarUrl: champion.identity.avatarUrl,
      stats: champion.stats,
      displayStatsByStar: {
        hp: champion.displayStatsByStar.hp,
        ad: champion.displayStatsByStar.ad,
        mana: champion.displayStatsByStar.mana,
        apDisplay: champion.displayStatsByStar.apDisplay,
      },
      ability: {
        name: abilityDisplayName(champion.ability.name),
        rawName: champion.ability.name,
        descriptionZh: null,
        descriptionRaw: champion.ability.description,
        baseValues: champion.ability.baseValues,
        spellCrit: champion.ability.spellCrit,
      },
    };
  });

writeJson(OUTPUT_PATH, champions);
console.log(`Generated ${champions.length} champions -> ${OUTPUT_PATH}`);
