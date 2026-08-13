import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  signal, computed, inject, NgZone, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConvexClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { ConvexService } from '../../services/convex.service';
import { ThemeService } from '../../services/theme.service';
import { RppgEngine } from './rppg-engine';

type ScanStatus = 'idle' | 'requesting' | 'scanning' | 'done' | 'error';

@Component({
  selector: 'app-vital-detector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vital-detector.component.html',
})
export class VitalDetectorComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('waveCanvas', { static: false }) waveCanvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly convexSvc = inject(ConvexService);
  readonly themeService = inject(ThemeService);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private client!: ConvexClient;
  private engine = new RppgEngine();
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private waveRafId: number | null = null;
  private unsubs: (() => void)[] = [];

  // ── State ──────────────────────────────────────────────────────────────────
  status = signal<ScanStatus>('idle');
  scanProgress = signal(0);          // 0–100 %
  scanSeconds  = signal(0);          // elapsed seconds
  errorMsg     = signal('');

  heartRate       = signal(0);
  respiratoryRate = signal(0);
  spo2            = signal(0);
  confidence      = signal(0);
  waveform        = signal<number[]>([]);

  patients   = signal<any[]>([]);
  scanHistory = signal<any[]>([]);
  selectedPatientId = '';
  saveSuccess = signal(false);

  readonly SCAN_DURATION = 30; // seconds

  private progressInterval: ReturnType<typeof setInterval> | null = null;

  get isDark() { return this.themeService.isDark(); }

  // ── Computed helpers ───────────────────────────────────────────────────────
  readonly hrStatus = computed(() => {
    const hr = this.heartRate();
    if (hr === 0) return 'unknown';
    if (hr < 60) return 'low';
    if (hr > 100) return 'high';
    return 'normal';
  });

  readonly spo2Status = computed(() => {
    const s = this.spo2();
    if (s === 0) return 'unknown';
    if (s < 94) return 'low';
    return 'normal';
  });

  readonly rrStatus = computed(() => {
    const rr = this.respiratoryRate();
    if (rr === 0) return 'unknown';
    if (rr < 12 || rr > 20) return 'abnormal';
    return 'normal';
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.client = this.convexSvc.client;
    this.unsubs.push(
      this.client.onUpdate(api.patients.list as any, {}, (v: any) => {
        this.zone.run(() => { this.patients.set(v ?? []); this.cdr.markForCheck(); });
      }),
      this.client.onUpdate(api.vitalScans.recentScans as any, { limit: 20 }, (v: any) => {
        this.zone.run(() => { this.scanHistory.set(v ?? []); this.cdr.markForCheck(); });
      }),
    );
  }

  ngOnDestroy(): void {
    this.stopScan();
    this.unsubs.forEach(u => u());
  }

  // ── Camera & Scanning ──────────────────────────────────────────────────────
  async startScan(): Promise<void> {
    this.status.set('requesting');
    this.engine.reset();
    this.heartRate.set(0);
    this.respiratoryRate.set(0);
    this.spo2.set(0);
    this.confidence.set(0);
    this.scanProgress.set(0);
    this.scanSeconds.set(0);
    this.errorMsg.set('');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 30, facingMode: 'user' }
      });
      // Wait one tick for ViewChild to be available
      await new Promise(r => setTimeout(r, 50));
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.status.set('scanning');
      this._startFrameLoop();
      this._startProgress();
      this._startWaveRenderer();
    } catch (err: any) {
      this.status.set('error');
      this.errorMsg.set(err?.message ?? 'Camera access denied. Please allow camera permissions.');
    }
  }

  stopScan(): void {
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.waveRafId !== null) { cancelAnimationFrame(this.waveRafId); this.waveRafId = null; }
    if (this.progressInterval !== null) { clearInterval(this.progressInterval); this.progressInterval = null; }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.status() === 'scanning') this.status.set('done');
  }

  private _startProgress(): void {
    const startTime = Date.now();
    this.progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, (elapsed / this.SCAN_DURATION) * 100);
      this.zone.run(() => {
        this.scanProgress.set(pct);
        this.scanSeconds.set(Math.floor(elapsed));
        this.cdr.markForCheck();
      });
      if (elapsed >= this.SCAN_DURATION) this.stopScan();
    }, 200);
  }

  private _startFrameLoop(): void {
    const video  = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const loop = () => {
      if (this.status() !== 'scanning') return;
      if (video.readyState >= 2) {
        const W = canvas.width  = video.videoWidth  || 640;
        const H = canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, W, H);

        // Forehead ROI: top-center third of the frame
        const roiX = Math.floor(W * 0.3),  roiY = Math.floor(H * 0.08);
        const roiW = Math.floor(W * 0.4),  roiH = Math.floor(H * 0.18);
        const roiData = ctx.getImageData(roiX, roiY, roiW, roiH);
        this.engine.processFrame(roiData);

        // Update reactive signals (throttle to once per 15 frames)
        if (this.engine.framesFed % 15 === 0 && this.engine.hasData) {
          this.zone.run(() => {
            this.heartRate.set(this.engine.heartRate);
            this.respiratoryRate.set(this.engine.respiratoryRate);
            this.spo2.set(this.engine.spo2);
            this.confidence.set(this.engine.confidence);
            this.waveform.set([...this.engine.waveform]);
            this.cdr.markForCheck();
          });
        }
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private _startWaveRenderer(): void {
    const render = () => {
      const el = this.waveCanvasRef?.nativeElement;
      if (!el) { this.waveRafId = requestAnimationFrame(render); return; }
      const ctx = el.getContext('2d')!;
      const W = el.width, H = el.height;
      ctx.clearRect(0, 0, W, H);
      const pts = this.waveform();
      if (pts.length < 2) { this.waveRafId = requestAnimationFrame(render); return; }

      // Gradient line
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(99,102,241,0.2)');
      grad.addColorStop(0.5, 'rgba(99,102,241,1)');
      grad.addColorStop(1, 'rgba(99,102,241,0.2)');

      ctx.beginPath();
      ctx.strokeStyle = grad as any;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(99,102,241,0.8)';

      for (let i = 0; i < pts.length; i++) {
        const x = (i / (pts.length - 1)) * W;
        const y = H - pts[i] * H * 0.85 - H * 0.075;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      this.waveRafId = requestAnimationFrame(render);
    };
    this.waveRafId = requestAnimationFrame(render);
  }

  // ── Save to Convex ─────────────────────────────────────────────────────────
  async saveScan(): Promise<void> {
    if (!this.engine.hasData && this.status() !== 'done') return;
    try {
      await this.client.mutation(api.vitalScans.saveScan as any, {
        patientId: this.selectedPatientId || undefined,
        heartRate:       this.heartRate(),
        respiratoryRate: this.respiratoryRate(),
        spo2:            this.spo2(),
        confidence:      this.confidence(),
        scanDuration:    this.scanSeconds(),
        detectedBy:      'AI-rPPG-v1',
      });
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } catch (err) {
      console.error('Failed to save scan:', err);
    }
  }

  resetScan(): void {
    this.stopScan();
    this.engine.reset();
    this.status.set('idle');
    this.heartRate.set(0); this.respiratoryRate.set(0);
    this.spo2.set(0); this.confidence.set(0);
    this.scanProgress.set(0); this.scanSeconds.set(0);
    this.waveform.set([]);
  }

  get canSave(): boolean {
    return (this.status() === 'done' || (this.status() === 'scanning' && this.engine.hasData))
      && this.heartRate() > 0;
  }

  formatTime(secs: number): string {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  patientName(scan: any): string {
    const p = this.patients().find((pt: any) => pt._id === scan.patientId);
    return p ? `${p.firstName} ${p.lastName}` : '—';
  }
}
