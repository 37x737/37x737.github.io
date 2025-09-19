// 게임 상태 변수
let gameState = {
    day: 1,
    phase: 'morning', // morning, afternoon, night
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
    '사라진 악몽', '하나의 행복', '최악이네', '맺어진 인연',
    '벗어난 악몽', '속박', '단꿈', '지킬 수 없는 약속',
    '정해진 결과', '영원한 굴레', '신뢰의 거짓', '탈출구',
    '카르마', '일상', '거부'
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

// 캐릭터와 만남
function meetCharacter(character, phase, affectionChange) {
    const meetingRecord = phase === 'morning' ? gameState.morningMeetings : gameState.afternoonMeetings;
    if (meetingRecord[character]) {
        displayText(["이미 오늘 이 시간에 만났습니다."]);
        return;
    }
    meetingRecord[character] = true;
    changeAffection(character, affectionChange);
    displayText([`${character}와 대화를 나누었다.`, "좋은 시간이었다."]);
}

// 호감도/정신력 변화
function changeAffection(character, change) {
    if (!gameState.characters[character]) return;
    gameState.characters[character].affection += change;
    showAffectionChange(character, change);
    saveGameState();
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
        document.getElementById('textBox').textContent = gameState.currentText[gameState.textIndex];
        gameState.textIndex++;
    } else {
        showCurrentChoices();
    }
}

// 선택지 표시
function showChoices(choices) {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';
    choices.forEach(choice => {
        const el = document.createElement('button');
        el.textContent = choice.text;
        el.className = 'choice';
        el.onclick = choice.action;
        container.appendChild(el);
    });
}

function showCurrentChoices() {
    const scene = gameScripts[gameState.currentScene];
    if (scene && scene.choices) showChoices(scene.choices);
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

// 매일 상태 갱신
function updateDailyStatus() {
    if (gameState.day > gameState.lastMentalUpdate) {
        gameState.lastMentalUpdate = gameState.day;
        gameState.morningMeetings = {};
        gameState.afternoonMeetings = {};
        showMessage('새로운 하루가 시작되었습니다. 상태가 갱신되었습니다.');
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

// 변화 표시
function showAffectionChange(character, change) {
    const elem = document.getElementById('affectionChange');
    document.getElementById('affectionChangeText').textContent = `${character} 호감도 ${change>0?'+':''}${change}`;
    elem.style.display = 'block';
    setTimeout(() => elem.style.display = 'none', 2000);
}

function showMentalChange(character, change) {
    const elem = document.getElementById('affectionChange');
    document.getElementById('affectionChangeText').textContent = `${character} 정신력 ${change>0?'+':''}${change}`;
    elem.style.display = 'block';
    setTimeout(() => elem.style.display = 'none', 2000);
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
    endings.forEach(e => {
        const el = document.createElement('div');
        el.className = 'ending-item';
        el.textContent = gameState.unlockedEndings.includes(e) ? e : '???';
        el.onclick = gameState.unlockedEndings.includes(e) ? () => replayEnding(e) : null;
        endingList.appendChild(el);
    });
}

function replayEnding(name) { showMessage(`${name} 엔딩을 다시 보는 기능은 추후 구현 예정입니다.`); }

// 세이브/로드
let currentSlotNumber = 1;

function saveGame(slot) {
    localStorage.setItem(`nightmare_save_${slot}`, JSON.stringify(gameState));
    const slotEl = document.querySelector(`.save-slot:nth-child(${slot})`);
    slotEl.classList.add('saved'); slotEl.textContent = '✓';
    showMessage('게임이 저장되었습니다.');
}

function saveGameState() { localStorage.setItem('nightmare_autosave', JSON.stringify(gameState)); }

function loadGame(slot) {
    const data = localStorage.getItem(`nightmare_save_${slot}`);
    if (!data) return showMessage('저장 파일이 없습니다.');
    gameState = JSON.parse(data); updateUI(); displayText(['게임을 불러왔습니다.']);
}

// 메시지/팝업
function showMessage(msg) {
    const elem = document.getElementById('affectionChange');
    document.getElementById('affectionChangeText').textContent = msg;
    elem.style.display = 'block';
    setTimeout(() => elem.style.display = 'none', 2000);
}

// 초기화 & 자동불러오기
function initGame() {
    const savedEndings = localStorage.getItem('nightmare_endings');
    if (savedEndings) gameState.unlockedEndings = JSON.parse(savedEndings);
    const autoSave = localStorage.getItem('nightmare_autosave');
    if (autoSave) gameState = JSON.parse(autoSave);
    updateUI(); displayText(gameScripts.start.text); showCurrentChoices();
}

window.onload = initGame;
window.addEventListener('beforeunload', saveGameState);
