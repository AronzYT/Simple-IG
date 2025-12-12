// Initialize Decimal.js variables
let points = new Decimal(0);
let prestigePoints = new Decimal(0);

// Click mechanics
let clickValue = new Decimal(1);
let clickCooldown = 2; // seconds
let lastClick = Date.now() - clickCooldown * 1000;

// Upgrade mechanics
let cooldownUpgradeLevel = 0;
let buttonUpgradeLevel = 0;
let cooldownUpgradePrice = new Decimal(5);
let buttonUpgradePrice = new Decimal(2);

// Prestige tree
let prestigeTree = {
  "2x": false,
  "1s": false,
  "5x": false,
  "goldbomb": false
};
let goldBombActive = false;

// Code names
const codes = [
  "M","B","T","QA","QI","SX","ST","OC","NL",
  "DC","UD","DD","TD","QD","QU","SD","G"
];

// Format points using code names
function formatPoints(num){
  let dec = new Decimal(num);
  if(dec.greaterThanOrEqualTo(1e6)){
    let exp = Math.floor(Math.log10(dec.toNumber())/3) - 1;
    if(exp >= codes.length) exp = codes.length - 1;
    let value = dec.dividedBy(Decimal.pow(1000, exp+1)).toFixed(2);
    return `${value}${codes[exp]}`;
  }
  return dec.toFixed(0);
}

// NEW: Clean time formatting (removes floating errors)
function formatTime(t) {
  return Number(t.toFixed(2)).toString();
}

// Update UI
function updateDisplay(){
  document.getElementById("points").innerText = 
    `Points: ${formatPoints(points)}`;

  document.getElementById("prestige-points").innerText = 
    `Prestige Points: ${prestigePoints.toFixed(0)}`;

  document.getElementById("upgrade-cooldown").innerText = 
    `Upgrade Cooldown (${formatTime(clickCooldown)}s) - ${formatPoints(cooldownUpgradePrice)} pts`;

  document.getElementById("upgrade-button").innerText = 
    `Upgrade Button - ${formatPoints(buttonUpgradePrice)} pts`;

  saveGame();
}

// --- CLICK BUTTON ---
document.getElementById("click-button").addEventListener("click", ()=>{
  if(Date.now() - lastClick >= clickCooldown * 1000){
    let gain = clickValue;

    if(prestigeTree["2x"]) gain = gain.times(2);
    if(prestigeTree["5x"]) gain = gain.times(5);
    if(goldBombActive) gain = gain.times(100);

    points = points.plus(gain);

    // Gold Bomb 2% chance
    if(prestigeTree["goldbomb"] && Math.random() < 0.02){
      goldBombActive = true;
      setTimeout(()=>{ goldBombActive = false; }, 20000);
    }

    lastClick = Date.now();
    updateDisplay();
  }
});

// --- UPGRADE COOLDOWN ---
document.getElementById("upgrade-cooldown").addEventListener("click", ()=>{
  if(points.greaterThanOrEqualTo(cooldownUpgradePrice) && cooldownUpgradeLevel < 10){
    points = points.minus(cooldownUpgradePrice);
    cooldownUpgradeLevel++;

    // NEW: eliminates float errors
    clickCooldown = Math.max(0.1, Number((clickCooldown - 0.2).toFixed(2)));

    cooldownUpgradePrice = cooldownUpgradePrice.times(1.5);
    updateDisplay();
  }
});

// --- UPGRADE BUTTON ---
document.getElementById("upgrade-button").addEventListener("click", ()=>{
  if(points.greaterThanOrEqualTo(buttonUpgradePrice) && buttonUpgradeLevel < 1000){
    points = points.minus(buttonUpgradePrice);
    buttonUpgradeLevel++;
    clickValue = clickValue.times(1.2);
    buttonUpgradePrice = buttonUpgradePrice.times(1.2);
    updateDisplay();
  }
});

// --- PRESTIGE BUTTON (ALWAYS OPENS) ---
document.getElementById("prestige-button").addEventListener("click", ()=>{
  openPrestigeTree(); // <--- NEW
});

// --- PRESTIGE TREE MODAL ---
const modal = document.getElementById("prestige-modal");
const closeModal = document.getElementById("close-modal");

function openPrestigeTree(){ modal.style.display = "block"; }
closeModal.onclick = ()=> modal.style.display = "none";
window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

// --- Prestige feature ----
document.getElementById("prestige-reset").addEventListener("click", ()=>{
  if(points.greaterThanOrEqualTo(10000)){
    prestigePoints = prestigePoints.plus(2);

    points = new Decimal(0);
    clickValue = new Decimal(1);
    clickCooldown = 2;

    cooldownUpgradeLevel = 0;
    buttonUpgradeLevel = 0;

    cooldownUpgradePrice = new Decimal(5);
    buttonUpgradePrice = new Decimal(2);

    updateDisplay();
  }
});

// --- Prestige upgrades ---
document.getElementById("prestige-2x").addEventListener("click", ()=>{
  if(prestigePoints.greaterThanOrEqualTo(1) && !prestigeTree["2x"]){
    prestigePoints = prestigePoints.minus(1);
    prestigeTree["2x"] = true;
    updateDisplay();
  }
});

document.getElementById("prestige-1s").addEventListener("click", ()=>{
  if(prestigePoints.greaterThanOrEqualTo(3) && !prestigeTree["1s"]){
    prestigePoints = prestigePoints.minus(3);
    prestigeTree["1s"] = true;

    clickCooldown = 1.0; // start at 1s properly
    cooldownUpgradeLevel = Math.max(0, cooldownUpgradeLevel - 5);

    updateDisplay();
  }
});

document.getElementById("prestige-5x").addEventListener("click", ()=>{
  if(prestigePoints.greaterThanOrEqualTo(5) && !prestigeTree["5x"]){
    prestigePoints = prestigePoints.minus(5);
    prestigeTree["5x"] = true;
    updateDisplay();
  }
});

document.getElementById("prestige-goldbomb").addEventListener("click", ()=>{
  if(prestigePoints.greaterThanOrEqualTo(10) && !prestigeTree["goldbomb"]){
    prestigePoints = prestigePoints.minus(10);
    prestigeTree["goldbomb"] = true;
    updateDisplay();
  }
});

// --- AUTO-SAVE ---
function saveGame(){
  const saveData = {
    points: points.toString(),
    prestigePoints: prestigePoints.toString(),
    clickValue: clickValue.toString(),
    clickCooldown,
    cooldownUpgradeLevel,
    buttonUpgradeLevel,
    cooldownUpgradePrice: cooldownUpgradePrice.toString(),
    buttonUpgradePrice: buttonUpgradePrice.toString(),
    prestigeTree
  };
  localStorage.setItem("simpleIGSave", JSON.stringify(saveData));
}

// --- AUTO-LOAD ---
function loadGame(){
  const saveData = JSON.parse(localStorage.getItem("simpleIGSave"));
  if(saveData){
    points = new Decimal(saveData.points);
    prestigePoints = new Decimal(saveData.prestigePoints);
    clickValue = new Decimal(saveData.clickValue);
    clickCooldown = Number(saveData.clickCooldown);
    cooldownUpgradeLevel = saveData.cooldownUpgradeLevel;
    buttonUpgradeLevel = saveData.buttonUpgradeLevel;
    cooldownUpgradePrice = new Decimal(saveData.cooldownUpgradePrice);
    buttonUpgradePrice = new Decimal(saveData.buttonUpgradePrice);
    prestigeTree = saveData.prestigeTree;
  }
}

// Load + refresh
loadGame();
updateDisplay();

 