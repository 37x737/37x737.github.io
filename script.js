// ===============================
// UI 및 표시 관련 함수들
// ===============================

function displayText(textArray) {
    gameState.currentText = textArray;
    gameState.textIndex = 0;
    gameState.isTyping = true;
    document.getElementById('textBox').innerHTML = '';
    document.getElementById('choicesContainer').innerHTML = '';
    nextText();
}

function nextText() {
    if (gameState.isTyping && gameState.textIndex < gameState.currentText.length) {
        const text = gameState.currentText[gameState.textIndex];
        typeText(text);
        gameState.textIndex++;
    } else if (!gameState.isTyping) {
        showCurrentChoices();
    }
}

function typeText(text) {
    const textBox = document.getElementById('textBox');
    textBox.innerHTML = '';
    gameState.isTyping = true;
    
    let index = 0;
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            textBox.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(typeInterval);
            gameState.isTyping = false;
            if (gameState.textIndex >= gameState.currentText.length) {
                setTimeout(showCurrentChoices, 500);
            }
        }
    }, 30);
}

function showCurrentChoices() {
    const sceneData = gameScripts[gameState.currentScene];
    if (sceneData && sceneData.choices) {
        showChoices(sceneData.choices);
    }
}

function showChoices(choices) {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';

    choices.forEach(choice => {
        if (!choice.condition || choice.condition()) {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice';
            choiceElement.textContent = choice.text;
            choiceElement.onclick = choice.action;
            container.appendChild(choiceElement);
        }
    });
}

function displayScene(sceneKey) {
    const scene = gameScripts[sceneKey];
    if (scene) {
        displayText(scene.text);
    }
}

// UI 업데이트
function updateUI() {
    // 날짜와 시간 업데이트
    document.querySelector('.day-counter').textContent = `${gameState.day}일차`;
    
    const phaseNames = {
        morning: '아침',
        afternoon: '오후', 
        night: '밤'
    };
    document.querySelector('.time-phase').textContent = phaseNames[gameState.phase];

    // 정신력 바 업데이트
    document.querySelector('.mental-fill').style.width = `${gameState.playerMental}%`;
    document.querySelector('.mental-number').textContent = gameState.playerMental;

    // 메뉴 정보 업데이트
    document.getElementById('playerMental').textContent = gameState.playerMental;
    Object.keys(gameState.characters).forEach(char => {
        const character = gameState.characters[char];
        document.getElementById(`${char}Affection`).textContent = character.affection;
        document.getElementById(`${char}Mental`).textContent = character.mental;
    });
    
    updateSurvivalStatus();
}

// 생존 현황 업데이트
function updateSurvivalStatus() {
    const survivalList = document.getElementById('survivalList');
    survivalList.innerHTML = '';
    
    Object.keys(gameState.characters).forEach(char => {
        const character = gameState.characters[char];
        const data = characterData[char];
        
        const statusElement = document.createElement('div');
        statusElement.className = `survival-status ${character.alive ? 'alive' : 'dead'}`;
        statusElement.innerHTML = `
            <span>${data.name}</span>
            <span>${character.alive ? '생존' : '사망'}</span>
        `;
        survivalList.appendChild(statusElement);
    });
}

// 호감도 변화 표시
function showAffectionChange(character, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');

    const sign = change > 0 ? '+' : '';
    const characterName = characterData[character].name;

    changeText.textContent = `${characterName} 호감도 ${sign}${change}`;
    changeElement.style.display = 'block';

    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

// 정신력 변화 표시
function showMentalChange(characterName, change) {
    const changeElement = document.getElementById('affectionChange');
    const changeText = document.getElementById('affectionChangeText');

    const sign = change > 0 ? '+' : '';
    changeText.textContent = `${characterName} 정신력 ${sign}${change}`;
    changeElement.style.display = 'block';

    setTimeout(() => {
        changeElement.style.display = 'none';
    }, 2000);
}

// 사망 알림 표시
function showDeathNotification(characterName, deathMethod) {
    const notification = document.getElementById('deathNotification');
    const deathText = document.getElementById('deathText');
    
    const deathMessages = {
        'suicide_jump': `${characterName}가 옥상에서 투신했다는 소식을 들었다...`,
        'suicide_knife': `${characterName}가 칼로 자신을 해쳤다는 소식을 들었다...`,
        'supernatural': `${characterName}가 흔적도 없이 사라졌다...`
    };
    
    deathText.textContent = deathMessages[deathMethod] || `${characterName}가 사망했다...`;
    notification.style.display = 'flex';
}

function closeDeathNotification() {
    document.getElementById('deathNotification').style.display = 'none';
}

// ===============================
// 메뉴 시스템
// ===============================

function toggleMenu() {
    const menu = document.getElementById('menuOverlay');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    if (menu.style.display === 'block') {
        updateEndingList();
    }
}

function updateEndingList() {
    const endingList = document.getElementById('endingList');
    endingList.innerHTML = '';

    endings.forEach(ending => {
        const endingItem = document.createElement('div');
        endingItem.className = 'ending-item';

        if (gameState.unlockedEndings.includes(ending)) {
            endingItem.textContent = ending;
            endingItem.classList.add('unlocked');
            endingItem.onclick = () => replayEnding(ending);
        } else {
            endingItem.textContent = '???';
            endingItem.classList.add('locked');
        }

        endingList.appendChild(endingItem);
    });
}

function replayEnding(endingName) {
    showMessage(`${endingName} 엔딩 재생 기능은 추후 구현 예정입니다.`);
}

// ===============================
// 세이브/로드 시스템
// ===============================

let currentSlotNumber = 1;

function handleSaveSlot(slot) {
    currentSlotNumber = slot;
    document.getElementById('currentSlot').textContent = slot;
    
    // 세이브 정보 표시
    const saveData = getSaveData(slot);
    const saveInfo = document.getElementById('saveInfo');
    
    if (saveData) {
        saveInfo.innerHTML = `
            <div>저장 일시: ${new Date(saveData.timestamp).toLocaleString()}</div>
            <div>${saveData.day}일차 ${saveData.phase === 'morning' ? '아침' : saveData.phase === 'afternoon' ? '오후' : '밤'}</div>
            <div>히로키 정신력: ${saveData.playerMental}</div>
        `;
    } else {
        saveInfo.innerHTML = '<div>저장된 데이터가 없습니다.</div>';
    }
    
    document.getElementById('savePopup').style.display = 'flex';
}

function saveGameSlot() {
    saveGame(currentSlotNumber);
    closeSavePopup();
}

function saveGame(slot) {
    try {
        const saveData = {
            ...gameState,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem(`nightmare_save_${slot}`, JSON.stringify(saveData));
        
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

function getSaveData(slot) {
    try {
        const data = localStorage.getItem(`nightmare_save_${slot}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Load error:', error);
        return null;
    }
}

function loadGameConfirm() {
    const saveData = getSaveData(currentSlotNumber);
    if (saveData) {
        closeSavePopup();
        showConfirm('정말 불러오시겠습니까?\n현재 진행상황이 사라집니다.', () => {
            loadGame(currentSlotNumber);
        });
    } else {
        showMessage('저장된 데이터가 없습니다.');
    }
}

function loadGame(slot) {
    try {
        const saveData = getSaveData(slot);
        if (saveData) {
            // 버전 호환성 체크
            if (saveData.version !== '1.0') {
                showMessage('호환되지 않는 세이브 파일입니다.');
                return;
            }
            
            gameState = { ...saveData };
            delete gameState.timestamp;
            delete gameState.version;
            
            updateUI();
            progressStory();
            showMessage('게임을 불러왔습니다.');
        }
    } catch (error) {
        showMessage('불러오기 중 오류가 발생했습니다.');
        console.error('Load error:', error);
    }
}

function deleteGameConfirm() {
    closeSavePopup();
    showConfirm('정말 삭제하시겠습니까?', () => {
        deleteGame(currentSlotNumber);
    });
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

function saveGameState() {
    // 자동 저장
    try {
        const autoSaveData = {
            ...gameState,
            timestamp: Date.now()
        };
        localStorage.setItem('nightmare_autosave', JSON.stringify(autoSaveData));
    } catch (error) {
        console.error('Auto-save error:', error);
    }
}

// ===============================
// 확인 팝업 시스템
// ===============================

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
                misaki: { affection: 0, mental: 100, alive: true },
                kazuto: { affection: 0, mental: 100, alive: true }
            },
            currentScene: 'start',
            textIndex: 0,
            currentText: [],
            morningMeetings: {},
            afternoonMeetings: {},
            nightmareEffect: 0,
            dreamMedium: 'saori',
            unlockedEndings: [],
            currentEnding: null,
            isTyping: false,
            replayMode: false,
            replayChoices: []
        };
        
        updateUI();
        toggleMenu();
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

// ===============================
// 엔딩 시스템
// ===============================

function handleEnding() {
    const aliveCount = Object.values(gameState.characters).filter(char => char.alive).length;
    const aliveCharacters = Object.keys(gameState.characters).filter(key => gameState.characters[key].alive);
    
    // 엔딩 조건 체크
    if (aliveCount === 4) {
        // 전원 생존
        if (checkPerfectEnding()) {
            triggerEnding('사라진 악몽');
        } else {
            handleMultipleSurvivorEnding();
        }
    } else if (aliveCount === 3 || aliveCount === 2) {
        // 2-3명 생존
        handleMultipleSurvivorEnding();
    } else if (aliveCount === 1) {
        // 1명 생존
        handleSingleSurvivorEnding(aliveCharacters[0]);
    } else {
        // 전원 사망
        handleAllDeadEnding();
    }
}

function checkPerfectEnding() {
    // 모든 캐릭터 호감도 50 이상 & 모든 캐릭터 멘탈 70 이상 & 주인공 멘탈 80 이상
    const allHighAffection = Object.values(gameState.characters).every(char => char.affection >= 50);
    const allHighMental = Object.values(gameState.characters).every(char => char.mental >= 70);
    const playerHighMental = gameState.playerMental >= 80;
    
    return allHighAffection && allHighMental && playerHighMental;
}

function handleMultipleSurvivorEnding() {
    const aliveCharacters = Object.keys(gameState.characters).filter(key => gameState.characters[key].alive);
    const availableChoices = [];
    
    // 호감도 50 이상인 캐릭터들만 선택 가능
    aliveCharacters.forEach(char => {
        if (gameState.characters[char].affection >= 50) {
            availableChoices.push({
                text: `${characterData[char].name}를 만나러 간다`,
                action: () => chooseCharacterEnding(char)
            });
        }
    });
    
    if (availableChoices.length === 0) {
        // 호감도 높은 캐릭터가 없으면 배드엔딩
        triggerEnding('정해진 결과');
    } else {
        displayText([
            "8일차 아침.",
            "여러 사람에게서 연락이 왔다.",
            "누구를 만나러 갈까?"
        ]);
        
        gameState.currentScene = 'ending_choice';
        gameScripts.ending_choice = {
            text: [],
            choices: availableChoices
        };
    }
}

function chooseCharacterEnding(character) {
    switch (character) {
        case 'saori':
            handleSaoriEnding();
            break;
        case 'rie':
            handleRieEnding();
            break;
        case 'misaki':
            handleMisakiEnding();
            break;
        case 'kazuto':
            handleKazutoEnding();
            break;
    }
}

function handleSaoriEnding() {
    if (gameState.playerMental >= 60 && gameState.characters.saori.mental >= 60) {
        displayText([
            "사오리를 만나러 갔다.",
            "사오리는 진실을 털어놓았다.",
            "\"이 모든 악몽은... 제 꿈이었어요.\"",
            "\"하지만 선배님 덕분에 이제 괜찮을 것 같아요.\""
        ]);
        
        gameState.currentScene = 'saori_confession';
        gameScripts.saori_confession = {
            text: [],
            choices: [
                {
                    text: "괜찮다고 말한다",
                    condition: () => gameState.playerMental >= 70,
                    action: () => triggerEnding('하나의 행복')
                },
                {
                    text: "최악이라고 말한다",
                    condition: () => gameState.playerMental <= 40 || gameState.characters.saori.mental <= 40,
                    action: () => triggerEnding('최악이네')
                }
            ]
        };
    } else {
        triggerEnding('최악이네');
    }
}

function handleRieEnding() {
    displayText([
        "리에를 만나러 갔다.",
        "리에는 얼굴을 붉히며 주인공을 바라봤다.",
        "\"할 말이... 있지 않아?\""
    ]);
    
    gameState.currentScene = 'rie_confession';
    gameScripts.rie_confession = {
        text: [],
        choices: [
            {
                text: "좋아해",
                condition: () => gameState.playerMental >= 60,
                action: () => triggerEnding('맺어진 인연')
            },
            {
                text: "잘 모르겠어",
                condition: () => gameState.playerMental <= 50,
                action: () => handleRieEscape()
            },
            {
                text: "미안해, 좋아하는 사람이 따로 있어",
                condition: () => hasOtherHighAffection('rie'),
                action: () => handleRieRejection()
            }
        ]
    };
}

function handleRieEscape() {
    displayText([
        "리에는 주인공의 상태를 걱정했다.",
        "\"키보드가 고장났어. 사러 가자.\"",
        "리에는 주인공을 데리고 학교 밖으로 나갔다.",
        "\"여기서 떠나버리자.\""
    ]);
    
    gameState.currentScene = 'rie_escape';
    gameScripts.rie_escape = {
        text: [],
        choices: [
            {
                text: "좋아",
                action: () => triggerEnding('벗어난 악몽')
            },
            {
                text: "학교로 돌아가야 해",
                condition: () => gameState.characters.rie.mental <= 30,
                action: () => triggerEnding('속박')
            }
        ]
    };
}

function handleMisakiEnding() {
    const misakiMeetCount = countAfternoonMeetings('misaki');
    
    displayText([
        "미사키를 만나러 갔다.",
        "미사키는 주인공이 올 것을 알고 있는 듯 미소지었다.",
        "무언가를 기다리는 듯 주인공을 바라봤다."
    ]);
    
    const choices = [
        {
            text: "좋아해요",
            action: () => handleMisakiLove()
        }
    ];
    
    if (misakiMeetCount >= 6) {
        choices.push({
            text: "진실을 알고 계시죠",
            action: () => handleMisakiTruth()
        });
    }
    
    gameState.currentScene = 'misaki_confession';
    gameScripts.misaki_confession = {
        text: [],
        choices: choices
    };
}

function handleMisakiLove() {
    if (gameState.playerMental >= 70 && gameState.characters.misaki.mental >= 70) {
        triggerEnding('단꿈');
    } else {
        triggerEnding('지킬 수 없는 약속');
    }
}

function handleMisakiTruth() {
    displayText([
        "미사키는 놀란 표정을 지었다.",
        "\"...역시 눈치채셨군요.\"",
        "미사키가 진실을 말해주었다.",
        "\"악몽에서 벗어나려면... 매개체가 사라져야 해요.\""
    ]);
    
    gameState.currentScene = 'misaki_truth';
    gameScripts.misaki_truth = {
        text: [],
        choices: [
            {
                text: "진실을 외면한다",
                condition: () => gameState.playerMental >= 60,
                action: () => triggerEnding('정해진 결과')
            },
            {
                text: "모든 것을 끝내겠다",
                condition: () => gameState.playerMental <= 50,
                action: () => handleDarkPath()
            }
        ]
    };
}

function handleDarkPath() {
    // 다크 루트 - 다른 캐릭터들을 제거
    displayText([
        "주인공은 끔찍한 결심을 했다.",
        "하나씩... 모든 것을 끝내기로 했다.",
        "낮 시간이 스킵되었다..."
    ]);
    
    // 살아있는 다른 캐릭터들을 모두 사망 처리
    Object.keys(gameState.characters).forEach(key => {
        if (key !== 'misaki' && gameState.characters[key].alive) {
            gameState.characters[key].alive = false;
        }
    });
    
    if (gameState.characters.misaki.mental >= 70) {
        triggerEnding('신뢰의 거짓');
    } else {
        triggerEnding('영원한 굴레');
    }
}

function handleSingleSurvivorEnding(survivor) {
    switch (survivor) {
        case 'saori':
            triggerEnding('최악이네');
            break;
        case 'rie':
            triggerEnding('속박');
            break;
        case 'misaki':
            displayText([
                "미사키만이 살아남았다.",
                "미사키는 주인공에게 진실을 말했다.",
                "\"당신이... 악몽의 원인이에요.\""
            ]);
            
            gameState.currentScene = 'misaki_final';
            gameScripts.misaki_final = {
                text: [],
                choices: [
                    {
                        text: "......",
                        action: () => triggerEnding('탈출구')
                    }
                ]
            };
            break;
        case 'kazuto':
            triggerEnding('카르마');
            break;
    }
}

function handleAllDeadEnding() {
    displayText([
        "모든 사람이... 죽었다.",
        "8일차 아침, 주인공은 간신히 눈을 떴다.",
        "조용한 노크 소리가 들렸다."
    ]);
    
    gameState.currentScene = 'all_dead';
    gameScripts.all_dead = {
        text: [],
        choices: [
            {
                text: "문을 연다",
                action: () => handleKazutoEscape()
            },
            {
                text: "열지 않는다",
                action: () => triggerEnding('거부')
            }
        ]
    };
}

function handleKazutoEscape() {
    const kazutoMeetCount = countAfternoonMeetings('kazuto');
    
    displayText([
        "카즈토가 서 있었다.",
        "\"깨어났구나... 다행이야.\"",
        "\"탈출하자. 계획이 있어.\""
    ]);
    
    const choices = [
        {
            text: "그래",
            action: () => handleEscapeAttempt(kazutoMeetCount)
        },
        {
            text: "가능할 리 없잖아",
            action: () => triggerEnding('거부')
        }
    ];
    
    gameState.currentScene = 'kazuto_escape';
    gameScripts.kazuto_escape = {
        text: [],
        choices: choices
    };
}

function handleEscapeAttempt(meetCount) {
    displayText([
        "둘은 탈출을 시도했다.",
        "담장까지 도달했다.",
        "카즈토가 먼저 담 위로 올라갔다.",
        "경비원이 달려오고 있다!"
    ]);
    
    const choices = [];
    
    if (meetCount >= 2) {
        choices.push({
            text: "그의 손을 잡는다",
            action: () => triggerEnding('일상')
        });
    }
    
    if (meetCount <= 1) {
        choices.push({
            text: "눈앞이 흐려진다",
            action: () => triggerEnding('카르마')
        });
    }
    
    gameState.currentScene = 'final_escape';
    gameScripts.final_escape = {
        text: [],
        choices: choices
    };
}

// 보조 함수들
function hasOtherHighAffection(exclude) {
    return Object.keys(gameState.characters).some(key => 
        key !== exclude && 
        gameState.characters[key].alive && 
        gameState.characters[key].affection >= 50
    );
}

function countAfternoonMeetings(character) {
    // 실제로는 게임 진행 중 카운트를 저장해야 하지만, 
    // 여기서는 호감도로 대략적으로 계산
    return Math.floor(gameState.characters[character].affection / 8);
}

function handleRieRejection() {
    if (gameState.characters.rie.mental <= 30) {
        // 리에 자살 암시
        displayText([
            "리에는 충격받은 표정을 지었다.",
            "\"...그렇구나.\"",
            "며칠 후, 리에의 부고를 들었다..."
        ]);
        gameState.characters.rie.alive = false;
    }
    
    // 다른 캐릭터 선택으로 이동
    const otherChoices = Object.keys(gameState.characters)
        .filter(key => key !== 'rie' && gameState.characters[key].alive && gameState.characters[key].affection >= 50)
        .map(key => ({
            text: `${characterData[key].name}를 만나러 간다`,
            action: () => chooseCharacterEnding(key)
        }));
    
    if (otherChoices.length > 0) {
        gameState.currentScene = 'other_choice';
        gameScripts.other_choice = {
            text: ["다른 사람을 만나러 가자."],
            choices: otherChoices
        };
        showCurrentChoices();
    } else {
        triggerEnding('정해진 결과');
    }
}

// ===============================
// 엔딩 트리거 및 표시
// ===============================

function triggerEnding(endingName) {
    // 엔딩 해금
    if (!gameState.unlockedEndings.includes(endingName)) {
        gameState.unlockedEndings.push(endingName);
        localStorage.setItem('nightmare_endings', JSON.stringify(gameState.unlockedEndings));
    }
    
    gameState.currentEnding = endingName;
    showEnding(endingName);
}

function showEnding(endingName) {
    const endingTexts = {
        '사라진 악몽': "모든 사람이 살아남았고, 악몽은 완전히 사라졌다. 진정한 해피엔딩이다.",
        '하나의 행복': "사오리와 함께 악몽을 극복했다. 둘의 사랑이 모든 것을 해결했다.",
        '최악이네': "사오리는 스스로를 탓하며 세상을 떠났다. 모든 것이 끝났다.",
        '맺어진 인연': "리에와의 사랑을 확인했다. 악몽은 계속되지만 함께라면 괜찮다.",
        '벗어난 악몽': "리에와 함께 학교를 떠났다. 악몽에서 벗어났지만 다른 모든 것을 잃었다.",
        '속박': "리에와 함께 학교로 돌아왔다. 영원히 악몽에 묶여있게 되었다.",
        '단꿈': "미사키와의 사랑을 확인했다. 짧지만 아름다운 시간이었다.",
        '지킬 수 없는 약속': "미사키를 지키지 못했다. 약속은 지켜지지 않았다.",
        '정해진 결과': "모든 것은 이미 정해진 운명이었다. 아무것도 바꿀 수 없었다.",
        '영원한 굴레': "끔찍한 선택의 대가였다. 악몽은 영원히 계속될 것이다.",
        '신뢰의 거짓': "미사키의 신뢰 속에서 거짓된 평화를 얻었다.",
        '탈출구': "마지막 선택이었다. 모든 고통에서 벗어났다.",
        '카르마': "카즈토를 구하지 못했다. 이것이 업보인가.",
        '일상': "카즈토와 함께 평범한 일상을 되찾았다.",
        '거부': "모든 것을 거부했다. 아무것도 남지 않았다."
    };
    
    document.getElementById('endingTitle').textContent = endingName;
    document.getElementById('endingText').textContent = endingTexts[endingName] || "엔딩 텍스트를 불러올 수 없습니다.";
    document.getElementById('endingScreen').style.display = 'flex';
    
    saveGameState();
}

function backToTitle() {
    document.getElementById('endingScreen').style.display = 'none';
    
    // 게임 상태 초기화 (엔딩 기록은 유지)
    const savedEndings = [...gameState.unlockedEndings];
    
    gameState = {
        day: 1,
        phase: 'morning',
        playerMental: 100,
        characters: {
            saori: { affection: 0, mental: 100, alive: true },
            rie: { affection: 0, mental: 100, alive: true },
            misaki: { affection: 0, mental: 100, alive: true },
            kazuto: { affection: 0, mental: 100, alive: true }
        },
        currentScene: 'start',
        textIndex: 0,
        currentText: [],
        morningMeetings: {},
        afternoonMeetings: {},
        nightmareEffect: 0,
        dreamMedium: 'saori',
        unlockedEndings: savedEndings,
        currentEnding: null,
        isTyping: false,
        replayMode: false,
        replayChoices: []
    };
    
    updateUI();
    displayScene('start');
}

function continuePlaying() {
    document.getElementById('endingScreen').style.display = 'none';
    // 현재 상태에서 계속 (엔딩 후 자유 모드)
    displayText(["엔딩을 보았습니다. 게임을 계속 진행할 수 있습니다."]);
}

// ===============================
// 게임 초기화 및 시작
// ===============================

function startGame() {
    gameState.day = 1;
    gameState.phase = 'morning';
    gameState.currentScene = 'day1_morning';
    updateUI();
    progressStory();
    saveGameState();
}

function initGame() {
    try {
        // 해금된 엔딩 불러오기
        const savedEndings = localStorage.getItem('nightmare_endings');
        if (savedEndings) {
            gameState.unlockedEndings = JSON.parse(savedEndings);
        }
        
        // 자동 저장 불러오기
        const autoSave = localStorage.getItem('nightmare_autosave');
        if (autoSave) {
            try {
                const loadedState = JSON.parse(autoSave);
                if (loadedState.version === '1.0' || !loadedState.version) {
                    gameState = { ...loadedState };
                    delete gameState.timestamp;
                    delete gameState.version;
                    updateUI();
                    progressStory();
                    return;
                }
            } catch (error) {
                console.error('Auto-load error:', error);
            }
        }
        
        // 기본 시작
        displayScene('start');
        updateUI();
        
        // 저장된 세이브 슬롯 확인
        for (let i = 1; i <= 3; i++) {
            if (getSaveData(i)) {
                const slotElement = document.querySelector(`.save-slot:nth-child(${i})`);
                slotElement.classList.add('saved');
                slotElement.innerHTML = '✓';
            }
        }
        
    } catch (error) {
        console.error('Init error:', error);
        displayScene('start');
        updateUI();
    }
}

// 페이지 로드시 게임 초기화
window.onload = initGame;// ===============================
// 게임 상태 및 설정
// ===============================

let gameState = {
    day: 1,
    phase: 'morning', // morning, afternoon, night
    playerMental: 100,
    characters: {
        saori: { affection: 0, mental: 100, alive: true },
        rie: { affection: 0, mental: 100, alive: true },
        misaki: { affection: 0, mental: 100, alive: true },
        kazuto: { affection: 0, mental: 100, alive: true }
    },
    currentScene: 'start',
    textIndex: 0,
    currentText: [],
    morningMeetings: {},
    afternoonMeetings: {},
    nightmareEffect: 0, // 악몽의 강도
    dreamMedium: 'saori', // 악몽의 매개체
    unlockedEndings: [],
    currentEnding: null,
    isTyping: false,
    replayMode: false,
    replayChoices: []
};

// 엔딩 목록
const endings = [
    '사라진 악몽', '하나의 행복', '최악이네', '맺어진 인연',
    '벗어난 악몽', '속박', '단꿈', '지킬 수 없는 약속',
    '정해진 결과', '영원한 굴레', '신뢰의 거짓', '탈출구',
    '카르마', '일상', '거부'
];

// 캐릭터별 설정
const characterData = {
    saori: {
        name: '사오리',
        grade: 1,
        club: '배드민턴부',
        location: '체육관',
        mentalThreshold: 30,
        deathMethod: 'suicide_jump'
    },
    rie: {
        name: '리에',
        grade: 2,
        club: '밴드부',
        location: '음악실',
        mentalThreshold: 40,
        deathMethod: 'suicide_knife'
    },
    misaki: {
        name: '미사키',
        grade: 3,
        club: '문예부',
        location: ['화원', '보건실'],
        mentalThreshold: 50,
        deathMethod: 'supernatural'
    },
    kazuto: {
        name: '카즈토',
        grade: 2,
        club: '도서부',
        location: '도서관',
        mentalThreshold: 35,
        deathMethod: 'suicide_jump'
    }
};

// ===============================
// 핵심 게임 로직
// ===============================

// 스토리 진행 함수
function progressStory() {
    const currentDay = gameState.day;
    const phase = gameState.phase;
    
    if (currentDay > 8) {
        // 8일차 이후는 엔딩 처리
        handleEnding();
        return;
    }
    
    // 매일 아침마다 상태 체크
    if (phase === 'morning') {
        checkCharacterDeaths();
        updateDailyStatus();
    }
    
    // 현재 상황에 맞는 씬 결정
    const sceneKey = `day${currentDay}_${phase}`;
    if (gameScripts[sceneKey]) {
        gameState.currentScene = sceneKey;
        displayScene(sceneKey);
    }
}

// 캐릭터 사망 체크
function checkCharacterDeaths() {
    Object.keys(gameState.characters).forEach(char => {
        const character = gameState.characters[char];
        if (character.alive && character.mental <= characterData[char].mentalThreshold) {
            killCharacter(char);
        }
    });
}

// 캐릭터 사망 처리
function killCharacter(characterKey) {
    const character = gameState.characters[characterKey];
    const data = characterData[characterKey];
    
    character.alive = false;
    
    // 다른 캐릭터들의 멘탈 하락
    Object.keys(gameState.characters).forEach(key => {
        if (key !== characterKey && gameState.characters[key].alive) {
            gameState.characters[key].mental -= 10;
        }
    });
    
    // 주인공 멘탈 하락
    gameState.playerMental -= 15;
    
    // 악몽의 매개체 변경
    updateDreamMedium();
    
    // 사망 알림 표시
    showDeathNotification(data.name, data.deathMethod);
}

// 악몽의 매개체 업데이트
function updateDreamMedium() {
    if (gameState.characters.saori.alive) {
        gameState.dreamMedium = 'saori';
    } else if (gameState.characters.rie.alive) {
        gameState.dreamMedium = 'rie';
    } else {
        gameState.dreamMedium = 'player';
    }
}

// 시간 진행
function advanceTime() {
    if (gameState.phase === 'morning') {
        gameState.phase = 'afternoon';
    } else if (gameState.phase === 'afternoon') {
        gameState.phase = 'night';
    } else {
        // 밤이 끝나면 다음 날
        gameState.day++;
        gameState.phase = 'morning';
        gameState.morningMeetings = {};
        gameState.afternoonMeetings = {};
        
        // 악몽 효과 적용
        applyNightmareEffects();
    }
    
    updateUI();
    saveGameState();
    progressStory();
}

// 악몽 효과 적용
function applyNightmareEffects() {
    const intensity = Math.min(gameState.day * 2, 20);
    
    // 모든 살아있는 캐릭터의 멘탈 하락
    Object.keys(gameState.characters).forEach(key => {
        if (gameState.characters[key].alive) {
            gameState.characters[key].mental -= intensity;
        }
    });
    
    // 주인공 멘탈 하락
    gameState.playerMental -= intensity;
    
    // 최소값 보정
    gameState.playerMental = Math.max(0, gameState.playerMental);
    Object.keys(gameState.characters).forEach(key => {
        gameState.characters[key].mental = Math.max(0, gameState.characters[key].mental);
    });
}

// ===============================
// 게임 스크립트 데이터
// ===============================

const gameScripts = {
    start: {
        text: [
            "명문 사립 고등학교로 전학을 오게 된 히로키.",
            "새로운 환경에서의 첫날이 시작된다.",
            "하지만 이 학교에는 알 수 없는 비밀이 숨겨져 있었고...",
            "그 비밀은 곧 히로키의 일상을 완전히 바꿔놓을 것이었다."
        ],
        choices: [
            { text: "게임 시작", action: () => startGame() }
        ]
    },
    
    day1_morning: {
        text: [
            "1일차 아침.",
            "새로운 학교에서의 첫날이 시작되었다.",
            "복도를 걷던 중, 누군가와 마주쳤다."
        ],
        choices: [
            {
                text: "사오리와 대화하기",
                condition: () => !gameState.morningMeetings.saori && gameState.characters.saori.alive,
                action: () => meetCharacterMorning('saori')
            },
            {
                text: "리에와 대화하기", 
                condition: () => !gameState.morningMeetings.rie && gameState.characters.rie.alive,
                action: () => meetCharacterMorning('rie')
            },
            {
                text: "카즈토와 대화하기",
                condition: () => !gameState.morningMeetings.kazuto && gameState.characters.kazuto.alive,
                action: () => meetCharacterMorning('kazuto')
            },
            {
                text: "오후로 넘어가기",
                action: () => advanceTime()
            }
        ]
    },
    
    day1_afternoon: {
        text: [
            "1일차 오후.",
            "방과 후 시간이다.",
            "어디로 가볼까?"
        ],
        choices: [
            {
                text: "체육관 (사오리)",
                condition: () => gameState.characters.saori.alive,
                action: () => meetCharacterAfternoon('saori')
            },
            {
                text: "음악실 (리에)",
                condition: () => gameState.characters.rie.alive,
                action: () => meetCharacterAfternoon('rie')
            },
            {
                text: "보건실 (미사키)",
                condition: () => gameState.characters.misaki.alive && gameState.day % 3 !== 0,
                action: () => meetCharacterAfternoon('misaki')
            },
            {
                text: "화원 (미사키)",
                condition: () => gameState.characters.misaki.alive && gameState.day % 3 === 0,
                action: () => meetCharacterAfternoon('misaki')
            },
            {
                text: "도서관 (카즈토)",
                condition: () => gameState.characters.kazuto.alive,
                action: () => meetCharacterAfternoon('kazuto')
            },
            {
                text: "기숙사로 돌아가기",
                action: () => advanceTime()
            }
        ]
    },
    
    day1_night: {
        text: [
            "1일차 밤.",
            "기숙사 방에서 잠자리에 들었다.",
            "그런데... 이상한 꿈을 꾸기 시작했다.",
            "학교 건물들이 뒤틀어져 있고, 어둠 속에서 누군가의 울음소리가 들려온다.",
            "이것은... 악몽이었다."
        ],
        choices: [
            {
                text: "악몽 속을 탐험한다",
                action: () => exploreNightmare(1)
            },
            {
                text: "깨어나려고 노력한다",
                action: () => tryToWakeUp(1)
            }
        ]
    }
};

// 캐릭터 만남 처리 (아침)
function meetCharacterMorning(character) {
    gameState.morningMeetings[character] = true;
    const data = characterData[character];
    
    let affectionChange = 5;
    let mentalChange = 2;
    
    // 캐릭터별 특별 이벤트
    const events = getMorningEvent(character, gameState.day);
    
    changeAffection(character, affectionChange);
    changeMental(character, mentalChange);
    
    displayText([
        `${data.name}와 대화를 나누었다.`,
        events.text,
        "좋은 시간이었다."
    ]);
}

// 캐릭터 만남 처리 (오후)
function meetCharacterAfternoon(character) {
    gameState.afternoonMeetings[character] = true;
    const data = characterData[character];
    
    let affectionChange = 8;
    let mentalChange = 3;
    
    // 캐릭터별 특별 이벤트
    const events = getAfternoonEvent(character, gameState.day);
    
    changeAffection(character, affectionChange);
    changeMental(character, mentalChange);
    
    displayText([
        `${data.name}와 함께 시간을 보냈다.`,
        events.text,
        "의미 있는 시간이었다."
    ]);
    
    setTimeout(() => advanceTime(), 2000);
}

// 아침 이벤트 텍스트
function getMorningEvent(character, day) {
    const events = {
        saori: [
            "\"안녕하세요! 전학생이시죠? 저는 1학년 사오리입니다.\"",
            "\"어젯밤에 이상한 꿈을 꾸지 않으셨나요?\"",
            "\"요즘 학교에 이상한 일들이 많아서...\"",
            "\"혹시 저와 같은 꿈을 꾸시는 건 아니겠죠?\"",
            "\"최근에 악몽이 심해지고 있어요...\"",
            "\"선배님도 그 꿈을 꾸시는군요...\"",
            "\"이제 곧... 무언가 일어날 것 같아요.\"",
            "\"더 이상 견딜 수 없어요...\""
        ],
        rie: [
            "\"너도 전학생이구나. 나는 리에야.\"",
            "\"밤에 잠을 잘 못 자겠어. 계속 이상한 꿈을 꾸거든.\"",
            "\"키보드 치는 게 유일한 위안이야.\"",
            "\"음악이 없으면 미쳐버릴 것 같아.\"",
            "\"너도... 그 꿈을 꾸지?\"",
            "\"이 학교를 떠나고 싶어.\"",
            "\"함께... 떠날 수는 없을까?\"",
            "\"더는... 혼자 견딜 수 없어.\""
        ],
        kazuto: [
            "\"안녕, 나는 카즈토야. 잘 부탁해.\"",
            "\"책 읽는 걸 좋아해. 현실을 잊을 수 있거든.\"",
            "\"요즘 다들 이상해 보여.\"",
            "\"너도... 그 꿈 이야기 알지?\"",
            "\"뭔가 계획을 세워야 할 것 같아.\"",
            "\"이대로는 안 돼. 뭔가 해야 해.\"",
            "\"나를 믿어줘. 계획이 있어.\"",
            "\"오늘 밤이 마지막 기회일지도 몰라.\""
        ],
        misaki: [
            "\"3학년 미사키입니다. 잘 부탁드려요.\"",
            "\"이 학교에... 뭔가 있어요.\"",
            "\"전 조금... 보이는 편이라서.\"",
            "\"조심하세요. 위험해요.\"",
            "\"진실을... 알고 싶으신가요?\"",
            "\"이미 늦었을지도 모르지만...\"",
            "\"선택의 시간이 다가오고 있어요.\"",
            "\"마지막까지... 함께해주세요.\""
        ]
    };
    
    return {
        text: events[character] ? events[character][Math.min(day - 1, events[character].length - 1)] : "평범한 대화를 나누었다."
    };
}

// 오후 이벤트 텍스트  
function getAfternoonEvent(character, day) {
    const events = {
        saori: [
            "배드민턴을 치며 즐거운 시간을 보냈다.",
            "사오리가 악몽에 대해 걱정하는 모습을 보였다.",
            "사오리의 표정이 어두워 보였다.",
            "사오리가 자신을 탓하는 듯한 말을 했다.",
            "사오리가 무언가 중요한 말을 하려다 멈췄다.",
            "사오리가 진실을 털어놓으려는 듯 보였다.",
            "사오리가 눈물을 글썽이며 사과했다.",
            "사오리가 절망적인 표정을 짓고 있었다."
        ],
        rie: [
            "리에의 키보드 연주를 들으며 시간을 보냈다.",
            "리에가 음악으로 마음을 달래려 하고 있었다.",
            "리에가 학교를 떠나고 싶다고 말했다.",
            "리에가 주인공을 의미심장하게 바라봤다.",
            "리에가 주인공에 대한 감정을 드러내기 시작했다.",
            "리에가 함께 도망치자고 제안했다.",
            "리에가 마지막 기회라며 절박하게 말했다.",
            "리에가 모든 것을 포기한 듯한 표정을 지었다."
        ],
        misaki: [
            "미사키와 조용한 시간을 보냈다.",
            "미사키가 학교의 비밀에 대해 암시했다.",
            "미사키가 주인공을 걱정하는 모습을 보였다.",
            "미사키가 진실에 대해 더 많이 알려주었다.",
            "미사키가 위험이 다가오고 있다고 경고했다.",
            "미사키가 주인공의 선택을 기다리고 있었다.",
            "미사키가 마지막 도움을 주려 했다.",
            "미사키가 체념한 듯한 미소를 지었다."
        ],
        kazuto: [
            "카즈토와 함께 책을 읽으며 시간을 보냈다.",
            "카즈토가 탈출 계획에 대해 언급했다.",
            "카즈토가 주인공을 더 자주 만나자고 제안했다.",
            "카즈토가 구체적인 계획을 세우고 있었다.",
            "카즈토가 주인공의 도움을 요청했다.",
            "카즈토가 최종 계획을 점검하고 있었다.",
            "카즈토가 내일이 중요하다고 강조했다.",
            "카즈토가 마지막 준비를 마쳤다고 말했다."
        ]
    };
    
    return {
        text: events[character] ? events[character][Math.min(day - 1, events[character].length - 1)] : "평범한 시간을 보냈다."
    };
}

// 악몽 탐험
function exploreNightmare(day) {
    const nightmareEvents = [
        "어둠 속에서 사오리의 목소리가 들려온다. '모두 내 잘못이야...'",
        "복도 끝에서 누군가가 울고 있다. 다가가보려 하지만 발이 움직이지 않는다.",
        "교실 안에서 책상들이 저절로 움직이고 있다.",
        "옥상으로 향하는 계단이 끝없이 이어진다.",
        "거울 속에서 또 다른 자신이 손을 흔들고 있다.",
        "학교 전체가 물 속에 잠겨있는 것 같다.",
        "모든 사람들의 얼굴이 검게 칠해져 있다.",
        "학교가 무너지고 있다. 도망쳐야 한다."
    ];
    
    gameState.playerMental -= 5;
    
    displayText([
        nightmareEvents[Math.min(day - 1, nightmareEvents.length - 1)],
        "악몽이 점점 더 생생해지고 있다...",
        "정신력이 조금 떨어진 것 같다."
    ]);
    
    setTimeout(() => advanceTime(), 3000);
}

// 깨어나려고 시도
function tryToWakeUp(day) {
    if (Math.random() > 0.3) {
        displayText([
            "깨어나려고 노력했지만 실패했다.",
            "악몽은 계속되고 있다...",
            "무력감이 엄습한다."
        ]);
        gameState.playerMental -= 3;
    } else {
        displayText([
            "간신히 악몽에서 깨어났다.",
            "하지만 몸이 무겁고 피곤하다.",
            "이것이... 정말 꿈이었을까?"
        ]);
        gameState.playerMental -= 1;
    }
    
    setTimeout(() => advanceTime(), 3000);
}

// ===============================
// 호감도 및 멘탈 시스템
// ===============================

function changeAffection(character, change) {
    if (gameState.characters[character]) {
        gameState.characters[character].affection += change;
        gameState.characters[character].affection = Math.max(-100, Math.min(100, gameState.characters[character].affection));
        showAffectionChange(character, change);
        updateUI();
        saveGameState();
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
        showMentalChange(characterData[character].name, change);
    }
    updateUI();
    saveGameState();
}
