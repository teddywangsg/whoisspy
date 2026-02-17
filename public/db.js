const DB_NAME = 'UndercoverGameDB';
const DB_VERSION = 1;

class GameDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('players')) {
          db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('votes')) {
          const voteStore = db.createObjectStore('votes', { keyPath: 'id', autoIncrement: true });
          voteStore.createIndex('gameId', 'gameId', { unique: false });
          voteStore.createIndex('round', 'round', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addPlayer(name) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('players', 'readwrite');
      const store = tx.objectStore('players');
      const request = store.add({ name, eliminated: false });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPlayers() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('players', 'readonly');
      const store = tx.objectStore('players');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPlayers() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('players', 'readwrite');
      const store = tx.objectStore('players');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async markPlayerEliminated(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('players', 'readwrite');
      const store = tx.objectStore('players');
      const request = store.get(id);
      request.onsuccess = () => {
        const player = request.result;
        player.eliminated = true;
        store.put(player);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createGame(gameData) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('games', 'readwrite');
      const store = tx.objectStore('games');
      const request = store.add({
        ...gameData,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getGame(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('games', 'readonly');
      const store = tx.objectStore('games');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateGame(id, updates) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('games', 'readwrite');
      const store = tx.objectStore('games');
      const request = store.get(id);
      request.onsuccess = () => {
        const game = { ...request.result, ...updates };
        store.put(game);
        resolve(game);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addVote(gameId, round, voterId, targetId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('votes', 'readwrite');
      const store = tx.objectStore('votes');
      const request = store.add({
        gameId,
        round,
        voterId,
        targetId,
        timestamp: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getVotesByRound(gameId, round) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('votes', 'readonly');
      const store = tx.objectStore('votes');
      const index = store.index('gameId');
      const request = index.getAll(gameId);
      request.onsuccess = () => {
        const votes = request.result.filter(v => v.round === round);
        resolve(votes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllVotes(gameId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('votes', 'readonly');
      const store = tx.objectStore('votes');
      const index = store.index('gameId');
      const request = index.getAll(gameId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData() {
    return Promise.all([
      new Promise((resolve, reject) => {
        const tx = this.db.transaction('players', 'readwrite');
        const store = tx.objectStore('players');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const tx = this.db.transaction('games', 'readwrite');
        const store = tx.objectStore('games');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const tx = this.db.transaction('votes', 'readwrite');
        const store = tx.objectStore('votes');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  }

  async saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  }
}

const gameDB = new GameDatabase();