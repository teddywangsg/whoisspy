# Who is the Spy - Singapore Edition

> [中文](./README.zh.md) | English

A party game perfect for Singaporean families across three generations, supporting bilingual Chinese-English display.

## Game Features

- **Multi-generational fun**: Grandparents, parents, and kids can all play together
- **Singaporean vocabulary**: Kaya toast, Bak Kut Teh, wet market (pasar), HDB flats, etc.
- **Pass-the-phone gameplay**: One player views their word and passes to the next, perfect for gatherings
- **Bilingual display**: Words shown in both Chinese and English
- **PWA support**: Install to your phone's home screen and play offline
- **Portrait lock**: Ensures proper display when passing phones around

## Tech Stack

- **Backend**: Bun + TypeScript
- **Frontend**: Vanilla HTML + jQuery
- **Database**: IndexedDB (browser local storage)
- **Testing**: Bun Test + Playwright

## Quick Start

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun run dev
```

### Run Tests

```bash
# Unit tests
bun test

# E2E tests
bun run test-all.js
```

### Production Deployment

```bash
bun run server.ts
```

Server runs at http://localhost:3456 by default

## How to Play

1. **Setup**: Choose player count (4-12) and spy count
2. **View Words**: Players take turns viewing their word (one time only)
3. **Discussion & Voting**: Describe your word, find the spy, vote to eliminate suspicious players
4. **Reveal Results**: After elimination, only shows who was eliminated, not their role
5. **Continue**: Repeat until a winner is determined, then reveal all roles and words

## Word Categories

- Local Food: Hainanese chicken rice, Bak Kut Teh, Kaya toast, etc.
- Tropical Fruits: Durian, Rambutan, Mangosteen, etc.
- Daily Terms: Wet market (pasar), HDB flats, taxi, aircon, etc.
- Family Terms: Grandpa, Grandma, Uncle, Auntie, etc.
- Festivals: Red packets, lanterns, mooncakes, rice dumplings, etc.

## Development

```
whoisspy/
├── public/
│   ├── index.html      # Main page
│   ├── style.css       # Styles
│   ├── game.js         # Game logic
│   ├── words.js        # Word database
│   ├── db.js           # IndexedDB wrapper
│   ├── manifest.json   # PWA config
│   ├── sw.js           # Service Worker
│   └── icons/          # Icons
├── test/
│   └── game-logic.test.js  # Unit tests
├── server.ts           # Bun server
└── package.json
```

## License

MIT
