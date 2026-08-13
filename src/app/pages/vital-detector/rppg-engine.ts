/**
 * rPPG Engine — Remote Photoplethysmography Signal Processor
 * Pure TypeScript, no external dependencies.
 * Detects heart rate, respiratory rate, and SpO2 from webcam frames.
 */

export interface VitalReadings {
  heartRate: number;       // BPM
  respiratoryRate: number; // breaths/min
  spo2: number;            // %
  confidence: number;      // 0–100
}

export class RppgEngine {
  private readonly SAMPLE_RATE = 30;          // frames per second
  private readonly BUFFER_SIZE = 300;         // 10 seconds of data
  private readonly HR_LOW_HZ  = 0.75;         // 45 BPM
  private readonly HR_HIGH_HZ = 4.0;          // 240 BPM
  private readonly RR_LOW_HZ  = 0.13;         // 8 br/min
  private readonly RR_HIGH_HZ = 0.5;          // 30 br/min

  // Circular buffers for RGB channels
  private rBuf: Float64Array;
  private gBuf: Float64Array;
  private bBuf: Float64Array;
  private bufIdx = 0;
  private frameCount = 0;

  // Cached outputs (updated every ~30 frames)
  private _hr  = 0;
  private _rr  = 0;
  private _spo2 = 0;
  private _conf = 0;

  // Waveform for UI rendering (normalized)
  public waveform: number[] = [];

  constructor() {
    this.rBuf = new Float64Array(this.BUFFER_SIZE);
    this.gBuf = new Float64Array(this.BUFFER_SIZE);
    this.bBuf = new Float64Array(this.BUFFER_SIZE);
  }

  /**
   * Feed a canvas ImageData region (forehead ROI) into the engine.
   * Call this every frame captured from the video.
   */
  processFrame(imageData: ImageData): void {
    const { data, width, height } = imageData;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Skip very dark or very bright pixels (non-skin or saturated)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 40 || lum > 230) continue;
      rSum += r; gSum += g; bSum += b; count++;
    }

    if (count === 0) return;

    this.rBuf[this.bufIdx] = rSum / count;
    this.gBuf[this.bufIdx] = gSum / count;
    this.bBuf[this.bufIdx] = bSum / count;
    this.bufIdx = (this.bufIdx + 1) % this.BUFFER_SIZE;
    this.frameCount++;

    // Recalculate every 30 frames (1 second)
    if (this.frameCount % 30 === 0 && this.frameCount >= 90) {
      this._compute();
    }
  }

  private _compute(): void {
    const filled = Math.min(this.frameCount, this.BUFFER_SIZE);
    const signal = this._orderedBuffer(this.gBuf, filled);

    // Detrend and bandpass filter
    const detrended = this._detrend(signal);
    const filtered  = this._bandpass(detrended, this.HR_LOW_HZ, this.HR_HIGH_HZ, this.SAMPLE_RATE);

    // Heart rate via FFT
    const fftResult = this._fft(filtered);
    const hrPeak = this._dominantFreq(fftResult, this.HR_LOW_HZ, this.HR_HIGH_HZ, this.SAMPLE_RATE, filled);
    this._hr = Math.round(hrPeak * 60);

    // Respiratory rate via amplitude envelope of cardiac signal
    const envelope = this._envelope(filtered);
    const rrFiltered = this._bandpass(envelope, this.RR_LOW_HZ, this.RR_HIGH_HZ, this.SAMPLE_RATE);
    const rrFft = this._fft(rrFiltered);
    const rrPeak = this._dominantFreq(rrFft, this.RR_LOW_HZ, this.RR_HIGH_HZ, this.SAMPLE_RATE, filled);
    this._rr = Math.round(rrPeak * 60);

    // SpO2 via red-to-blue AC/DC ratio (simplified Beer-Lambert)
    const rSig = this._orderedBuffer(this.rBuf, filled);
    const bSig = this._orderedBuffer(this.bBuf, filled);
    const rAC = this._acComponent(rSig);
    const bAC = this._acComponent(bSig);
    const rDC = this._mean(rSig);
    const bDC = this._mean(bSig);
    const R = (rAC / rDC) / (Math.max(bAC, 0.001) / Math.max(bDC, 0.001));
    // Empirical SpO2 approximation
    this._spo2 = Math.max(85, Math.min(100, Math.round(110 - 25 * R)));

    // Confidence: signal-to-noise of the filtered cardiac signal
    const snr = this._snr(filtered, hrPeak, this.SAMPLE_RATE, filled);
    this._conf = Math.max(0, Math.min(100, Math.round(snr * 20)));

    // Waveform for UI: last 150 samples, normalized 0..1
    const recent = filtered.slice(Math.max(0, filtered.length - 150));
    const mn = Math.min(...recent), mx = Math.max(...recent);
    const range = mx - mn || 1;
    this.waveform = recent.map(v => (v - mn) / range);
  }

  // ── Signal Processing Primitives ──────────────────────────────────────────

  private _orderedBuffer(buf: Float64Array, filled: number): number[] {
    const out: number[] = new Array(filled);
    const start = filled < this.BUFFER_SIZE ? 0 : this.bufIdx;
    for (let i = 0; i < filled; i++) {
      out[i] = buf[(start + i) % this.BUFFER_SIZE];
    }
    return out;
  }

  private _mean(sig: number[]): number {
    return sig.reduce((a, v) => a + v, 0) / sig.length;
  }

  private _detrend(sig: number[]): number[] {
    const mu = this._mean(sig);
    return sig.map(v => v - mu);
  }

  /** Simple 2nd-order IIR bandpass (Butterworth approximation) */
  private _bandpass(sig: number[], low: number, high: number, fs: number): number[] {
    const out = [...sig];
    // High-pass stage
    const ahp = 1 - Math.exp(-2 * Math.PI * low / fs);
    let prev = 0;
    for (let i = 0; i < out.length; i++) {
      prev = prev + ahp * (out[i] - prev);
      out[i] = out[i] - prev;
    }
    // Low-pass stage
    const alp = 1 - Math.exp(-2 * Math.PI * high / fs);
    let lpPrev = 0;
    for (let i = 0; i < out.length; i++) {
      lpPrev = lpPrev + alp * (out[i] - lpPrev);
      out[i] = lpPrev;
    }
    return out;
  }

  /** Cooley-Tukey FFT (radix-2, in-place on power-of-2 sized array) */
  private _fft(signal: number[]): { mag: number[], freqStep: number, N: number } {
    // Pad to next power of 2
    let N = 1;
    while (N < signal.length) N <<= 1;
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < signal.length; i++) re[i] = signal[i];

    // Bit-reversal permutation
    for (let i = 0, j = 0; i < N; i++) {
      if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
    }

    // Butterfly operations
    for (let len = 2; len <= N; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wRe = Math.cos(ang), wIm = Math.sin(ang);
      for (let i = 0; i < N; i += len) {
        let curRe = 1, curIm = 0;
        for (let j = 0; j < len / 2; j++) {
          const uRe = re[i + j], uIm = im[i + j];
          const vRe = re[i + j + len/2] * curRe - im[i + j + len/2] * curIm;
          const vIm = re[i + j + len/2] * curIm + im[i + j + len/2] * curRe;
          re[i + j] = uRe + vRe; im[i + j] = uIm + vIm;
          re[i + j + len/2] = uRe - vRe; im[i + j + len/2] = uIm - vIm;
          const nRe = curRe * wRe - curIm * wIm;
          curIm = curRe * wIm + curIm * wRe;
          curRe = nRe;
        }
      }
    }

    const mag: number[] = new Array(N / 2);
    for (let i = 0; i < N / 2; i++) mag[i] = Math.sqrt(re[i] ** 2 + im[i] ** 2);
    return { mag, freqStep: this.SAMPLE_RATE / N, N };
  }

  private _dominantFreq(
    fft: { mag: number[], freqStep: number, N: number },
    low: number, high: number, fs: number, len: number
  ): number {
    const { mag, freqStep } = fft;
    let bestMag = -1, bestFreq = low;
    for (let i = 0; i < mag.length; i++) {
      const freq = i * freqStep;
      if (freq < low || freq > high) continue;
      if (mag[i] > bestMag) { bestMag = mag[i]; bestFreq = freq; }
    }
    return bestFreq;
  }

  /** Amplitude envelope via absolute value + low-pass */
  private _envelope(sig: number[]): number[] {
    const abs = sig.map(Math.abs);
    return this._bandpass(abs, 0.05, 1.0, this.SAMPLE_RATE);
  }

  private _acComponent(sig: number[]): number {
    const mn = Math.min(...sig), mx = Math.max(...sig);
    return (mx - mn) / 2;
  }

  /** Simplified SNR: peak-to-average power ratio in the HR band */
  private _snr(
    sig: number[],
    peakFreq: number,
    fs: number,
    len: number
  ): number {
    const fft = this._fft(sig);
    const { mag, freqStep } = fft;
    let peakPow = 0, totalPow = 0;
    for (let i = 0; i < mag.length; i++) {
      const freq = i * freqStep;
      if (freq < this.HR_LOW_HZ || freq > this.HR_HIGH_HZ) continue;
      const p = mag[i] ** 2;
      totalPow += p;
      if (Math.abs(freq - peakFreq) < freqStep * 1.5) peakPow += p;
    }
    return totalPow > 0 ? peakPow / totalPow : 0;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  get heartRate():       number { return this._hr   || 0; }
  get respiratoryRate(): number { return this._rr   || 0; }
  get spo2():            number { return this._spo2 || 0; }
  get confidence():      number { return this._conf || 0; }
  get hasData():         boolean { return this.frameCount >= 90; }
  get framesFed():       number { return this.frameCount; }

  getReadings(): VitalReadings {
    return {
      heartRate:       this._hr,
      respiratoryRate: this._rr,
      spo2:            this._spo2,
      confidence:      this._conf,
    };
  }

  reset(): void {
    this.rBuf.fill(0);
    this.gBuf.fill(0);
    this.bBuf.fill(0);
    this.bufIdx = 0;
    this.frameCount = 0;
    this._hr = 0; this._rr = 0; this._spo2 = 0; this._conf = 0;
    this.waveform = [];
  }
}
