let currentGame = null;
let currentPlayerIndex = 0;
let hasShownWord = false;
let selectedPlayerCount = 4;
let selectedUndercoverCount = 1;

function getBilingualWord(wordObj) {
  return `${wordObj.zh} / ${wordObj.en}`;
}

async function init() {
  await gameDB.init();
  setupSelectors();
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
  $('#selected-player-count').text(`已选择: ${selectedPlayerCount}人`);
  $('#selected-undercover-count').text(`已选择: ${selectedUndercoverCount}个卧底`);
}

async function startGame() {
  await gameDB.clearAllData();
  
  const wordPair = getRandomWordPair();
  
  currentGame = {
    playerCount: selectedPlayerCount,
    undercoverCount: selectedUndercoverCount,
    wordPair: wordPair,
    players: [],
    currentRound: 1,
    eliminatedPlayers: [],
    gameStatus: 'active',
    winner: null
  };
  
  for (let i = 1; i <= selectedPlayerCount; i++) {
    const id = await gameDB.addPlayer(`玩家${i}`);
    currentGame.players.push({
      id: id,
      name: `玩家${i}`,
      eliminated: false,
      role: null,
      word: null
    });
  }
  
  const shuffledIndices = shuffleArray([...Array(selectedPlayerCount).keys()]);
  
  for (let i = 0; i < selectedPlayerCount; i++) {
    const playerIndex = shuffledIndices[i];
    const isUndercover = i < selectedUndercoverCount;
    currentGame.players[playerIndex].role = isUndercover ? 'undercover' : 'civilian';
    currentGame.players[playerIndex].word = isUndercover ? wordPair.undercover : wordPair.civilian;
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

function showCurrentPlayerWord() {
  const activePlayers = currentGame.players.filter(p => !p.eliminated);
  
  if (currentPlayerIndex >= activePlayers.length) {
    showPage('discussion');
    return;
  }
  
  const player = activePlayers[currentPlayerIndex];
  
  $('#current-player-name').text(player.name);
  $('#word-display').hide();
  $('#word-cover').show();
  $('#word-text').text(getBilingualWord(player.word));
  $('#role-badge').hide();
  
  hasShownWord = false;
}

function revealWord() {
  $('#word-cover').hide();
  $('#word-display').show();
  $('#next-word-btn').show();
  $('#warning-message').hide();
  hasShownWord = true;
}

function nextPlayer() {
  if (!hasShownWord) {
    $('#warning-message').show();
    return;
  }
  $('#warning-message').hide();
  $('#next-word-btn').hide();
  hasShownWord = false;
  currentPlayerIndex++;
  showCurrentPlayerWord();
}

function showPage(pageId) {
  $('.page').removeClass('active');
  $(`#${pageId}-page`).addClass('active');
}

function startElimination() {
  showPage('vote');
  renderEliminationList();
}

function renderEliminationList() {
  const container = $('#vote-section');
  container.empty();
  
  const activePlayers = currentGame.players.filter(p => !p.eliminated);
  
  if (activePlayers.length === 0) {
    container.html('<p style="text-align:center;">没有可淘汰的玩家</p>');
    return;
  }
  
  activePlayers.forEach(player => {
    const item = $(`
      <div class="vote-player">
        <span class="player-name">${player.name}</span>
        <button type="button" class="vote-btn" data-id="${player.id}">淘汰</button>
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
      alert('玩家不存在或已被淘汰');
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
    showEliminationResult(player);
  } catch (error) {
    console.error('eliminatePlayer错误:', error);
    alert('操作失败: ' + error.message);
  }
}

function showEliminationResult(player) {
  showPage('eliminate-result');
  
  $('#eliminated-player-name').text(`${player.name} 被淘汰`);
  $('#eliminated-player-role').hide();
  $('#eliminated-player-word').hide();
  
  const gameEndResult = checkGameEnd();
  
  if (gameEndResult.ended) {
    currentGame.gameStatus = 'ended';
    currentGame.winner = gameEndResult.winner;
    $('#game-status-message')
      .text('游戏结束！点击查看最终结果揭晓答案')
      .css('color', '#667eea');
    $('#continue-btn').hide();
    $('#view-final-result-btn').show();
  } else {
    $('#game-status-message').text(`第 ${currentGame.currentRound} 轮结束，游戏继续`);
    $('#continue-btn').show();
    $('#view-final-result-btn').hide();
  }
}

function checkGameEnd() {
  const activeUndercover = currentGame.players.filter(p => !p.eliminated && p.role === 'undercover').length;
  const activeCivilian = currentGame.players.filter(p => !p.eliminated && p.role === 'civilian').length;
  
  if (activeUndercover === 0) {
    return {
      ended: true,
      winner: 'civilian',
      message: '平民获胜！所有卧底已被找出。'
    };
  }
  
  if (activeUndercover >= activeCivilian) {
    return {
      ended: true,
      winner: 'undercover',
      message: '卧底获胜！卧底人数不少于平民。'
    };
  }
  
  return { ended: false, winner: null, message: null };
}

function nextRound() {
  if (currentGame.gameStatus === 'ended') {
    return;
  }
  
  currentGame.currentRound++;
  
  showPage('vote');
  renderEliminationList();
}

function showFinalResult() {
  showPage('result');

  if (currentGame.winner === 'civilian') {
    $('#winner-title').text('平民获胜！');
    $('#winner-section').css('background', 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)');
  } else {
    $('#winner-title').text('卧底获胜！');
    $('#winner-section').css('background', 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)');
  }

  let revealHtml = '';

  revealHtml += `<div class="reveal-item" style="background:#e7f3ff; padding:10px; border-radius:8px; margin-bottom:15px;">`;
  revealHtml += `<strong>平民词：</strong>${getBilingualWord(currentGame.wordPair.civilian)}<br>`;
  revealHtml += `<strong>卧底词：</strong>${getBilingualWord(currentGame.wordPair.undercover)}`;
  revealHtml += `</div>`;

  currentGame.players.forEach(player => {
    const roleText = player.role === 'undercover' ? '卧底' : '平民';
    const wordText = getBilingualWord(player.word);
    revealHtml += `
      <div class="reveal-item">
        <strong>${player.name}</strong> - ${roleText} (${wordText})
        ${player.eliminated ? `<span style="color:#ff6b6b;">(被淘汰)</span>` : ''}
      </div>
    `;
  });

  $('#reveal-list').html(revealHtml);
}

async function resetGame() {
  await gameDB.clearAllData();
  currentGame = null;
  currentPlayerIndex = 0;
  hasShownWord = false;
  showPage('setup');
}

$(document).ready(function() {
  init();
  
  $('#start-game-btn').click(startGame);
  $('#word-cover').click(revealWord);
  $('#next-word-btn').click(nextPlayer);
  $('#start-discussion-btn').click(startElimination);
  $('#continue-btn').click(nextRound);
  $('#view-final-result-btn').click(showFinalResult);
  $('#play-again-btn').click(resetGame);
});