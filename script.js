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
    const meetingKey = `${phase}Meetings`;
    if (gameState[meetingKey][character]) {
        displayText(["이미 오늘 이 시간에 만났습니다."]);
        return;
    }

    gameState[meetingKey][character] = true;
    changeAffection(character, affectionChange);

    const characterNames = {
        saori: '사오리',
        rie: '리에',
        misaki: '미사키'
    };

    displayText([
        `${characterNames[character]}와 대화를 나누었다.`,
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
        // 모든 텍스트가 출력되면 선택지 표시
        showCurrentChoices();
    }
}

function typeText(text) {
    const textBox = document.getElementById('textBox');
    textBox.innerHTML = text;
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
    const characterNames = {
        saori: '사오리',
        rie: '리에',
        misaki: '미사키'
    };

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

    const sign = change > 0 ? '+' : '';
    changeText.textContent = `${character} 정신력 ${sign}${change}`;
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
}

// 엔딩 목록 업데이트
function updateEndingList() {
    const endingList = document.getElementById('endingList');
    endingList.innerHTML = '';

    endings.forEach(ending => {
        const endingItem = document.createElement('div');
        endingItem.className = 'ending-item';

        if (gameState.unlockedEndings.includes(ending)) {
            endingItem.textContent = ending;
            endingItem.onclick = () => replayEnding(ending);
        } else {
            endingItem.textContent = '???';
            endingItem.className += ' locked';
        }

        endingList.appendChild(endingItem);
    });
}

function replayEnding(endingName) {
    showMessage(`${endingName} 엔딩을 다시 보는 기능은 추후 구현 예정입니다.`);
}

// 세이브/로드 기능
let currentSlotNumber = 1;

function handleSaveSlot(slot) {
    const saveData = localStorage.getItem(`nightmare_save_${slot}`);
    if (saveData) {
        // 세이브 파일이 있으면 팝업 표시
        currentSlotNumber = slot;
        document.getElementById('currentSlot').textContent = slot;
        document.getElementById('savePopup').style.display = 'flex';
    } else {
        // 세이브 파일이 없으면 바로 저장
        saveGame(slot);
    }
}

function saveGame(slot) {
    try {
        const saveData = JSON.stringify(gameState);
        localStorage.setItem(`nightmare_save_${slot}`, saveData);

        // 세이브 슬롯 표시 업데이트
        const slotElement = document.querySelector(`.save-slot:nth-child(${slot})`);
        slotElement.classList.add('saved');
        slotElement.innerHTML = '✓';

        showMessage('게임이 저장되었습니다.');
    } catch (error) {
        showMessage('저장 중 오류가 발생했습니다.');
        console.error('Save error:', error);
    }
}

function saveGameState() {
    // 자동 저장 (슬롯 0에 임시 저장)
    try {
        const saveData = JSON.stringify(gameState);
        localStorage.setItem('nightmare_autosave', saveData);
    } catch (error) {
        console.error('Auto-save error:', error);
    }
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
    try {
        const saveData = localStorage.getItem(`nightmare_save_${slot}`);
        if (saveData) {
            gameState = JSON.parse(saveData);
            updateUI();
            // 현재 씬에 맞는 텍스트 표시
            displayText(['게임을 불러왔습니다.']);
        }
    } catch (error) {
        showMessage('불러오기 중 오류가 발생했습니다.');
        console.error('Load error:', error);
    }
}

function deleteGame(slot) {
    try {
        localStorage.removeItem(`nightmare_save_${slot}`);

        // 세이브 슬롯 표시 업데이트
        const slotElement = document.querySelector(`.save-slot:nth-child(${slot})`);
        slotElement.classList.remove('saved');
        slotElement.innerHTML = slot;

        showMessage('세이브 파일이 삭제되었습니다.');
    } catch (error) {
        showMessage('삭제 중 오류가 발생했습니다.');
        console.error('Delete error:', error);
    }
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
    showConfirm('정말 게임을 초기화하시겠습니까?\n모든 세이브 파일과 해금된 엔딩이 삭제됩니다.', () => {
        resetGame();
    });
}

function resetGame() {
    try {
        // 모든 세이브 파일 삭제
        for (let i = 1; i <= 3; i++) {
            localStorage.removeItem(`nightmare_save_${i}`);
            const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
            slotElement.classList.remove('saved');
            slotElement.innerHTML = i;
        }

        // 자동 저장 및 해금된 엔딩 삭제
        localStorage.removeItem('nightmare_autosave');
        localStorage.removeItem('nightmare_endings');

        // 게임 상태 초기화
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
            unlockedEndings: [],
            lastMentalUpdate: 1
        };

        updateUI();
        toggleMenu(); // 메뉴 닫기
        displayText(['게임이 초기화되었습니다.']);
        showCurrentChoices();
    } catch (error) {
        showMessage('초기화 중 오류가 발생했습니다.');
        console.error('Reset error:', error);
    }
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

// 엔딩 해금 함수
function unlockEnding(endingName) {
    if (!gameState.unlockedEndings.includes(endingName)) {
        gameState.unlockedEndings.push(endingName);
        localStorage.setItem('nightmare_endings', JSON.stringify(gameState.unlockedEndings));
        showMessage(`새 엔딩 해금: ${endingName}`);
        saveGameState();
    }
}

// 게임 초기화 및 자동 저장 불러오기
function initGame() {
    try {
        // 해금된 엔딩 불러오기
        const savedEndings = localStorage.getItem('nightmare_endings');
        if (savedEndings) {
            gameState.unlockedEndings = JSON.parse(savedEndings);
        }

        // 자동 저장 불러오기 (페이지를 새로고침해도 진행상황 유지)
        const autoSave = localStorage.getItem('nightmare_autosave');
        if (autoSave) {
            try {
                const loadedState = JSON.parse(autoSave);
                gameState = loadedState;
                updateUI();

                // 현재 씬에 맞는 텍스트와 선택지 표시
                if (gameScripts[gameState.currentScene]) {
                    displayText(['게임을 계속합니다...']);
                } else {
                    displayText(['이전 진행상황을 불러왔습니다.']);
                }
            } catch (error) {
                console.error('Auto-load error:', error);
                // 자동 저장 불러오기 실패시 기본 시작
                displayText(gameScripts.start.text);
            }
        } else {
            // 자동 저장이 없으면 기본 시작
            displayText(gameScripts.start.text);
        }

        updateUI();

        // 저장된 세이브 슬롯 확인
        for (let i = 1; i <= 3; i++) {
            if (localStorage.getItem(`nightmare_save_${i}`)) {
                const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
                slotElement.classList.add('saved');
                slotElement.innerHTML = '✓';
            }
        }
    } catch (error) {
        console.error('Init error:', error);
        // 오류 발생시 기본 상태로 시작
        displayText(gameScripts.start.text);
        updateUI();
    }
}

// 페이지 로드시 게임 초기화
window.onload = initGame;
