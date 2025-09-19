let gameState = {
  date: 1,
  time: "아침",
  playerMental: 100,
  characters: {
    saori: { affection: 0, mental: 100, alive:true },
    rie: { affection: 0, mental: 100, alive:true },
    misaki: { affection: 0, mental: 100, alive:true }
  },
  currentScene: "start",
  textIndex: 0,
  currentText: []
};

let currentSlot = null;

const gameScripts = {
  "start": {
    text: [
      "히로키는 전학 첫날, 기묘한 기분으로 아침을 맞이했다.",
      "무언가 불길한 기운이 학원 전체를 감싸고 있는 듯하다."
    ],
    choices: [
      { text:"교실로 향한다", action:()=>changeScene("day1_morning") }
    ]
  },
  "day1_morning": {
    text: [
      "교실 안에서는 학생들이 속삭이고 있다.",
      "사오리와 리에가 눈에 띈다."
    ],
    choices: [
      { text:"사오리와 대화한다", action:()=>talkTo("saori") },
      { text:"리에와 대화한다", action:()=>talkTo("rie") }
    ]
  }
};

function displayText(texts){
  gameState.currentText = texts;
  gameState.textIndex = 0;
  nextText();
}

function nextText(){
  if(gameState.textIndex < gameState.currentText.length){
    typeText(gameState.currentText[gameState.textIndex]);
    gameState.textIndex++;
  } else {
    showChoices();
  }
}

function typeText(text){
  const textBox = document.getElementById("textBox");
  textBox.innerHTML = "";
  let i=0;
  function addChar(){
    if(i<text.length){
      textBox.innerHTML += text[i];
      i++;
      setTimeout(addChar,40);
    }
  }
  addChar();
}

function showChoices(){
  const scene = gameScripts[gameState.currentScene];
  const container = document.getElementById("choices-container");
  container.innerHTML = "";
  scene.choices.forEach(choice=>{
    let btn=document.createElement("button");
    btn.className="choice-btn";
    btn.textContent=choice.text;
    btn.onclick=()=>choice.action();
    container.appendChild(btn);
  });
}

function changeScene(sceneName){
  gameState.currentScene = sceneName;
  displayText(gameScripts[sceneName].text);
}

function talkTo(name){
  gameState.characters[name].affection += 1;
  showAffectionChange(name+" 호감도 +1");
  updateUI();
  nextDay();
}

function nextDay(){
  gameState.date++;
  gameState.time="아침";
  updateUI();
  displayText(["다음 날 아침이 밝았다."]);
}

function showAffectionChange(msg){
  const box=document.getElementById("affection-change");
  box.textContent=msg;
  box.style.display="block";
  setTimeout(()=>{ box.style.display="none"; },1500);
}

function updateUI(){
  document.getElementById("date").textContent=gameState.date+"일차";
  document.getElementById("time").textContent=gameState.time;
  document.getElementById("mental").textContent="정신력: "+gameState.playerMental;
  document.getElementById("saoriAffection").textContent=gameState.characters.saori.affection;
  document.getElementById("saoriMental").textContent=gameState.characters.saori.mental;
  document.getElementById("rieAffection").textContent=gameState.characters.rie.affection;
  document.getElementById("rieMental").textContent=gameState.characters.rie.mental;
  document.getElementById("misakiAffection").textContent=gameState.characters.misaki.affection;
  document.getElementById("misakiMental").textContent=gameState.characters.misaki.mental;
}

function handleSaveSlot(slot){
  currentSlot = slot;
  document.getElementById("popup-overlay").style.display="flex";
}

function saveGame(){
  if(currentSlot){
    localStorage.setItem("saveSlot"+currentSlot, JSON.stringify(gameState));
    closePopup();
    displayText(["게임이 저장되었습니다."]);
  }
}

function loadGame(){
  if(currentSlot){
    let data = localStorage.getItem("saveSlot"+currentSlot);
    if(data){
      gameState = JSON.parse(data);
      closePopup();
      updateUI();
      displayText(["게임을 불러왔습니다."]);
    } else {
      displayText(["저장된 데이터가 없습니다."]);
    }
  }
}

function deleteGame(){
  if(currentSlot){
    localStorage.removeItem("saveSlot"+currentSlot);
    closePopup();
    displayText(["세이브 데이터가 삭제되었습니다."]);
  }
}

function closePopup(){ document.getElementById("popup-overlay").style.display="none"; }
function openMenu(){ document.getElementById("menu-overlay").style.display="flex"; updateUI(); }
function closeMenu(){ document.getElementById("menu-overlay").style.display="none"; }

window.onload=()=>{
  updateUI();
  displayText(gameScripts.start.text);
};
