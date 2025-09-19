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
    unlockedEndings: []
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
        text: ["명문 사립 고등학교로 전학을 오게 된 히로키.", "새로운 환경에서의 첫날이 시작된다.", "하지만 이 학교에는 알 수 없는 비밀이 숨겨져 있었다..."],
        choices: [
            { text: "게임 시작", action: () => startDay1() }
        ]
    }
};

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
        typeText(gameState.currentText[gameState.textIndex]);
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
            setTimeout(addWord, 50);
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

// 호감도 변화 표시
function showAffectionChange(character, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');
    
    const sign = change > 0 ? '+' : '';
    changeText.textContent = `${character} 호감도 ${sign}${change}`;
    changeElement.style.display = 'block';
    
    setTimeout(() => { changeElement.style.display = 'none'; }, 2000);
}

// 메뉴 토글
function toggleMenu() {
    const menu = document.getElementById('menuOverlay');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    updateEndingList();
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

// 이하 세이브/로드, 초기화, 메시지, 엔딩 해금 기능은 기존 코드 그대로 유지
