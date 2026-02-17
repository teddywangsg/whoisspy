const wordPairs = [
  { civilian: { zh: '白饭', en: 'Rice' }, undercover: { zh: '粥', en: 'Porridge' } },
  { civilian: { zh: '炒面', en: 'Fried Noodles' }, undercover: { zh: '炒饭', en: 'Fried Rice' } },
  { civilian: { zh: '苹果', en: 'Apple' }, undercover: { zh: '梨', en: 'Pear' } },
  { civilian: { zh: '榴莲', en: 'Durian' }, undercover: { zh: '菠萝蜜', en: 'Jackfruit' } }
];

export class GameLogic {
  constructor(playerCount, undercoverCount, wordPair) {
    this.playerCount = playerCount;
    this.undercoverCount = undercoverCount;
    this.wordPair = wordPair;
    this.players = [];
    this.currentRound = 1;
    this.eliminatedPlayers = [];
    this.gameStatus = 'active';
    this.winner = null;
    
    this.initPlayers();
  }
  
  initPlayers() {
    for (let i = 1; i <= this.playerCount; i++) {
      this.players.push({
        id: i,
        name: `玩家${i}`,
        eliminated: false,
        role: null,
        word: null
      });
    }
    
    const shuffledIndices = this.shuffleArray([...Array(this.playerCount).keys()]);
    
    for (let i = 0; i < this.playerCount; i++) {
      const playerIndex = shuffledIndices[i];
      const isUndercover = i < this.undercoverCount;
      this.players[playerIndex].role = isUndercover ? 'undercover' : 'civilian';
      this.players[playerIndex].word = isUndercover ? this.wordPair.undercover : this.wordPair.civilian;
    }
  }
  
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  getActivePlayers() {
    return this.players.filter(p => !p.eliminated);
  }
  
  getActiveUndercoverCount() {
    return this.players.filter(p => !p.eliminated && p.role === 'undercover').length;
  }
  
  getActiveCivilianCount() {
    return this.players.filter(p => !p.eliminated && p.role === 'civilian').length;
  }
  
  eliminatePlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.eliminated) {
      return { success: false, error: '玩家不存在或已被淘汰' };
    }
    
    player.eliminated = true;
    this.eliminatedPlayers.push({
      round: this.currentRound,
      playerId: player.id,
      playerName: player.name,
      role: player.role,
      word: player.word
    });
    
    const result = this.checkGameEnd();
    
    return {
      success: true,
      eliminatedPlayer: player,
      gameEnded: result.ended,
      winner: result.winner,
      message: result.message
    };
  }
  
  checkGameEnd() {
    const activeUndercover = this.getActiveUndercoverCount();
    const activeCivilian = this.getActiveCivilianCount();
    
    if (activeUndercover === 0) {
      this.gameStatus = 'ended';
      this.winner = 'civilian';
      return {
        ended: true,
        winner: 'civilian',
        message: '平民获胜！所有卧底已被找出。'
      };
    }
    
    if (activeUndercover >= activeCivilian) {
      this.gameStatus = 'ended';
      this.winner = 'undercover';
      return {
        ended: true,
        winner: 'undercover',
        message: '卧底获胜！卧底人数不少于平民。'
      };
    }
    
    return { ended: false, winner: null, message: null };
  }
  
  nextRound() {
    if (this.gameStatus === 'ended') {
      return { success: false, error: '游戏已结束' };
    }
    
    this.currentRound++;
    return { success: true, currentRound: this.currentRound };
  }
  
  getGameState() {
    return {
      playerCount: this.playerCount,
      undercoverCount: this.undercoverCount,
      currentRound: this.currentRound,
      gameStatus: this.gameStatus,
      winner: this.winner,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        eliminated: p.eliminated,
        role: p.eliminated || this.gameStatus === 'ended' ? p.role : null,
        word: p.eliminated || this.gameStatus === 'ended' ? p.word : null
      })),
      activePlayers: this.getActivePlayers().map(p => ({
        id: p.id,
        name: p.name,
        eliminated: p.eliminated
      })),
      eliminatedPlayers: this.eliminatedPlayers,
      wordPair: this.gameStatus === 'ended' ? this.wordPair : null
    };
  }
  
  getPlayerWord(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.eliminated) {
      return null;
    }
    return {
      word: player.word,
      role: null
    };
  }
}

export function getRandomWordPair() {
  const index = Math.floor(Math.random() * wordPairs.length);
  return wordPairs[index];
}

export function createGame(playerCount, undercoverCount, wordPair = null) {
  if (playerCount < 4 || playerCount > 12) {
    throw new Error('玩家数量必须在4-12人之间');
  }
  
  const maxUndercover = Math.max(1, Math.floor((playerCount - 1) / 2));
  if (undercoverCount < 1 || undercoverCount > maxUndercover) {
    throw new Error(`卧底数量必须在1-${maxUndercover}之间`);
  }
  
  const selectedWordPair = wordPair || getRandomWordPair();
  return new GameLogic(playerCount, undercoverCount, selectedWordPair);
}