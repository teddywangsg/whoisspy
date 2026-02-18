let currentGame = null;
let currentPlayerIndex = 0;
let hasShownWord = false;
let selectedPlayerCount = 4;
let selectedUndercoverCount = 1;
let currentLang = 'zh';

const i18n = {
  zh: {
    title: '谁是卧底',
    subtitle: '新加坡版',
    playerCount: '玩家数量',
    undercoverCount: '卧底数量',
    selected: '已选择',
    people: '人',
    undercoverUnit: '个卧底',
    startGame: '开始游戏',
    tapToShow: '点击屏幕显示词语',
    dontLetOthersSee: '不要让其他人看到',
    yourWord: '你的词',
    rememberThenClick: '记住后点击下方按钮',
    confirmSeen: '确认已看，传给下一位',
    pleaseViewFirst: '请先点击屏幕查看词语',
    discussion: '讨论时间',
    describeHint: '描述你的词',
    listenHint: '听别人的描述',
    findSpy: '找出卧底！',
    startVote: '开始投票',
    selectEliminate: '选择淘汰',
    selectPlayerToEliminate: '讨论结束后，选择要淘汰的玩家',
    eliminate: '淘汰',
    eliminateResult: '淘汰结果',
    eliminated: '被淘汰',
    roundEndContinue: '轮结束，游戏继续',
    gameEndReveal: '游戏结束！点击查看最终结果揭晓答案',
    continueNextRound: '继续下一轮',
    viewFinalResult: '查看最终结果',
    civilianWin: '平民获胜！',
    undercoverWin: '卧底获胜！',
    revealAnswer: '揭晓答案',
    civilianWord: '平民词',
    undercoverWord: '卧底词',
    civilian: '平民',
    undercover: '卧底',
    playAgain: '再玩一次',
    langSwitch: 'English',
    round: '第',
    noPlayersToEliminate: '没有可淘汰的玩家',
    playerNotFoundOrEliminated: '玩家不存在或已被淘汰',
    eliminationFailed: '操作失败',
    allUndercoverFound: '平民获胜！所有卧底已被找出。',
    undercoverOutnumberCivilian: '卧底获胜！卧底人数不少于平民。',
    eliminatedLabel: '被淘汰',
    player: '玩家',
    tapToShowWord: '点击显示词语',
    gameDescription1: '🎮 4-12人游戏',
    gameDescription2: '🎯 找出卧底或隐藏身份',
    gameDescription3: '📱 传递手机看词',
    gameEnded: '游戏已结束',
    playerCountError: '玩家数量必须在4-12人之间',
    undercoverCountError: '卧底数量必须在1-{0}之间',
    resetWords: '重置词库',
    resetWordsHint: '清除已玩过的词汇，重新开始',
    resetWordsConfirm: '确定要重置词库吗？所有已玩过的词汇记录将被清除。',
    wordsResetSuccess: '词库已重置！',
    abandonGame: '放弃游戏',
    abandonGameHint: '快速点击3次以放弃游戏',
    abandonConfirm: '确定要放弃当前游戏吗？所有进度将丢失。',
    resumeGame: '继续游戏',
    clickToReveal: '点击显示词语'
  },
  en: {
    title: 'Who is the Spy',
    subtitle: 'Singapore Edition',
    playerCount: 'Player Count',
    undercoverCount: 'Spy Count',
    selected: 'Selected',
    people: ' players',
    undercoverUnit: ' spies',
    startGame: 'Start Game',
    tapToShow: 'Tap to reveal word',
    dontLetOthersSee: 'Do not let others see',
    yourWord: 'Your Word',
    rememberThenClick: 'Remember then click below',
    confirmSeen: 'Done, pass to next',
    pleaseViewFirst: 'Please tap to view word first',
    discussion: 'Discussion Time',
    describeHint: 'Describe your word',
    listenHint: 'Listen to others',
    findSpy: 'Find the spy!',
    startVote: 'Start Voting',
    selectEliminate: 'Select to Eliminate',
    selectPlayerToEliminate: 'Select a player to eliminate',
    eliminate: 'Eliminate',
    eliminateResult: 'Elimination Result',
    eliminated: 'eliminated',
    roundEndContinue: 'round ended, game continues',
    gameEndReveal: 'Game over! Click to reveal final results',
    continueNextRound: 'Continue Next Round',
    viewFinalResult: 'View Final Result',
    civilianWin: 'Civilians Win!',
    undercoverWin: 'Spies Win!',
    revealAnswer: 'Reveal Answer',
    civilianWord: 'Civilian Word',
    undercoverWord: 'Spy Word',
    civilian: 'Civilian',
    undercover: 'Spy',
    playAgain: 'Play Again',
    langSwitch: '中文',
    round: 'Round ',
    noPlayersToEliminate: 'No players to eliminate',
    playerNotFoundOrEliminated: 'Player not found or already eliminated',
    eliminationFailed: 'Operation failed',
    allUndercoverFound: 'Civilians win! All spies have been found.',
    undercoverOutnumberCivilian: 'Spies win! Spies outnumber civilians.',
    eliminatedLabel: 'eliminated',
    player: 'Player',
    tapToShowWord: 'Tap to reveal word',
    gameDescription1: '🎮 4-12 players',
    gameDescription2: '🎯 Find the spy or hide your identity',
    gameDescription3: '📱 Pass phone to view word',
    gameEnded: 'Game has ended',
    playerCountError: 'Player count must be between 4-12',
    undercoverCountError: 'Spy count must be between 1-{0}',
    resetWords: 'Reset Word History',
    resetWordsHint: 'Clear played words to start fresh',
    resetWordsConfirm: 'Are you sure you want to reset the word history? All played word records will be cleared.',
    wordsResetSuccess: 'Word history reset!',
    abandonGame: 'Abandon Game',
    abandonGameHint: 'Tap 3 times quickly to abandon',
    abandonConfirm: 'Are you sure you want to abandon the current game? All progress will be lost.',
    resumeGame: 'Resume Game',
    clickToReveal: 'Tap to reveal word'
  }
};

function t(key) {
  return i18n[currentLang][key] || key;
}

function getBilingualWord(wordObj) {
  return `${wordObj.zh} / ${wordObj.en}`;
}

async function init() {
  await gameDB.init();

  const savedLang = await gameDB.getSetting('language');
  if (savedLang) {
    currentLang = savedLang;
  }

  setupSelectors();
  updateLanguage();

  await restoreGameState();
}

async function restoreGameState() {
  const activeGame = await gameDB.getActiveGame();
  if (!activeGame) {
    return;
  }

  const players = await gameDB.getAllPlayers();
  if (players.length === 0) {
    await gameDB.deleteGame(activeGame.id);
    return;
  }

  currentGame = {
    id: activeGame.id,
    playerCount: activeGame.playerCount,
    undercoverCount: activeGame.undercoverCount,
    wordPair: activeGame.wordPair,
    players: players,
    currentRound: activeGame.currentRound || 1,
    eliminatedPlayers: activeGame.eliminatedPlayers || [],
    gameStatus: activeGame.gameStatus,
    winner: activeGame.winner
  };

  currentPlayerIndex = activeGame.currentPlayerIndex || 0;
  hasShownWord = false;

  const savedWordState = await gameDB.getSetting(`game_${activeGame.id}_wordState`);
  if (savedWordState) {
    hasShownWord = savedWordState.hasShownWord || false;
  }

  restoreUIState(activeGame.currentPhase || 'show-word');
}

function restoreUIState(phase) {
  switch (phase) {
    case 'show-word':
      showPage('show-word');
      showCurrentPlayerWord();
      break;
    case 'discussion':
      showPage('discussion');
      break;
    case 'vote':
      showPage('vote');
      renderEliminationList();
      break;
    case 'eliminate-result':
      showPage('eliminate-result');
      break;
    case 'result':
      if (currentGame.gameStatus === 'ended') {
        showFinalResult();
      } else {
        showPage('setup');
      }
      break;
    default:
      showPage('setup');
  }
}

async function saveGameProgress(phase) {
  if (!currentGame || !currentGame.id) return;

  await gameDB.updateGame(currentGame.id, {
    currentPlayerIndex: currentPlayerIndex,
    currentPhase: phase,
    currentRound: currentGame.currentRound,
    eliminatedPlayers: currentGame.eliminatedPlayers,
    gameStatus: currentGame.gameStatus,
    winner: currentGame.winner
  });

  await gameDB.saveSetting(`game_${currentGame.id}_wordState`, {
    hasShownWord: hasShownWord
  });
}

function toggleLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  gameDB.saveSetting('language', currentLang);
  updateLanguage();
}

function updateLanguage() {
  $('[data-i18n]').each(function() {
    const key = $(this).data('i18n');
    const translation = t(key);
    
    if (key === 'tapToShow') {
      $(this).text(`👆 ${translation}`);
    } else if (key === 'rememberThenClick') {
      $(this).text(`👇 ${translation}`);
    } else if (key === 'confirmSeen') {
      $(this).text(`✓ ${translation}`);
    } else if (key.startsWith('gameDescription') || key === 'describeHint' || key === 'listenHint' || key === 'findSpy') {
      const emoji = $(this).text().charAt(0);
      $(this).text(`${emoji} ${translation}`);
    } else if (key === 'title') {
      if ($(this).find('small').length) {
        $(this).html(`${translation}<br><small>${t('subtitle')}</small>`);
      } else {
        $(this).text(translation);
      }
    } else {
      $(this).text(translation);
    }
  });

  $('#lang-btn').text(t('langSwitch'));
  updateSelectedInfo();
  
  $('#show-word-page .pass-device').text(`👆 ${t('tapToShow')}`);
  $('#show-word-page .cover-hint').text(t('dontLetOthersSee'));
  $('#show-word-page .word-hint').text(t('yourWord'));
  $('#show-word-page .word-action-hint').text(`👇 ${t('rememberThenClick')}`);
  $('#next-word-btn').text(`✓ ${t('confirmSeen')}`);
  $('#warning-message div:last').text(t('pleaseViewFirst'));
  
  $('.vote-btn').text(t('eliminate'));
}

function setupSelectors() {
  $('#player-count-selector .number-btn').click(function() {
    $('#player-count-selector .number-btn').removeClass('active');
    $(this).addClass('active');
    selectedPlayerCount = parseInt($(this).data('value'));
    updateUndercoverOptions();
    updateSelectedInfo();
  });
  
  $('#player-count-selector .number-btn[data-value="4"]').addClass('active');
  updateUndercoverOptions();
}

function updateUndercoverOptions() {
  const maxUndercover = Math.max(1, Math.floor((selectedPlayerCount - 1) / 2));
  const $undercoverSelector = $('#undercover-count-selector');
  $undercoverSelector.empty();
  
  for (let i = 1; i <= maxUndercover && i <= 4; i++) {
    const isActive = i === selectedUndercoverCount || (selectedUndercoverCount > maxUndercover && i === 1);
    $undercoverSelector.append(`<button type="button" class="number-btn ${isActive ? 'active' : ''}" data-value="${i}">${i}</button>`);
  }
  
  if (selectedUndercoverCount > maxUndercover) {
    selectedUndercoverCount = 1;
  }
  
  $('#undercover-count-selector .number-btn').click(function() {
    $('#undercover-count-selector .number-btn').removeClass('active');
    $(this).addClass('active');
    selectedUndercoverCount = parseInt($(this).data('value'));
    updateSelectedInfo();
  });
  
  updateSelectedInfo();
}

function updateSelectedInfo() {
  $('#selected-player-count').text(`${t('selected')}: ${selectedPlayerCount}${t('people')}`);
  $('#selected-undercover-count').text(`${t('selected')}: ${selectedUndercoverCount}${t('undercoverUnit')}`);
}

async function startGame() {
  await gameDB.clearAllData();

  const playedWordIds = await gameDB.getPlayedWords();
  const { wordPair, wordId } = getRandomWordPair(playedWordIds);

  if (wordId >= 0) {
    await gameDB.addPlayedWord(wordId);
  }

  const gameId = await gameDB.createGame({
    playerCount: selectedPlayerCount,
    undercoverCount: selectedUndercoverCount,
    wordPair: wordPair,
    currentRound: 1,
    eliminatedPlayers: [],
    gameStatus: 'active',
    winner: null,
    currentPlayerIndex: 0,
    currentPhase: 'show-word'
  });

  currentGame = {
    id: gameId,
    playerCount: selectedPlayerCount,
    undercoverCount: selectedUndercoverCount,
    wordPair: wordPair,
    players: [],
    currentRound: 1,
    eliminatedPlayers: [],
    gameStatus: 'active',
    winner: null
  };

  const shuffledIndices = shuffleArray([...Array(selectedPlayerCount).keys()]);

  for (let i = 1; i <= selectedPlayerCount; i++) {
    const isUndercover = shuffledIndices.indexOf(i - 1) < selectedUndercoverCount;
    const playerData = {
      name: `${t('player')}${i}`,
      role: isUndercover ? 'undercover' : 'civilian',
      word: isUndercover ? wordPair.undercover : wordPair.civilian
    };
    const id = await gameDB.addPlayer(playerData);
    currentGame.players.push({
      id: id,
      name: playerData.name,
      eliminated: false,
      role: playerData.role,
      word: playerData.word
    });
  }

  currentPlayerIndex = 0;
  hasShownWord = false;

  showPage('show-word');
  showCurrentPlayerWord();
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function showCurrentPlayerWord() {
  const activePlayers = currentGame.players.filter(p => !p.eliminated);

  if (currentPlayerIndex >= activePlayers.length) {
    showPage('discussion');
    await saveGameProgress('discussion');
    return;
  }

  const player = activePlayers[currentPlayerIndex];

  $('#current-player-name').text(player.name);
  $('#word-display').hide();
  $('#word-cover').show();
  $('#word-text').text(getBilingualWord(player.word));
  $('#role-badge').hide();

  hasShownWord = false;
  setupAbandonButton();
}

async function revealWord() {
  $('#word-cover').hide();
  $('#word-display').show();
  $('#next-word-btn').show();
  $('#warning-message').hide();
  hasShownWord = true;

  await saveGameProgress('show-word');
}

async function nextPlayer() {
  if (!hasShownWord) {
    $('#warning-message').show();
    return;
  }
  $('#warning-message').hide();
  $('#next-word-btn').hide();
  hasShownWord = false;
  currentPlayerIndex++;

  await saveGameProgress('show-word');
  showCurrentPlayerWord();
}

function showPage(pageId) {
  $('.page').removeClass('active');
  $(`#${pageId}-page`).addClass('active');
}

async function startElimination() {
  showPage('vote');
  renderEliminationList();
  await saveGameProgress('vote');
}

function renderEliminationList() {
  const container = $('#vote-section');
  container.empty();
  
  const activePlayers = currentGame.players.filter(p => !p.eliminated);
  
  if (activePlayers.length === 0) {
    container.html(`<p style="text-align:center;">${t('noPlayersToEliminate')}</p>`);
    return;
  }
  
  activePlayers.forEach(player => {
    const item = $(`
      <div class="vote-player">
        <span class="player-name">${player.name}</span>
        <button type="button" class="vote-btn" data-id="${player.id}">${t('eliminate')}</button>
      </div>
    `);
    item.find('.vote-btn').click(async () => { await eliminatePlayer(player.id); });
    container.append(item);
  });
}

async function eliminatePlayer(playerId) {
  try {
    const player = currentGame.players.find(p => p.id === playerId);
    if (!player || player.eliminated) {
      alert(t('playerNotFoundOrEliminated'));
      return;
    }

    player.eliminated = true;
    currentGame.eliminatedPlayers.push({
      round: currentGame.currentRound,
      playerId: player.id,
      playerName: player.name,
      role: player.role,
      word: player.word
    });

    await gameDB.markPlayerEliminated(playerId);
    await showEliminationResult(player);
  } catch (error) {
    console.error('eliminatePlayer error:', error);
    alert(t('eliminationFailed') + ': ' + error.message);
  }
}

async function showEliminationResult(player) {
  showPage('eliminate-result');

  $('#eliminated-player-name').text(`${player.name} ${t('eliminated')}`);
  $('#eliminated-player-role').hide();
  $('#eliminated-player-word').hide();

  const gameEndResult = checkGameEnd();

  if (gameEndResult.ended) {
    currentGame.gameStatus = 'ended';
    currentGame.winner = gameEndResult.winner;
    $('#game-status-message')
      .text(t('gameEndReveal'))
      .css('color', '#667eea');
    $('#continue-btn').hide();
    $('#view-final-result-btn').show();
  } else {
    $('#game-status-message').text(`${t('round')} ${currentGame.currentRound} ${t('roundEndContinue')}`);
    $('#continue-btn').show();
    $('#view-final-result-btn').hide();
  }

  await saveGameProgress('eliminate-result');
}

function checkGameEnd() {
  const activeUndercover = currentGame.players.filter(p => !p.eliminated && p.role === 'undercover').length;
  const activeCivilian = currentGame.players.filter(p => !p.eliminated && p.role === 'civilian').length;

  if (activeUndercover === 0) {
    return {
      ended: true,
      winner: 'civilian',
      message: t('allUndercoverFound')
    };
  }

  if (activeUndercover >= activeCivilian) {
    return {
      ended: true,
      winner: 'undercover',
      message: t('undercoverOutnumberCivilian')
    };
  }

  return { ended: false, winner: null, message: null };
}

async function nextRound() {
  if (currentGame.gameStatus === 'ended') {
    return;
  }

  currentGame.currentRound++;

  showPage('vote');
  renderEliminationList();
  await saveGameProgress('vote');
}

async function showFinalResult() {
  showPage('result');

  if (currentGame.winner === 'civilian') {
    $('#winner-title').text(t('civilianWin'));
    $('#winner-section').css('background', 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)');
  } else {
    $('#winner-title').text(t('undercoverWin'));
    $('#winner-section').css('background', 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)');
  }

  let revealHtml = '';

  revealHtml += `<div class="reveal-item" style="background:#e7f3ff; padding:10px; border-radius:8px; margin-bottom:15px;">`;
  revealHtml += `<strong>${t('civilianWord')}:</strong> ${getBilingualWord(currentGame.wordPair.civilian)}<br>`;
  revealHtml += `<strong>${t('undercoverWord')}:</strong> ${getBilingualWord(currentGame.wordPair.undercover)}`;
  revealHtml += `</div>`;

  currentGame.players.forEach(player => {
    const roleText = player.role === 'undercover' ? t('undercover') : t('civilian');
    const wordText = getBilingualWord(player.word);
    revealHtml += `
      <div class="reveal-item">
        <strong>${player.name}</strong> - ${roleText} (${wordText})
        ${player.eliminated ? `<span style="color:#ff6b6b;">(${t('eliminatedLabel')})</span>` : ''}
      </div>
    `;
  });

  $('#reveal-list').html(revealHtml);
  await saveGameProgress('result');
}

async function resetGame() {
  await gameDB.clearAllData();
  currentGame = null;
  currentPlayerIndex = 0;
  hasShownWord = false;
  showPage('setup');
}

async function resetPlayedWords() {
  if (confirm(t('resetWordsConfirm'))) {
    await gameDB.clearPlayedWords();
    alert(t('wordsResetSuccess'));
  }
}

let abandonClickCount = 0;
let abandonClickTimer = null;

function setupAbandonButton() {
  abandonClickCount = 0;
  $('#abandon-click-count').text('0/3').removeClass('active');
}

async function handleAbandonClick() {
  abandonClickCount++;
  $('#abandon-click-count').text(`${abandonClickCount}/3`).addClass('active');

  if (abandonClickTimer) {
    clearTimeout(abandonClickTimer);
  }

  if (abandonClickCount >= 3) {
    if (confirm(t('abandonConfirm'))) {
      if (currentGame && currentGame.id) {
        await gameDB.deleteGame(currentGame.id);
      }
      await gameDB.clearPlayers();
      currentGame = null;
      currentPlayerIndex = 0;
      hasShownWord = false;
      abandonClickCount = 0;
      showPage('setup');
    } else {
      abandonClickCount = 0;
      $('#abandon-click-count').text('0/3').removeClass('active');
    }
  } else {
    abandonClickTimer = setTimeout(() => {
      abandonClickCount = 0;
      $('#abandon-click-count').text('0/3').removeClass('active');
    }, 2000);
  }
}

$(document).ready(function() {
  init();

  $('#start-game-btn').click(startGame);
  $('#word-cover').click(revealWord);
  $('#word-cover .cover-text div:nth-child(2)').text(t('tapToShow'));
  $('#next-word-btn').click(nextPlayer);
  $('#start-discussion-btn').click(startElimination);
  $('#continue-btn').click(nextRound);
  $('#view-final-result-btn').click(showFinalResult);
  $('#play-again-btn').click(resetGame);
  $('#lang-btn').click(toggleLanguage);
  $('#reset-words-btn').click(resetPlayedWords);
  $('#abandon-game-btn').click(handleAbandonClick);
});