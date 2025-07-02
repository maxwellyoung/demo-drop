# Demo Drop 🎵

A minimal, elegant web app to share your music demos with friends. Think: your own Bandcamp, but stripped bare for speed and vibe.

## Features

- **Drag & Drop Upload**: Support for .mp3, .wav, .m4a, .flac files
- **Waveform Player**: Beautiful audio visualization with wavesurfer.js
- **Shareable URLs**: Clean `/track/:slug` URLs for easy sharing
- **Emoji Reactions**: 🔥 😭 🤯 💔 reactions from listeners
- **Minimal Design**: Clean monochrome aesthetic

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drop your demo!

## Usage

1. **Upload**: Drag and drop an audio file on the landing page
2. **Share**: Copy the generated track URL to share with friends
3. **Listen**: Full waveform player with play/pause/scrub
4. **React**: Listeners can add emoji reactions

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Audio Player**: wavesurfer.js
- **Storage**: Local file system (MVP)
- **Database**: JSON metadata files

## Project Structure

```
demo-drop/
├── app/
│   ├── api/
│   │   ├── upload/           # File upload endpoint
│   │   └── reactions/        # Emoji reactions API
│   ├── track/[slug]/         # Dynamic track pages
│   └── page.tsx              # Landing page
├── components/
│   ├── AudioPlayer.tsx       # Waveform player
│   ├── ShareButton.tsx       # Copy link functionality
│   └── ReactionsPanel.tsx    # Emoji reactions
└── public/uploads/           # Uploaded audio files
```

## Environment Variables

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # For production, use your domain
```

---

_Made by [maxwellyoung.nz](https://maxwellyoung.nz)_
