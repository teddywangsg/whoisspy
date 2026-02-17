import { describe, it, expect } from 'bun:test';
import { GameLogic, createGame, getRandomWordPair } from '../public/game-logic.js';

describe('GameLogic', () => {
  const testWordPair = {
    civilian: { zh: '白饭', en: 'Rice' },
    undercover: { zh: '粥', en: 'Porridge' }
  };

  describe('初始化', () => {
    it('应该正确创建游戏', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      expect(game.playerCount).toBe(6);
      expect(game.undercoverCount).toBe(2);
      expect(game.players.length).toBe(6);
      expect(game.currentRound).toBe(1);
      expect(game.gameStatus).toBe('active');
    });

    it('应该正确分配角色', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const undercovers = game.players.filter(p => p.role === 'undercover');
      const civilians = game.players.filter(p => p.role === 'civilian');
      
      expect(undercovers.length).toBe(2);
      expect(civilians.length).toBe(4);
    });

    it('应该正确分配词语', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      game.players.forEach(player => {
        if (player.role === 'undercover') {
          expect(player.word).toEqual(testWordPair.undercover);
        } else {
          expect(player.word).toEqual(testWordPair.civilian);
        }
      });
    });
  });

  describe('淘汰玩家', () => {
    it('应该能成功淘汰玩家', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const result = game.eliminatePlayer(1);
      
      expect(result.success).toBe(true);
      expect(result.eliminatedPlayer.eliminated).toBe(true);
      expect(game.getActivePlayers().length).toBe(5);
    });

    it('淘汰玩家后应该记录淘汰信息', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      game.eliminatePlayer(1);
      
      expect(game.eliminatedPlayers.length).toBe(1);
      expect(game.eliminatedPlayers[0].playerId).toBe(1);
      expect(game.eliminatedPlayers[0].round).toBe(1);
    });

    it('不应该能淘汰已被淘汰的玩家', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      game.eliminatePlayer(1);
      const result = game.eliminatePlayer(1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('玩家不存在或已被淘汰');
    });

    it('不应该能淘汰不存在的玩家', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const result = game.eliminatePlayer(999);
      
      expect(result.success).toBe(false);
    });
  });

  describe('游戏结束条件', () => {
    it('当所有卧底被淘汰时，平民获胜', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const undercovers = game.players.filter(p => p.role === 'undercover');
      
      game.eliminatePlayer(undercovers[0].id);
      const result = game.eliminatePlayer(undercovers[1].id);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe('civilian');
      expect(game.gameStatus).toBe('ended');
    });

    it('当卧底人数不少于平民时，卧底获胜', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const civilians = game.players.filter(p => p.role === 'civilian');
      
      game.eliminatePlayer(civilians[0].id);
      game.eliminatePlayer(civilians[1].id);
      const result = game.eliminatePlayer(civilians[2].id);
      
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe('undercover');
      expect(game.gameStatus).toBe('ended');
    });

    it('游戏未结束时应该继续', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const civilians = game.players.filter(p => p.role === 'civilian');
      game.eliminatePlayer(civilians[0].id);
      
      const result = game.checkGameEnd();
      
      expect(result.ended).toBe(false);
      expect(game.gameStatus).toBe('active');
    });
  });

  describe('下一轮', () => {
    it('应该能进入下一轮', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const result = game.nextRound();
      
      expect(result.success).toBe(true);
      expect(game.currentRound).toBe(2);
    });

    it('游戏结束后不应该能进入下一轮', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const undercovers = game.players.filter(p => p.role === 'undercover');
      game.eliminatePlayer(undercovers[0].id);
      game.eliminatePlayer(undercovers[1].id);
      
      const result = game.nextRound();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('游戏已结束');
    });
  });

  describe('获取玩家词', () => {
    it('应该返回玩家的词但不显示角色', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const playerWord = game.getPlayerWord(1);
      
      expect(playerWord).not.toBeNull();
      expect(playerWord.word).toBeDefined();
      expect(playerWord.role).toBeNull();
    });

    it('被淘汰的玩家应该返回null', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      game.eliminatePlayer(1);
      const playerWord = game.getPlayerWord(1);
      
      expect(playerWord).toBeNull();
    });
  });

  describe('游戏状态', () => {
    it('应该正确返回游戏状态', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const state = game.getGameState();
      
      expect(state.playerCount).toBe(6);
      expect(state.undercoverCount).toBe(2);
      expect(state.currentRound).toBe(1);
      expect(state.gameStatus).toBe('active');
      expect(state.players.length).toBe(6);
    });

    it('游戏进行中不应该显示玩家角色', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const state = game.getGameState();
      const activePlayer = state.players.find(p => !p.eliminated);
      
      expect(activePlayer.role).toBeNull();
    });

    it('游戏结束后应该显示所有玩家角色', () => {
      const game = new GameLogic(6, 2, testWordPair);
      
      const undercovers = game.players.filter(p => p.role === 'undercover');
      game.eliminatePlayer(undercovers[0].id);
      game.eliminatePlayer(undercovers[1].id);
      
      const state = game.getGameState();
      const player = state.players[0];
      
      expect(player.role).not.toBeNull();
    });
  });
});

describe('createGame', () => {
  it('应该正确创建游戏', () => {
    const game = createGame(6, 2);
    
    expect(game).toBeInstanceOf(GameLogic);
    expect(game.playerCount).toBe(6);
  });

  it('玩家数量少于4应该抛出错误', () => {
    expect(() => createGame(3, 1)).toThrow('玩家数量必须在4-12人之间');
  });

  it('玩家数量大于12应该抛出错误', () => {
    expect(() => createGame(13, 1)).toThrow('玩家数量必须在4-12人之间');
  });

  it('卧底数量超过限制应该抛出错误', () => {
    expect(() => createGame(6, 5)).toThrow('卧底数量必须在1-2之间');
  });
});

describe('完整游戏流程测试', () => {
  const testWordPair = {
    civilian: { zh: '苹果', en: 'Apple' },
    undercover: { zh: '梨', en: 'Pear' }
  };

  it('4人1卧底：淘汰卧底后平民获胜', () => {
    const game = new GameLogic(4, 1, testWordPair);
    
    const undercover = game.players.find(p => p.role === 'undercover');
    const result = game.eliminatePlayer(undercover.id);
    
    expect(result.gameEnded).toBe(true);
    expect(result.winner).toBe('civilian');
  });

  it('6人2卧底：淘汰所有卧底后平民获胜', () => {
    const game = new GameLogic(6, 2, testWordPair);
    
    const undercovers = game.players.filter(p => p.role === 'undercover');
    game.eliminatePlayer(undercovers[0].id);
    const result = game.eliminatePlayer(undercovers[1].id);
    
    expect(result.gameEnded).toBe(true);
    expect(result.winner).toBe('civilian');
  });

  it('6人2卧底：卧底获胜场景', () => {
    const game = new GameLogic(6, 2, testWordPair);
    
    const civilians = game.players.filter(p => p.role === 'civilian');
    game.eliminatePlayer(civilians[0].id);
    game.eliminatePlayer(civilians[1].id);
    const result = game.eliminatePlayer(civilians[2].id);
    
    expect(result.gameEnded).toBe(true);
    expect(result.winner).toBe('undercover');
    expect(game.getActiveUndercoverCount()).toBe(2);
    expect(game.getActiveCivilianCount()).toBe(1);
  });

  it('多轮游戏流程', () => {
    const game = new GameLogic(8, 2, testWordPair);
    
    const civilians = game.players.filter(p => p.role === 'civilian');
    
    game.eliminatePlayer(civilians[0].id);
    expect(game.currentRound).toBe(1);
    expect(game.gameStatus).toBe('active');
    
    game.nextRound();
    expect(game.currentRound).toBe(2);
    
    game.eliminatePlayer(civilians[1].id);
    expect(game.gameStatus).toBe('active');
    
    game.nextRound();
    expect(game.currentRound).toBe(3);
    
    game.eliminatePlayer(civilians[2].id);
    expect(game.gameStatus).toBe('active');
    
    game.eliminatePlayer(civilians[3].id);
    expect(game.gameStatus).toBe('ended');
    expect(game.winner).toBe('undercover');
  });
});