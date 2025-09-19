// 게임 상태 변수
let gameState = {
    day: 1,
    phase: 'morning',
    playerMental: 100,
    characters: {
        saori: { affection: 0, mental: 100, alive: true },
        rie: { affection: 0, mental: 100, alive: true },
        misaki: { affection: 0, mental: 100, alive: true }
    },
    currentScene: 'start',
    textIndex: 0,
    currentText: [],
    morningMeetings: {},
    afternoonMeetings: {},
    unlockedEndings: [],
    lastMentalUpdate: 1
};

// 엔딩 목록
const endings = [
    '사라진 악몽','하나의 행복','최악이네','맺어진 인연',
    '벗어난 악몽','속박','단꿈','지킬 수 없는 약속',
    '정해진 결과','영원한 굴레','신뢰의 거짓','탈출구',
    '카르마','일상','거부'
];

// 게임 스크립트
const gameScripts = {
    start: {
        text: [
            "명문 사립 고등학교로 전학을 오게 된 히로키.",
            "새로운 환경에서의 첫날이 시작된다.",
            "하지만 이 학교에는 알 수 없는 비밀이 숨겨져 있었다..."
        ],
        choices: [
            { text: "게임 시작", action: () => startDay1() }
        ]
    },
    day1_morning: {
        text: [
            "1일차 아침이 밝았다.",
            "새로운 학교에서의 첫날이 시작된다.",
            "복도에서 누군가와 마주쳤다."
        ],
        choices: [
            { text: "사오리와 대화하기", action: () => meetCharacter('saori', 'morning', 5) },
            { text: "리에와 대화하기", action: () => meetCharacter('rie', 'morning', 5) },
            { text: "미사키와 대화하기", action: () => meetCharacter('misaki', 'morning', 5) }
        ]
    }
};

// 캐릭터 만남
function meetCharacter(character, phase, affectionChange) {
    if (gameState[`${phase}Meetings`][character]) {
        displayText(["이미 오늘 이 시간에 만났습니다."]);
        return;
    }
    gameState[`${phase}Meetings`][character] = true;
    changeAffection(character, affectionChange);
    displayText([`${character}와 대화를 나누었다.`, "좋은 시간이었다."]);
}

// 호감도/정신력
function changeAffection(character, change) {
    if (gameState.characters[character]) {
        gameState.characters[character].affection += change;
        showAffectionChange(character, change);
        saveGameState();
    }
}

function changeMental(character, change) {
    if (character === 'player') {
        gameState.playerMental = Math.max(0, Math.min(100, gameState.playerMental + change));
        showMentalChange('히로키', change);
    } else if (gameState.characters[character]) {
        gameState.characters[character].mental = Math.max(0, Math.min(100, gameState.characters[character].mental + change));
        showMentalChange(character, change);
    }
    updateUI();
    saveGameState();
}

// 텍스트 출력
function displayText(textArray) {
    gameState.currentText = textArray;
    gameState.textIndex = 0;
    document.getElementById('textBox').innerHTML = '';
    document.getElementById('choicesContainer').innerHTML = '';
    nextText();
}

function nextText() {
    if (gameState.textIndex < gameState.currentText.length) {
        const text = gameState.currentText[gameState.textIndex];
        typeText(text);
        gameState.textIndex++;
    } else {
        showCurrentChoices();
    }
}

function typeText(text) {
    document.getElementById('textBox').innerHTML = text;
}

// 선택지 표시
function showChoices(choices) {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';
    choices.forEach(choice => {
        const choiceElement = document.createElement('div');
        choiceElement.className = 'choice';
        choiceElement.textContent = choice.text;
        choiceElement.onclick = choice.action;
        container.appendChild(choiceElement);
    });
}

function showCurrentChoices() {
    if (gameScripts[gameState.currentScene]?.choices) {
        showChoices(gameScripts[gameState.currentScene].choices);
    }
}

// 게임 시작
function startDay1() {
    gameState.day = 1;
    gameState.phase = 'morning';
    gameState.currentScene = 'day1_morning';
    updateDailyStatus();
    updateUI();
    displayText(gameScripts.day1_morning.text);
    saveGameState();
}

// 하루 상태 갱신
function updateDailyStatus() {
    if (gameState.day > gameState.lastMentalUpdate) {
        gameState.lastMentalUpdate = gameState.day;
        gameState.morningMeetings = {};
        gameState.afternoonMeetings = {};
        showMessage('새로운 하루가 시작되었습니다.');
    }
}

// UI 업데이트
function updateUI() {
    document.querySelector('.day-counter').textContent = `${gameState.day}일차`;
    const phaseNames = { morning: '아침', afternoon: '오후', night: '밤' };
    document.querySelector('.time-phase').textContent = phaseNames[gameState.phase];
    document.querySelector('.mental-fill').style.width = `${gameState.playerMental}%`;
    document.getElementById('playerMental').textContent = gameState.playerMental;
    document.getElementById('saoriAffection').textContent = gameState.characters.saori.affection;
    document.getElementById('rieAffection').textContent = gameState.characters.rie.affection;
    document.getElementById('misakiAffection').textContent = gameState.characters.misaki.affection;
    document.getElementById('saoriMental').textContent = gameState.characters.saori.mental;
    document.getElementById('rieMental').textContent = gameState.characters.rie.mental;
    document.getElementById('misakiMental').textContent = gameState.characters.misaki.mental;
}

// 호감도/정신력 표시
function showAffectionChange(character, change) {
    const el = document.getElementById('affectionChange');
    const txt = document.getElementById('affectionChangeText');
    const sign = change > 0 ? '+' : '';
    const names = { saori: '사오리', rie: '리에', misaki: '미사키' };
    txt.textContent = `${names[character]} 호감도 ${sign}${change}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 2000);
}

function showMentalChange(character, change) {
    const el = document.getElementById('affectionChange');
    const txt = document.getElementById('affectionChangeText');
    const sign = change > 0 ? '+' : '';
    txt.textContent = `${character} 정신력 ${sign}${change}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 2000);
}

// 메뉴 토글
function toggleMenu() {
    const menu = document.getElementById('menuOverlay');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    updateEndingList();
}

// 엔딩 목록
function updateEndingList() {
    const endingList = document.getElementById('endingList');
    endingList.innerHTML = '';
    endings.forEach(ending => {
        const item = document.createElement('div');
        item.className = 'ending-item';
        if (gameState.unlockedEndings.includes(ending)) {
            item.textContent = ending;
            item.onclick = () => replayEnding(ending);
        } else {
            item.textContent = '???';
            item.className += ' locked';
        }
        endingList.appendChild(item);
    });
}

function replayEnding(name) { showMessage(`${name} 엔딩을 다시 보는 기능은 추후 구현 예정입니다.`); }

// 세이브/로드/삭제
let currentSlotNumber = 1;
function handleSaveSlot(slot) {
    currentSlotNumber = slot;
    const saveData = localStorage.getItem(`nightmare_save_${slot}`);
    if (saveData) document.getElementById('savePopup').style.display = 'flex';
    else saveGame(slot);
}

function saveGame(slot) {
    try {
        localStorage.setItem(`nightmare_save_${slot}`, JSON.stringify(gameState));
        const slotEl = document.querySelector(`.save-slot:nth-child(${slot})`);
        slotEl.classList.add('saved'); slotEl.innerHTML = '✓';
        showMessage('게임이 저장되었습니다.');
    } catch { showMessage('저장 중 오류 발생'); }
}

function saveGameState() { localStorage.setItem('nightmare_autosave', JSON.stringify(gameState)); }
function loadGameConfirm() { closeSavePopup(); showConfirm('불러오시겠습니까?', () => loadGame(currentSlotNumber)); }
function deleteGameConfirm() { closeSavePopup(); showConfirm('삭제하시겠습니까?', () => deleteGame(currentSlotNumber)); }

function loadGame(slot) {
    const data = localStorage.getItem(`nightmare_save_${slot}`);
    if (data) { gameState = JSON.parse(data); updateUI(); displayText(['게임을 불러왔습니다.']); }
}

function deleteGame(slot) {
    localStorage.removeItem(`nightmare_save_${slot}`);
    const slotEl = document.querySelector(`.save-slot:nth-child(${slot})`);
    slotEl.classList.remove('saved'); slotEl.innerHTML = slot;
    showMessage('세이브 파일 삭제됨');
}

function closeSavePopup() { document.getElementById('savePopup').style.display = 'none'; }

function showConfirm(message, callback) {
    const popup = document.getElementById('confirmPopup');
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmYes').onclick = () => { callback(); closeConfirmPopup(); };
    popup.style.display = 'flex';
}

function closeConfirmPopup() { document.getElementById('confirmPopup').style.display = 'none'; }

function confirmReset() { showConfirm('게임 초기화?', () => resetGame()); }
function resetGame() {
    for (let i = 1; i <= 3; i++) { localStorage.removeItem(`nightmare_save_${i}`); 
        const slotEl = document.querySelector(`.save-slot:nth-child(${i})`);
        slotEl.classList.remove('saved'); slotEl.innerHTML = i;
    }
    localStorage.removeItem('nightmare_autosave'); localStorage.removeItem('nightmare_endings');
    gameState = { ...gameState, day:1, phase:'morning', playerMental:100, currentScene:'start', textIndex:0, currentText:[], morningMeetings:{}, afternoonMeetings:{}, unlockedEndings:[], lastMentalUpdate:1 };
    updateUI(); toggleMenu(); displayText(['게임이 초기화되었습니다.']); showCurrentChoices();
}

function showMessage(msg) { const el = document.getElementById('affectionChange'); const txt = document.getElementById('affectionChangeText'); txt.textContent = msg; el.style.display='block'; setTimeout(()=>el.style.display='none',2000); }

function unlockEnding(name) {
    if (!gameState.unlockedEndings.includes(name)) {
        gameState.unlockedEndings.push(name);
        localStorage.setItem('nightmare_endings', JSON.stringify(gameState.unlockedEndings));
        showMessage(`새 엔딩 해금: ${name}`);
        saveGameState();
    }
}

// 게임 초기화 및 자동 불러오기
function initGame() {
    const savedEndings = localStorage.getItem('nightmare_endings');
    if (savedEndings) gameState.unlockedEndings = JSON.parse(savedEndings);
    const autoSave = localStorage.getItem('nightmare_autosave');
    if (autoSave) { try { gameState = JSON.parse(autoSave); updateUI(); displayText(['게임을 계속합니다...']); } catch { displayText(gameScripts.start.text); } }
    else displayText(gameScripts.start.text);

    for (let i=1;i<=3;i++) if (localStorage.getItem(`nightmare_save_${i}`)) { const slotEl=document.querySelector(`.save-slot:nth-child(${i})`); slotEl.classList.add('saved'); slotEl.innerHTML='✓'; }
}

window.onload = initGame;
window.addEventListener('beforeunload', saveGameState);
