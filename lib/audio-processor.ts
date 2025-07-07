import { spawn } from "child_process";
import { writeFile, readFile } from "fs/promises";
import path from "path";

export interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  format: string;
  bpm?: number;
  key?: string;
  loudness?: number;
}

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

export class AudioProcessor {
  private ffmpegPath: string;

  constructor() {
    // Use system FFmpeg or install via package manager
    this.ffmpegPath = "ffmpeg";
  }

  /**
   * Process uploaded audio file:
   * 1. Extract metadata
   * 2. Generate 192k MP3 for streaming
   * 3. Generate waveform peaks
   * 4. Create spectral thumbnail
   */
  async processAudioFile(
    inputPath: string,
    outputDir: string,
    slug: string
  ): Promise<{
    metadata: AudioMetadata;
    waveformData: WaveformData;
    streamingPath: string;
    thumbnailPath: string;
  }> {
    const streamingPath = path.join(outputDir, `${slug}-streaming.mp3`);
    const thumbnailPath = path.join(outputDir, `${slug}-spectral.png`);
    const peaksPath = path.join(outputDir, `${slug}-peaks.json`);

    // Extract metadata first
    const metadata = await this.extractMetadata(inputPath);

    // Generate streaming-optimized MP3
    await this.generateStreamingVersion(inputPath, streamingPath);

    // Generate waveform peaks
    const waveformData = await this.generateWaveformPeaks(inputPath, peaksPath);

    // Generate spectral thumbnail
    await this.generateSpectralThumbnail(inputPath, thumbnailPath);

    return {
      metadata,
      waveformData,
      streamingPath,
      thumbnailPath,
    };
  }

  private async extractMetadata(inputPath: string): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        inputPath,
      ]);

      let output = "";
      let error = "";

      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.stderr.on("data", (data) => {
        error += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`FFprobe failed: ${error}`));
          return;
        }

        try {
          const data = JSON.parse(output);
          const format = data.format;
          const audioStream = data.streams.find(
            (s: any) => s.codec_type === "audio"
          );

          const metadata: AudioMetadata = {
            duration: parseFloat(format.duration) || 0,
            bitrate: parseInt(format.bit_rate) || 0,
            sampleRate: parseInt(audioStream?.sample_rate) || 44100,
            channels: parseInt(audioStream?.channels) || 2,
            format: format.format_name,
          };

          resolve(metadata);
        } catch (err) {
          reject(new Error(`Failed to parse metadata: ${err}`));
        }
      });
    });
  }

  private async generateStreamingVersion(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, [
        "-i",
        inputPath,
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-y", // Overwrite output
        outputPath,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
    });
  }

  private async generateWaveformPeaks(
    inputPath: string,
    peaksPath: string
  ): Promise<WaveformData> {
    return new Promise((resolve, reject) => {
      // Use FFmpeg to extract raw audio data
      const ffmpeg = spawn(this.ffmpegPath, [
        "-i",
        inputPath,
        "-f",
        "s16le",
        "-ac",
        "1",
        "-ar",
        "22050",
        "-acodec",
        "pcm_s16le",
        "pipe:1",
      ]);

      let audioData = Buffer.alloc(0);

      ffmpeg.stdout.on("data", (data) => {
        audioData = Buffer.concat([audioData, data]);
      });

      ffmpeg.on("close", async (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg failed with code ${code}`));
          return;
        }

        try {
          // Convert raw audio to peaks
          const peaks = this.audioToPeaks(audioData);
          const waveformData: WaveformData = {
            peaks,
            duration: peaks.length * 0.1, // 100ms per peak
            sampleRate: 22050,
          };

          // Save peaks to file
          await writeFile(peaksPath, JSON.stringify(waveformData));
          resolve(waveformData);
        } catch (err) {
          reject(new Error(`Failed to generate peaks: ${err}`));
        }
      });

      ffmpeg.on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
    });
  }

  private audioToPeaks(audioData: Buffer): number[] {
    const samplesPerPeak = 2205; // 22050 Hz / 10 peaks per second
    const peaks: number[] = [];

    for (let i = 0; i < audioData.length; i += samplesPerPeak * 2) {
      const chunk = audioData.slice(i, i + samplesPerPeak * 2);
      let maxAmplitude = 0;

      for (let j = 0; j < chunk.length; j += 2) {
        const sample = chunk.readInt16LE(j);
        const amplitude = Math.abs(sample);
        if (amplitude > maxAmplitude) {
          maxAmplitude = amplitude;
        }
      }

      // Normalize to 0-1 range
      peaks.push(maxAmplitude / 32768);
    }

    return peaks;
  }

  private async generateSpectralThumbnail(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, [
        "-i",
        inputPath,
        "-filter_complex",
        [
          "showspectrumpic=s=600x600:mode=combined:color=channel:scale=log",
          "format=yuv420p",
        ].join(","),
        "-y",
        outputPath,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on("error", (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      });
    });
  }

  /**
   * Analyze audio for BPM and key (basic implementation)
   * In production, you'd want to use more sophisticated libraries
   */
  async analyzeAudio(
    inputPath: string
  ): Promise<{ bpm?: number; key?: string }> {
    // This is a placeholder - in production you'd use libraries like:
    // - aubio for BPM detection
    // - librosa for key detection
    // For now, return undefined to indicate no analysis
    return { bpm: undefined, key: undefined };
  }
}
