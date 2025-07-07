# 🎵 Local WAVs Folder Setup

## Quick Setup

Your Demo Drop app is now configured to read audio files directly from your MacBook's WAVs folder! Here's how to set it up:

### 1. **Find Your WAVs Folder Path**

First, locate where your WAVs folder is on your MacBook. Common locations:

- `~/Music/WAVs` (most common)
- `~/Desktop/WAVs`
- `~/Documents/WAVs`
- `/Users/yourusername/WAVs`

### 2. **Update the Path in the Code**

Open these files and update the `wavsFolderPath` variable to match your actual folder location:

**File 1:** `app/api/tracks/local/route.ts` (around line 25)
**File 2:** `app/api/audio/[filename]/route.ts` (around line 15)

```typescript
// Replace this line with your actual path:
const wavsFolderPath = path.join(process.env.HOME || "", "Music", "WAVs");

// Examples:
// const wavsFolderPath = path.join(process.env.HOME || "", "Desktop", "WAVs");
// const wavsFolderPath = "/Users/maxwellyoung/Music/WAVs";
// const wavsFolderPath = "/Users/maxwellyoung/Desktop/WAVs";
```

### 3. **Test the Setup**

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/tracks` to see your tracks

3. If you see an error about the folder not being found, double-check the path

### 4. **Supported File Formats**

The app will automatically detect and display:

- `.wav` files
- `.mp3` files
- `.m4a` files
- `.flac` files

### 5. **How It Works**

- **No Upload Required**: Files are read directly from your WAVs folder
- **Automatic Scanning**: The app scans your folder and creates metadata automatically
- **Direct Streaming**: Audio files are served directly from your local folder
- **Real-time Updates**: Just add new files to your WAVs folder and refresh the page

### 6. **Customization Options**

#### Change the Artist Name

In `app/api/tracks/local/route.ts`, find this line and update it:

```typescript
artist: "Maxwell", // Change this to your preferred artist name
```

#### Extract Artist from Filename

You could modify the code to extract artist names from filenames like "Artist - Song.wav":

```typescript
// Example: Extract artist from "Artist - Song.wav" format
const nameParts = nameWithoutExt.split(" - ");
const artist = nameParts.length > 1 ? nameParts[0] : "Maxwell";
const title =
  nameParts.length > 1 ? nameParts.slice(1).join(" - ") : nameWithoutExt;
```

### 7. **Troubleshooting**

#### "WAVs folder not found" Error

- Double-check the folder path
- Make sure the folder exists
- Try using an absolute path like `/Users/yourusername/Music/WAVs`

#### No Tracks Showing

- Check that your WAVs folder contains audio files
- Verify the file extensions are supported (.wav, .mp3, .m4a, .flac)
- Check the browser console for any errors

#### Audio Not Playing

- Make sure the audio files aren't corrupted
- Check that the file permissions allow the app to read them
- Try a different audio file to test

### 8. **Benefits of This Approach**

✅ **No Upload Time**: Instant access to your existing files  
✅ **No Storage Limits**: Use your entire music library  
✅ **No Duplication**: Keep files in their original location  
✅ **Easy Management**: Just add/remove files from your WAVs folder  
✅ **Fast Performance**: Direct file access, no cloud delays

### 9. **Future Enhancements**

You could add:

- **Folder Watching**: Automatically detect new files
- **Metadata Extraction**: Read ID3 tags from MP3 files
- **Playlist Support**: Create playlists from your local files
- **File Organization**: Sort by folders, artists, or genres

---

**That's it!** Your Demo Drop app will now work with your existing WAVs folder. Just add new audio files to your WAVs folder and they'll automatically appear in the app.
