// 게임 상태 변수들
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
    morningMeetings: {}, // 아침에 만난 캐릭터 기록
    afternoonMeetings: {}, // 오후에 만난 캐릭터 기록
    unlockedEndings: []
};

// 엔딩 목록
const endings = [
    '사라진 악몽', '하나의 행복', '최악이네', '맺어진 인연',
    '벗어난 악몽', '속박', '단꿈', '지킬 수 없는 약속',
    '정해진 결과', '영원한 굴레', '신뢰의 거짓', '탈출구',
    '카르마', '일상', '거부'
];

// 게임 스크립트 데이터 (내용을 추가해야 합니다)
const gameScripts = {
    start: {
        text: ["명문 사립 고등학교로 전학을 오게 된 히로키.", "새로운 환경에서의 첫날이 시작된다.", "하지만 이 학교에는 알 수 없는 비밀이 숨겨져 있었다..."],
        choices: [
            { text: "게임 시작", action: () => startDay1() }
        ]
    }
};

// 텍스트 출력 함수
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
    const textBox = document.getElementById('textBox');
    textBox.innerHTML = '';
    const words = text.split(' ');
    let wordIndex = 0;
    
    function addWord() {
        if (wordIndex < words.length) {
            textBox.innerHTML += words[wordIndex] + ' ';
            wordIndex++;
            setTimeout(addWord, 50); // 타이핑 속도 조절
        }
    }
    addWord();
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
    if (gameScripts[gameState.currentScene] && gameScripts[gameState.currentScene].choices) {
        showChoices(gameScripts[gameState.currentScene].choices);
    }
}

// 게임 시작
function startDay1() {
    gameState.day = 1;
    gameState.phase = 'morning';
    updateUI();
    displayText(["1일차 아침이 밝았다.", "새로운 학교에서의 첫날이 시작된다."]);
}

// UI 업데이트
function updateUI() {
    document.querySelector('.day-counter').textContent = `${gameState.day}일차`;
    
    const phaseNames = {
        morning: '아침',
        afternoon: '오후',
        night: '밤'
    };
    document.querySelector('.time-phase').textContent = phaseNames[gameState.phase];
    
    // 정신력 바 업데이트
    document.querySelector('.mental-fill').style.width = `${gameState.playerMental}%`;
    
    // 메뉴 정보 업데이트
    document.getElementById('playerMental').textContent = gameState.playerMental;
    document.getElementById('saoriAffection').textContent = gameState.characters.saori.affection;
    document.getElementById('rieAffection').textContent = gameState.characters.rie.affection;
    document.getElementById('misakiAffection').textContent = gameState.characters.misaki.affection;
    
    document.getElementById('saoriMental').textContent = gameState.characters.saori.mental;
    document.getElementById('rieMental').textContent = gameState.characters.rie.mental;
    document.getElementById('misakiMental').textContent = gameState.characters.misaki.mental;
}

// 호감도 변화 표시
function showAffectionChange(character, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');
    
    const sign = change > 0 ? '+' : '';
    changeText.textContent = `${character} 호감도 ${sign}${change}`;
    changeElement.style.display = 'block';
    
    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

// 메뉴 토글
function toggleMenu() {
    const menu = document.getElementById('menuOverlay');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    updateEndingList();
    // 매일 아침 갱신되는 텍스트 추가
    if (menu.style.display === 'block') {
        const affectionInfo = document.querySelector('.menu-section .menu-title');
        affectionInfo.innerHTML += '<small>(매일 아침 갱신)</small>';
    }
}

// 엔딩 목록 업데이트
function updateEndingList() {
    const endingList = document.getElementById('endingList');
    endingList.innerHTML = '';
    
    const savedEndings = JSON.parse(localStorage.getItem('nightmare_endings')) || [];
    
    endings.forEach(ending => {
        const endingItem = document.createElement('div');
        endingItem.className = 'ending-item';
        
        if (savedEndings.includes(ending)) {
            endingItem.textContent = ending;
            endingItem.onclick = () => replayEnding(ending);
        } else {
            endingItem.textContent = '???';
            endingItem.className += ' locked';
        }
        
        endingList.appendChild(endingItem);
    });
}

// 세이브/로드 기능
let currentSlotNumber = 1;

function handleSaveSlot(slot) {
    const saveData = localStorage.getItem(`nightmare_save_${slot}`);
    if (saveData) {
        currentSlotNumber = slot;
        document.getElementById('currentSlot').textContent = slot;
        document.getElementById('savePopup').style.display = 'flex';
    } else {
        saveGame(slot);
    }
}

function saveGame(slot) {
    const saveData = JSON.stringify(gameState);
    localStorage.setItem(`nightmare_save_${slot}`, saveData);
    
    const slotElement = document.querySelector(`.save-slot:nth-child(${slot})`);
    slotElement.classList.add('saved');
    slotElement.innerHTML = '✓';
    
    showMessage('게임이 저장되었습니다.');
}

function loadGameConfirm() {
    closeSavePopup();
    showConfirm('정말 불러오시겠습니까?\n현재 진행상황이 사라집니다.', () => {
        loadGame(currentSlotNumber);
        showMessage('게임을 불러왔습니다.');
    });
}

function deleteGameConfirm() {
    closeSavePopup();
    showConfirm('정말 삭제하시겠습니까?', () => {
        deleteGame(currentSlotNumber);
    });
}

function loadGame(slot) {
    const saveData = localStorage.getItem(`nightmare_save_${slot}`);
    if (saveData) {
        gameState = JSON.parse(saveData);
        updateUI();
        displayText(['게임을 불러왔습니다.']);
    }
}

function deleteGame(slot) {
    localStorage.removeItem(`nightmare_save_${slot}`);
    
    const slotElement = document.querySelector(`.save-slot:nth-child(${slot})`);
    slotElement.classList.remove('saved');
    slotElement.innerHTML = slot;
    
    showMessage('세이브 파일이 삭제되었습니다.');
}

function closeSavePopup() {
    document.getElementById('savePopup').style.display = 'none';
}

function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmYes').onclick = () => {
        callback();
        closeConfirmPopup();
    };
    document.getElementById('confirmPopup').style.display = 'flex';
}

function closeConfirmPopup() {
    document.getElementById('confirmPopup').style.display = 'none';
}

function confirmReset() {
    closeMenu();
    showConfirm('정말 게임을 초기화하시겠습니까?\n모든 세이브 파일과 해금된 엔딩이 삭제됩니다.', () => {
        resetGame();
    });
}

function resetGame() {
    for (let i = 1; i <= 3; i++) {
        localStorage.removeItem(`nightmare_save_${i}`);
        const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
        slotElement.classList.remove('saved');
        slotElement.innerHTML = i;
    }
    
    localStorage.removeItem('nightmare_endings');
    
    gameState = {
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
        unlockedEndings: []
    };
    
    updateUI();
    toggleMenu();
    displayText(['게임이 초기화되었습니다.']);
}

function showMessage(message) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');
    
    changeText.textContent = message;
    changeElement.style.display = 'block';
    
    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

function unlockEnding(endingName) {
    let savedEndings = JSON.parse(localStorage.getItem('nightmare_endings')) || [];
    if (!savedEndings.includes(endingName)) {
        savedEndings.push(endingName);
        localStorage.setItem('nightmare_endings', JSON.stringify(savedEndings));
        showMessage(`새 엔딩 해금: ${endingName}`);
    }
}

// 게임 초기화 및 로드
function initGame() {
    const savedEndings = JSON.parse(localStorage.getItem('nightmare_endings')) || [];
    gameState.unlockedEndings = savedEndings;
    
    displayText(gameScripts.start.text);
    updateUI();
    
    for (let i = 1; i <= 3; i++) {
        if (localStorage.getItem(`nightmare_save_${i}`)) {
            const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
            slotElement.classList.add('saved');
            slotElement.innerHTML = '✓';
        }
    }
}

window.onload = initGame;
