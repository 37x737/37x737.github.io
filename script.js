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
    unlockedEndings: [],
    lastMentalUpdate: 1 // 마지막으로 멘탈/호감도를 갱신한 날
};

// 엔딩 목록
const endings = [
    '사라진 악몽', '하나의 행복', '최악이네', '맺어진 인연', 
    '벗어난 악몽', '속박', '단꿈', '지킬 수 없는 약속',
    '정해진 결과', '영원한 굴레', '신뢰의 거짓', '탈출구',
    '카르마', '일상', '거부'
];

// 게임 스크립트 데이터
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
            { 
                text: "사오리와 대화하기", 
                action: () => meetCharacter('saori', 'morning', 5) 
            },
            { 
                text: "리에와 대화하기", 
                action: () => meetCharacter('rie', 'morning', 5) 
            },
            { 
                text: "미사키와 대화하기", 
                action: () => meetCharacter('misaki', 'morning', 5) 
            }
        ]
    }
};

// 캐릭터와 만나는 함수
function meetCharacter(character, phase, affectionChange) {
    if (gameState[`${phase}Meetings`][character]) {
        displayText(["이미 오늘 이 시간에 만났습니다."]);
        return;
    }
    
    gameState[`${phase}Meetings`][character] = true;
    changeAffection(character, affectionChange);
    
    displayText([
        `${character}와 대화를 나누었다.`,
        "좋은 시간이었다."
    ]);
}

// 호감도/정신력 변화 함수
function changeAffection(character, change) {
    if (gameState.characters[character]) {
        gameState.characters[character].affection += change;
        showAffectionChange(character, change);
        saveGameState(); // 변화 즉시 저장
    }
}

function changeMental(character, change) {
    if (character === 'player') {
        gameState.playerMental += change;
        gameState.playerMental = Math.max(0, Math.min(100, gameState.playerMental));
        showMentalChange('히로키', change);
    } else if (gameState.characters[character]) {
        gameState.characters[character].mental += change;
        gameState.characters[character].mental = Math.max(0, Math.min(100, gameState.characters[character].mental));
        showMentalChange(character, change);
    }
    updateUI();
    saveGameState(); // 변화 즉시 저장
}

// 텍스트 출력 함수
function displayText(textArray) {
    gameState.currentText = textArray;
    gameState.textIndex = 0;
    const textBox = document.getElementById('textBox');
    const choicesContainer = document.getElementById('choicesContainer');
    if (textBox) textBox.innerHTML = '';
    if (choicesContainer) choicesContainer.innerHTML = '';
    nextText();
}

function nextText() {
    if (gameState.textIndex < gameState.currentText.length) {
        const text = gameState.currentText[gameState.textIndex];
        typeText(text);
        gameState.textIndex++;
    } else {
        // 모든 텍스트가 출력되면 선택지 표시
        showCurrentChoices();
    }
}

function typeText(text) {
    const textBox = document.getElementById('textBox');
    if (textBox) textBox.innerHTML = text;
}

// 선택지 표시
function showChoices(choices) {
    const container = document.getElementById('choicesContainer');
    if (!container) return;
    container.innerHTML = '';
    
    choices.forEach(choice => {
        const choiceElement = document.createElement('div');
        choiceElement.className = 'choice';
        choiceElement.textContent = choice.text;
        choiceElement.onclick = () => {
            choice.action();
        };
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
    gameState.currentScene = 'day1_morning';
    updateDailyStatus();
    updateUI();
    displayText(gameScripts.day1_morning.text);
    saveGameState();
}

// 매일 아침 상태 갱신
function updateDailyStatus() {
    if (gameState.day > gameState.lastMentalUpdate) {
        // 새로운 날이므로 상태 갱신
        gameState.lastMentalUpdate = gameState.day;
        
        // 만난 캐릭터 기록 초기화
        gameState.morningMeetings = {};
        gameState.afternoonMeetings = {};
        
        showMessage('새로운 하루가 시작되었습니다. 상태가 갱신되었습니다.');
    }
}

// UI 업데이트
function updateUI() {
    const dayCounter = document.querySelector('.day-counter');
    if (dayCounter) dayCounter.textContent = `${gameState.day}일차`;
    
    const phaseNames = {
        morning: '아침',
        afternoon: '오후',
        night: '밤'
    };
    const phaseElement = document.querySelector('.time-phase');
    if (phaseElement) phaseElement.textContent = phaseNames[gameState.phase];
    
    const mentalFill = document.querySelector('.mental-fill');
    if (mentalFill) mentalFill.style.width = `${gameState.playerMental}%`;
    
    if (document.getElementById('playerMental')) document.getElementById('playerMental').textContent = gameState.playerMental;
    if (document.getElementById('saoriAffection')) document.getElementById('saoriAffection').textContent = gameState.characters.saori.affection;
    if (document.getElementById('rieAffection')) document.getElementById('rieAffection').textContent = gameState.characters.rie.affection;
    if (document.getElementById('misakiAffection')) document.getElementById('misakiAffection').textContent = gameState.characters.misaki.affection;
    
    if (document.getElementById('saoriMental')) document.getElementById('saoriMental').textContent = gameState.characters.saori.mental;
    if (document.getElementById('rieMental')) document.getElementById('rieMental').textContent = gameState.characters.rie.mental;
    if (document.getElementById('misakiMental')) document.getElementById('misakiMental').textContent = gameState.characters.misaki.mental;
}

// 호감도 변화 표시
function showAffectionChange(character, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');
    if (!changeElement || !changeText) return;
    
    const sign = change > 0 ? '+' : '';
    const characterNames = { saori: '사오리', rie: '리에', misaki: '미사키' };
    changeText.textContent = `${characterNames[character]} 호감도 ${sign}${change}`;
    changeElement.style.display = 'block';
    
    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

// 정신력 변화 표시
function showMentalChange(character, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');
    if (!changeElement || !changeText) return;
    
    const sign = change > 0 ? '+' : '';
    changeText.textContent = `${character} 정신력 ${sign}${change}`;
    changeElement.style.display = 'block';
    
    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

// 나머지 팝업/세이브/엔딩 관련 코드도 동일하게 안전하게 null 체크 추가
// initGame 등 페이지 로드 시 JS 오류로 인해 게임 진행 멈추는 문제 방지

function initGame() {
    try {
        const savedEndings = localStorage.getItem('nightmare_endings');
        if (savedEndings) gameState.unlockedEndings = JSON.parse(savedEndings);
        
        const autoSave = localStorage.getItem('nightmare_autosave');
        if (autoSave) {
            try {
                const loadedState = JSON.parse(autoSave);
                gameState = loadedState;
                updateUI();
                if (gameScripts[gameState.currentScene]) displayText(['게임을 계속합니다...']);
                else displayText(['이전 진행상황을 불러왔습니다.']);
            } catch {
                displayText(gameScripts.start.text);
            }
        } else {
            displayText(gameScripts.start.text);
        }
        updateUI();
        
        for (let i = 1; i <= 3; i++) {
            const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
            if (localStorage.getItem(`nightmare_save_${i}`) && slotElement) {
                slotElement.classList.add('saved');
                slotElement.innerHTML = '✓';
            }
        }
    } catch {
        displayText(gameScripts.start.text);
        updateUI();
    }
}

window.onload = initGame;
window.addEventListener('beforeunload', saveGameState);
