# ReadCraft

**AI-powered English Reading Companion**

Paste an English article, and ReadCraft helps you read it, translate it, listen to it, and learn from it. Built for Chinese college students preparing for CET-4 / CET-6 / 考研 (postgraduate entrance exams).

> Paste → Analyze → Read → Listen → Learn

## Features

- **Article input** — paste any English article and analyze it in one click.
- **Paragraph-by-paragraph translation** — every English paragraph is paired with its Chinese translation, rendered side by side (not one block of full-text translation).
- **AI analysis** — structured output: bilingual summary, difficulty level, core vocabulary, exam key points, and long/difficult sentences with grammar explanations.
- **Text-to-speech** — read the article aloud using the browser's Web Speech API with Play / Pause / Resume / Stop and speed control (0.5x – 2x, default 1x).
- **Smart TTS preprocessing** — decimals are read naturally (`7.8` → "seven point eight") without changing the on-screen text, and switching speed resumes from the current position without skipping or repeating words.
- **Clean reader view** — a tabbed interface (原文 / 词汇 / 考点 / 长难句 / 总结) that stays uncluttered on desktop and mobile.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Express (minimal proxy that keeps your API key server-side)
- **AI:** any OpenAI-compatible API (DeepSeek by default, OpenAI, Moonshot, etc.)
- **Storage:** `localStorage` (latest article only — no accounts, no database)

## Project Structure

```
ReadCraft/
├── client/                  # React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── types/           # analysis data contract (shared shape)
│       ├── lib/             # api, storage, speech
│       ├── hooks/           # useSpeech
│       ├── pages/           # Home, Reader
│       └── components/      # UI components
├── server/                  # Express backend
│   └── src/
│       ├── index.ts         # POST /api/analyze + static serving
│       ├── analyze.ts       # OpenAI-compatible call + retry
│       ├── prompt.ts        # system prompt (strict JSON)
│       └── types.ts         # Zod schema (validates AI output)
├── .env.example             # template for environment variables
├── package.json             # npm workspaces + scripts
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- An API key from an OpenAI-compatible provider (DeepSeek recommended)

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your real key:

```env
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=deepseek-chat
PORT=3001
```

> `.env.local` is gitignored — never commit it.

### 3. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001 (Vite proxies `/api` to it)

### 4. Build & serve for production

```bash
npm run build
npm start
```

The server serves the built frontend from `client/dist` and the API on the same origin.

## DeepSeek API Setup

ReadCraft uses any [OpenAI-compatible](https://platform.openai.com/docs/api-reference) API, so it works with DeepSeek, OpenAI, Moonshot, and others. DeepSeek is the default because it is affordable and strong at Chinese.

1. Sign up at [platform.deepseek.com](https://platform.deepseek.com/) and create an API key.
2. Copy `.env.example` to `.env.local`.
3. Set `OPENAI_API_KEY` to your DeepSeek key and keep `OPENAI_BASE_URL=https://api.deepseek.com` with `OPENAI_MODEL=deepseek-chat`.

| Variable          | Required | Default                      | Description                                    |
| ----------------- | -------- | ---------------------------- | ---------------------------------------------- |
| `OPENAI_API_KEY`  | Yes      | —                            | Your API key                                   |
| `OPENAI_BASE_URL` | No       | `https://api.openai.com/v1`  | OpenAI-compatible base URL                     |
| `OPENAI_MODEL`    | No       | `deepseek-chat`              | Model name                                     |
| `PORT`            | No       | `3001`                       | Backend port                                   |

Other providers:

- OpenAI: `https://api.openai.com/v1` — `gpt-4o-mini`
- Moonshot: `https://api.moonshot.cn/v1` — `moonshot-v1-8k`

## API

`POST /api/analyze`

Request:

```json
{ "text": "Your English article..." }
```

Response:

```json
{
  "analysis": {
    "paragraphs": [
      { "english": "Original paragraph...", "translation": "段落中文翻译..." }
    ],
    "summary": { "english": "...", "chinese": "..." },
    "difficulty": "CET-6",
    "vocabulary": [
      { "word": "significant", "partOfSpeech": "adj.", "meaning": "重要的", "example": "..." }
    ],
    "keyPoints": [
      { "type": "grammar", "title": "...", "content": "..." }
    ],
    "sentences": [
      { "original": "...", "analysis": "...", "translation": "..." }
    ]
  }
}
```

Errors return `{ "error": { "code", "message" } }` with a 4xx/5xx status.

The server validates every AI response against a Zod schema and retries on failure, so the frontend only ever receives a well-formed result. Articles are limited to **10,000 characters**.

## Notes on Text-to-Speech

ReadCraft uses the browser's [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) — no paid TTS service.

- **Chrome / Edge:** full support, including pause/resume and multiple English voices.
- **Safari / iOS:** limited voices; `pause()` is not supported (Stop cancels instead). Sound requires a user gesture.
- Articles are read sentence-by-sentence with a watchdog fallback, since Chrome's `onend` event is unreliable for long utterances.
- Decimals are preprocessed before speaking (`7.8` → "seven point eight") without altering the displayed text.
- Speech rate is approximate and can vary slightly between engines.

## Screenshots

> Place screenshots in `./screenshots/` and reference them here.

| Home | Reader |
| ---- | ------ |
| ![](./screenshots/home.png) | ![](./screenshots/reader.png) |

## Roadmap

- [x] v1.0 — MVP: paste, analyze, read, listen, learn
- [x] v1.1 — paragraph-by-paragraph translation, seamless rate switching, decimal-aware TTS
- [ ] Multiple saved articles / reading history
- [ ] Word highlighting synchronized with speech
- [ ] Vocabulary flashcards and spaced repetition
- [ ] Streaming AI responses
- [ ] Accounts and cloud sync

## License

[MIT](./LICENSE)
