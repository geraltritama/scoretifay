export type StepKey = "character" | "capacity" | "capital" | "condition" | "collateral";

export interface Application {
  id: string;
  submittedAt: string;
  values: Record<string, string>;
  scores: Record<StepKey, number>;
  totalSkor?: number;
  totalScore: number;
  totalPengajuan?: number;
  kelayakanKredit?: KelayakanKreditResult;
  decision: CreditDecision | "Approved" | "Review" | "Rejected";
}

const STORAGE_KEY = "creditscore5c.applications";

type ScoreOption = { label: string; score: number };
type ScoreRange = { min: number; max: number };
type ParameterScoreRange = ScoreRange & { label: string };

export interface FieldScoreBreakdown {
  fieldLabel: string;
  value: string;
  score: number;
}

export interface ScoreValidationError {
  scope: "field" | "category" | "total" | "option";
  step?: StepKey;
  fieldLabel?: string;
  score: number;
  min: number;
  max: number;
  message: string;
}

export interface TotalPengajuanValidation {
  valid: boolean;
  value: number;
  error?: string;
}

export type KeteranganSkor = "VERY BAD" | "BAD" | "DECENT" | "GOOD" | "EXCELLENT" | "INVALID";
export type CreditDecision = "ACCEPT" | "REJECT" | "INVALID";

export interface KelayakanKreditResult {
  totalSkor: number;
  keteranganSkor: KeteranganSkor;
  hasilKeputusanPengajuanKredit: CreditDecision;
  totalPengajuan: number;
  proporsiPinjamanYangDiAcc: number;
  pinjamanYangDiperoleh: number;
  error?: string;
}

export const PARAMETER_SCORE_RANGES: Record<StepKey, Record<string, ParameterScoreRange>> = {
  character: {
    usia: { label: "Usia", min: 0, max: 4 },
    pendidikanTerakhir: { label: "Pendidikan Terakhir", min: 1, max: 4 },
    jenisKelamin: { label: "Jenis Kelamin", min: 1, max: 2 },
    status: { label: "Status", min: 1, max: 3 },
    pekerjaan: { label: "Pekerjaan", min: 0, max: 4 },
    lamaBekerjaPadaBidangPekerjaan: {
      label: "Lama Bekerja pada Bidang Pekerjaan",
      min: 0,
      max: 4,
    },
    jabatanPekerjaan: { label: "Jabatan Pekerjaan", min: 0, max: 4 },
    jumlahTanggungan: { label: "Jumlah Tanggungan", min: 1, max: 4 },
    kepemilikanKartuDebit: { label: "Kepemilikan Kartu Debit", min: 0, max: 4 },
    kepemilikanKartuKredit: { label: "Kepemilikan Kartu Kredit", min: 0, max: 4 },
  },
  capacity: {
    penghasilanPerbulan: { label: "Penghasilan Perbulan", min: 0, max: 8 },
    pengeluaranPerbulan: { label: "Pengeluaran Perbulan", min: 0, max: 6 },
    penghasilanPasanganPerbulan: {
      label: "Penghasilan Pasangan Perbulan",
      min: 0,
      max: 8,
    },
    jumlahPinjamanAktif: { label: "Jumlah Pinjaman Aktif", min: 0, max: 4 },
    jumlahPinjamanAktifRupiah: { label: "Jumlah Pinjaman Aktif (Rupiah)", min: 0, max: 5 },
    jumlahPinjamanYangMenunggak: {
      label: "Jumlah Pinjaman yang Menunggak",
      min: 0,
      max: 4,
    },
    waktuMenunggak: { label: "Waktu Menunggak", min: 0, max: 7 },
    jangkaWaktuPinjamanAktifTerlama: {
      label: "Jumlah Waktu Pinjaman Aktif Terlama",
      min: 1,
      max: 7,
    },
  },
  capital: {
    kepemilikanAsetInvestasiLancar: {
      label: "Kepemilikan Investasi Aset Lancar",
      min: 0,
      max: 3,
    },
    kepemilikanBisnis: { label: "Kepemilikan Bisnis", min: 0, max: 3 },
    umurBisnis: { label: "Umur Bisnis", min: 0, max: 5 },
    tabunganJangkaWaktu: { label: "Tabungan (Jangka Waktu)", min: 0, max: 4 },
    totalNilaiKepemilikanSeluruhAset: {
      label: "Total Nilai Kepemilikan Seluruh Aset",
      min: 0,
      max: 5,
    },
  },
  collateral: {
    kepemilikanAsetTidakLancar: { label: "Kepemilikan Aset Tidak Lancar", min: 0, max: 5 },
    kepemilikanSK: { label: "Kepemilikan SK", min: 0, max: 5 },
    pihakLainSebagaiPenjamin: { label: "Pihak Lain Sebagai Penjamin", min: 1, max: 3 },
    lamaKepemilikanAset: { label: "Lama Kepemilikan Aset", min: 0, max: 7 },
    statusKepemilikanSK: { label: "Status Kepemilikan SK", min: 0, max: 3 },
    statusKepemilikanTempatTinggal: {
      label: "Status Kepemilikan Tempat Tinggal",
      min: 1,
      max: 5,
    },
  },
  condition: {
    kondisiKeuangan6BulanTerakhir: {
      label: "Kondisi Keuangan 6 Bulan Terakhir",
      min: 0,
      max: 6,
    },
    pengaruhMakroEkonomiTerhadapPendapatan: {
      label: "Pengaruh Makro Ekonomi Terhadap Pendapatan",
      min: 0,
      max: 4,
    },
    posisiPerusahaan: { label: "Posisi Perusahaan", min: 0, max: 5 },
    hargaProduksiUsaha: { label: "Harga Produk Usaha", min: 0, max: 5 },
  },
};

export const CATEGORY_SCORE_RANGES: Record<StepKey, ScoreRange> = {
  character: { min: 4, max: 37 },
  capacity: { min: 1, max: 49 },
  capital: { min: 0, max: 20 },
  collateral: { min: 2, max: 28 },
  condition: { min: 0, max: 20 },
};

export const TOTAL_SCORE_RANGE: ScoreRange = { min: 7, max: 154 };

export const SCORING_RUBRIC: Record<StepKey, Record<string, ScoreOption[]>> = {
  character: {
    Usia: [
      { label: "< 25 tahun", score: 1 },
      { label: "25 tahun - 35 tahun", score: 3 },
      { label: "35 tahun - 45 tahun", score: 4 },
      { label: "46 tahun - 60 tahun", score: 2 },
      { label: "> 60 tahun", score: 0 },
    ],
    "Pendidikan Terakhir": [
      { label: "SD", score: 1 },
      { label: "SMP - SMA", score: 2 },
      { label: "D1 - D4/S1", score: 3 },
      { label: "Pasca Sarjana", score: 4 },
    ],
    "Jenis Kelamin": [
      { label: "Laki-laki", score: 2 },
      { label: "Perempuan", score: 1 },
    ],
    Status: [
      { label: "Cerai", score: 1 },
      { label: "Menikah", score: 2 },
      { label: "Belum menikah", score: 3 },
    ],
    Pekerjaan: [
      { label: "Tidak bekerja", score: 0 },
      { label: "Wiraswasta", score: 2 },
      { label: "PNS/Pegawai tetap", score: 4 },
      { label: "Profesional", score: 3 },
      { label: "Pegawai kontrak", score: 1 },
    ],
    "Lama Bekerja pada Bidang Pekerjaan": [
      { label: "Tidak bekerja", score: 0 },
      { label: "< 1 tahun", score: 1 },
      { label: "1-5 tahun", score: 2 },
      { label: "6-10 tahun", score: 3 },
      { label: "> 10 tahun", score: 4 },
    ],
    "Jabatan Pekerjaan": [
      { label: "Tidak bekerja", score: 0 },
      { label: "Staff", score: 1 },
      { label: "Supervisor", score: 2 },
      { label: "Manager", score: 3 },
      { label: "Owner", score: 4 },
    ],
    "Jumlah Tanggungan": [
      { label: "Tidak ada", score: 4 },
      { label: "1-2 orang", score: 3 },
      { label: "3-5 orang", score: 2 },
      { label: "> 5 orang", score: 1 },
    ],
    "Kepemilikan Kartu Debit": [
      { label: "Tidak punya", score: 0 },
      { label: "1 kartu", score: 1 },
      { label: "2-3 kartu", score: 2 },
      { label: "4-5 kartu", score: 3 },
      { label: "> 5 kartu", score: 4 },
    ],
    "Kepemilikan Kartu Kredit": [
      { label: "Tidak punya", score: 0 },
      { label: "1 kartu", score: 1 },
      { label: "2-3 kartu", score: 2 },
      { label: "4-5 kartu", score: 3 },
      { label: "> 5 kartu", score: 4 },
    ],
  },
  capacity: {
    "Penghasilan Perbulan": [
      { label: "< Rp 1.000.000", score: 0 },
      { label: "Rp 1.000.000 - Rp 4.999.999", score: 1 },
      { label: "Rp 5.000.000 - Rp 9.999.999", score: 2 },
      { label: "Rp 10.000.000 - Rp 14.999.999", score: 3 },
      { label: "Rp 15.000.000 - Rp 19.999.999", score: 4 },
      { label: "Rp 20.000.000 - Rp 24.999.999", score: 5 },
      { label: "Rp 25.000.000 - Rp 49.999.999", score: 6 },
      { label: "Rp 50.000.000 - Rp 100.000.000", score: 7 },
      { label: "> Rp 100.000.000", score: 8 },
    ],
    "Pengeluaran Perbulan": [
      { label: "> Rp 100.000.000", score: 0 },
      { label: "Rp 50.000.000 - Rp 100.000.000", score: 1 },
      { label: "Rp 25.000.000 - Rp 49.999.999", score: 2 },
      { label: "Rp 20.000.000 - Rp 24.999.999", score: 3 },
      { label: "Rp 10.000.000 - Rp 19.999.999", score: 4 },
      { label: "Rp 1.000.000 - Rp 9.999.999", score: 5 },
      { label: "< Rp 1.000.000", score: 6 },
    ],
    "Penghasilan Pasangan Perbulan": [
      { label: "< Rp 1.000.000", score: 0 },
      { label: "Rp 1.000.000 - Rp 4.999.999", score: 1 },
      { label: "Rp 5.000.000 - Rp 9.999.999", score: 2 },
      { label: "Rp 10.000.000 - Rp 14.999.999", score: 3 },
      { label: "Rp 15.000.000 - Rp 19.999.999", score: 4 },
      { label: "Rp 20.000.000 - Rp 24.999.999", score: 5 },
      { label: "Rp 25.000.000 - Rp 49.999.999", score: 6 },
      { label: "Rp 50.000.000 - Rp 100.000.000", score: 7 },
      { label: "> Rp 100.000.000", score: 8 },
    ],
    "Jumlah Pinjaman Aktif": [
      { label: "Tidak ada", score: 4 },
      { label: "1 - 2 pinjaman", score: 2 },
      { label: "3 - 5 pinjaman", score: 1 },
      { label: "> 5 pinjaman", score: 0 },
    ],
    "Jumlah Pinjaman Aktif (Rupiah)": [
      { label: "0 - Rp 1.000.000", score: 5 },
      { label: "Rp 1.000.001 - Rp 10.000.000", score: 4 },
      { label: "Rp 10.000.001 - Rp 50.000.000", score: 3 },
      { label: "Rp 50.000.001 - Rp 100.000.000", score: 2 },
      { label: "Rp 100.000.001 - Rp 200.000.000", score: 1 },
      { label: "> Rp 200.000.000", score: 0 },
    ],
    "Jumlah Pinjaman yang Menunggak": [
      { label: "Tidak ada", score: 4 },
      { label: "1 - 2 pinjaman", score: 1 },
      { label: "3 - 5 pinjaman", score: 0 },
    ],
    "Waktu Menunggak": [
      { label: "Tidak ada", score: 7 },
      { label: "< 1 bulan", score: 6 },
      { label: "1 - 3 bulan", score: 4 },
      { label: "4 - 6 bulan", score: 2 },
      { label: "> 6 bulan", score: 0 },
    ],
    "Jumlah Waktu Pinjaman Aktif Terlama": [
      { label: "Tidak ada", score: 7 },
      { label: "< 1 tahun", score: 6 },
      { label: "1 - 3 tahun", score: 5 },
      { label: "4 - 5 tahun", score: 3 },
      { label: "6 - 10 tahun", score: 2 },
      { label: "> 10 tahun", score: 1 },
    ],
  },
  capital: {
    "Kepemilikan Investasi Aset Lancar": [
      { label: "Tidak Ada", score: 0 },
      { label: "Obligasi/Sukuk", score: 3 },
      { label: "Reksa dana", score: 2 },
      { label: "Saham", score: 1 },
    ],
    "Kepemilikan Bisnis": [
      { label: "Ada", score: 3 },
      { label: "Tidak Ada", score: 0 },
    ],
    "Total Nilai Kepemilikan Seluruh Aset": [
      { label: "Tidak ada", score: 0 },
      { label: "< Rp 50.000.000", score: 1 },
      { label: "Rp 50.000.000 - Rp 199.999.999", score: 2 },
      { label: "Rp 200.000.000 - Rp 499.999.999", score: 3 },
      { label: "Rp 500.000.000 - Rp 1.000.000.000", score: 4 },
      { label: "> Rp 1.000.000.000", score: 5 },
    ],
    "Umur Bisnis": [
      { label: "Tidak ada", score: 0 },
      { label: "< 1 tahun", score: 1 },
      { label: "1-2 tahun", score: 2 },
      { label: "3-5 tahun", score: 3 },
      { label: "> 5 tahun", score: 5 },
    ],
    "Tabungan (Jangka Waktu)": [
      { label: "Tidak ada", score: 0 },
      { label: "< 1 tahun", score: 1 },
      { label: "1-4 tahun", score: 2 },
      { label: "5-8 tahun", score: 3 },
      { label: "> 8 tahun", score: 4 },
    ],
  },
  condition: {
    "Kondisi Keuangan 6 Bulan Terakhir": [
      { label: "Turun", score: 0 },
      { label: "Stabil", score: 3 },
      { label: "Naik", score: 6 },
    ],
    "Pengaruh Makro Ekonomi Terhadap Pendapatan": [
      { label: "Sangat Terpengaruh", score: 0 },
      { label: "Terpengaruh", score: 2 },
      { label: "Tidak Terpengaruh", score: 4 },
    ],
    "Posisi Perusahaan": [
      { label: "Tidak punya", score: 0 },
      { label: "Pendatang baru", score: 1 },
      { label: "Market Nicher", score: 2 },
      { label: "Market Follower", score: 3 },
      { label: "Market Challenger", score: 4 },
      { label: "Market Leader", score: 5 },
    ],
    "Harga Produk Usaha": [
      { label: "Tidak punya", score: 0 },
      { label: "Harga bersaing", score: 1 },
      { label: "Harga stabil", score: 3 },
      { label: "Tidak sensitif dengan perubahan harga", score: 5 },
    ],
  },
  collateral: {
    "Kepemilikan SK": [
      { label: "Tidak ada", score: 0 },
      { label: "Ada", score: 5 },
    ],
    "Kepemilikan Aset Tidak Lancar": [
      { label: "Tidak ada", score: 0 },
      { label: "Kendaraan", score: 2 },
      { label: "Mesin dan Peralatan", score: 3 },
      { label: "Bangunan", score: 4 },
      { label: "Tanah", score: 5 },
    ],
    "Lama Kepemilikan Aset": [
      { label: "Tidak ada", score: 0 },
      { label: "> 10 tahun", score: 1 },
      { label: "8 - 10 tahun", score: 3 },
      { label: "5 - 7 tahun", score: 4 },
      { label: "3 - 4 tahun", score: 5 },
      { label: "1 - 2 tahun", score: 6 },
      { label: "< 1 tahun", score: 7 },
    ],
    "Pihak Lain Sebagai Penjamin": [
      { label: "Keluarga", score: 3 },
      { label: "Kerabat", score: 2 },
      { label: "Pihak lain", score: 1 },
    ],
    "Status Kepemilikan SK": [
      { label: "Tidak ada", score: 0 },
      { label: "Pihak ketiga", score: 1 },
      { label: "Pribadi", score: 3 },
    ],
    "Status Kepemilikan Tempat Tinggal": [
      { label: "Sewa/Kontrak", score: 1 },
      { label: "Rumah KPR", score: 2 },
      { label: "Rumah atas nama pribadi", score: 5 },
    ],
  },
};

export function loadApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

export function saveApplication(app: Application) {
  const all = loadApplications();
  all.unshift(app);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isInRange(score: number, range: ScoreRange) {
  return score >= range.min && score <= range.max;
}

function findParameterRange(step: StepKey, fieldLabel: string): ParameterScoreRange | undefined {
  return Object.values(PARAMETER_SCORE_RANGES[step]).find((range) => range.label === fieldLabel);
}

export function getRubricOptions(step: StepKey, fieldLabel: string): string[] {
  return (SCORING_RUBRIC[step][fieldLabel] ?? []).map((option) => option.label);
}

export function scoreField(step: StepKey, fieldLabel: string, value: string): number {
  if (!value) return 0;
  const selected = findScoreOption(step, fieldLabel, value);
  return selected?.score ?? 0;
}

function findScoreOption(
  step: StepKey,
  fieldLabel: string,
  value: string,
): ScoreOption | undefined {
  const options = SCORING_RUBRIC[step][fieldLabel] ?? [];
  return options.find((option) => normalize(option.label) === normalize(value));
}

export function validateTotalPengajuan(rawValue: string): TotalPengajuanValidation {
  const normalizedValue = rawValue.trim();

  if (!/^[1-9]\d*$/.test(normalizedValue)) {
    return {
      valid: false,
      value: 0,
      error: "Total pengajuan harus berupa angka bulat positif tanpa desimal.",
    };
  }

  const value = Number(normalizedValue);
  if (!Number.isSafeInteger(value)) {
    return {
      valid: false,
      value: 0,
      error: "Total pengajuan terlalu besar untuk diproses dengan aman.",
    };
  }

  return { valid: true, value };
}

export function scoreStep(step: StepKey, values: Record<string, string>): number {
  const fieldLabels = Object.keys(SCORING_RUBRIC[step]);
  if (fieldLabels.length === 0) return 0;
  const total = fieldLabels.reduce(
    (sum, fieldLabel) => sum + scoreField(step, fieldLabel, values[fieldLabel] ?? ""),
    0,
  );
  return total;
}

export function getStepMaxScore(step: StepKey): number {
  return Object.values(SCORING_RUBRIC[step]).reduce((sum, options) => {
    return sum + Math.max(...options.map((option) => option.score), 0);
  }, 0);
}

export function validateFieldScore(
  step: StepKey,
  fieldLabel: string,
  score: number,
): ScoreValidationError | undefined {
  const range = findParameterRange(step, fieldLabel);
  if (!range || isInRange(score, range)) return undefined;

  return {
    scope: "field",
    step,
    fieldLabel,
    score,
    min: range.min,
    max: range.max,
    message: `${fieldLabel} harus berada pada range ${range.min}-${range.max}.`,
  };
}

export function validateStepScore(step: StepKey, score: number): ScoreValidationError | undefined {
  const range = CATEGORY_SCORE_RANGES[step];
  if (isInRange(score, range)) return undefined;

  return {
    scope: "category",
    step,
    score,
    min: range.min,
    max: range.max,
    message: `Subtotal ${step} harus berada pada range ${range.min}-${range.max}.`,
  };
}

export function validateTotalScore(score: number): ScoreValidationError | undefined {
  if (isInRange(score, TOTAL_SCORE_RANGE)) return undefined;

  return {
    scope: "total",
    score,
    min: TOTAL_SCORE_RANGE.min,
    max: TOTAL_SCORE_RANGE.max,
    message: `Total skor harus berada pada range ${TOTAL_SCORE_RANGE.min}-${TOTAL_SCORE_RANGE.max}.`,
  };
}

export function validateApplicationScores(values: Record<string, string>): {
  scores: Record<StepKey, number>;
  totalSkor: number;
  errors: ScoreValidationError[];
} {
  const scores = {} as Record<StepKey, number>;
  const errors: ScoreValidationError[] = [];
  const steps = Object.keys(SCORING_RUBRIC) as StepKey[];

  for (const step of steps) {
    for (const fieldLabel of Object.keys(SCORING_RUBRIC[step])) {
      const value = values[fieldLabel] ?? "";
      const score = scoreField(step, fieldLabel, value);
      if (value && !findScoreOption(step, fieldLabel, value)) {
        errors.push({
          scope: "option",
          step,
          fieldLabel,
          score,
          min: 0,
          max: 0,
          message: `${fieldLabel} memiliki pilihan yang tidak valid. Pilih ulang dari daftar yang tersedia.`,
        });
        continue;
      }

      const fieldError = validateFieldScore(step, fieldLabel, score);
      if (fieldError) errors.push(fieldError);
    }

    const subtotal = scoreStep(step, values);
    scores[step] = subtotal;

    const subtotalError = validateStepScore(step, subtotal);
    if (subtotalError) errors.push(subtotalError);
  }

  const totalSkor = steps.reduce((sum, step) => sum + scores[step], 0);
  const totalError = validateTotalScore(totalSkor);
  if (totalError) errors.push(totalError);

  return { scores, totalSkor, errors };
}

export function getFieldScoreBreakdown(
  step: StepKey,
  values: Record<string, string>,
): FieldScoreBreakdown[] {
  return Object.keys(SCORING_RUBRIC[step]).map((fieldLabel) => {
    const value = values[fieldLabel] ?? "";
    return {
      fieldLabel,
      value,
      score: scoreField(step, fieldLabel, value),
    };
  });
}

function hasScorableValues(app: Application, step: StepKey): boolean {
  return Object.keys(SCORING_RUBRIC[step]).some((fieldLabel) => Boolean(app.values[fieldLabel]));
}

export function getApplicationStepScore(app: Application, step: StepKey): number {
  if (hasScorableValues(app, step)) {
    return scoreStep(step, app.values);
  }

  return app.scores[step] ?? 0;
}

export function getApplicationScores(app: Application): Record<StepKey, number> {
  const steps = Object.keys(SCORING_RUBRIC) as StepKey[];

  return steps.reduce(
    (scores, step) => ({
      ...scores,
      [step]: getApplicationStepScore(app, step),
    }),
    {} as Record<StepKey, number>,
  );
}

export function hitungKelayakanKredit(
  totalSkor: number,
  totalPengajuan: number,
): KelayakanKreditResult {
  if (!isInRange(totalSkor, TOTAL_SCORE_RANGE)) {
    return {
      totalSkor,
      keteranganSkor: "INVALID",
      hasilKeputusanPengajuanKredit: "INVALID",
      totalPengajuan,
      proporsiPinjamanYangDiAcc: 0,
      pinjamanYangDiperoleh: 0,
      error: `Total skor harus berada pada range ${TOTAL_SCORE_RANGE.min}-${TOTAL_SCORE_RANGE.max}.`,
    };
  }

  if (totalPengajuan <= 0) {
    return {
      totalSkor,
      keteranganSkor: "INVALID",
      hasilKeputusanPengajuanKredit: "INVALID",
      totalPengajuan,
      proporsiPinjamanYangDiAcc: 0,
      pinjamanYangDiperoleh: 0,
      error: "Total pengajuan harus lebih besar dari 0.",
    };
  }

  const keteranganSkor =
    totalSkor <= 36
      ? "VERY BAD"
      : totalSkor <= 66
        ? "BAD"
        : totalSkor <= 96
          ? "DECENT"
          : totalSkor <= 126
            ? "GOOD"
            : "EXCELLENT";

  const proporsiPinjamanYangDiAcc =
    keteranganSkor === "DECENT"
      ? 0.4
      : keteranganSkor === "GOOD"
        ? 0.6
        : keteranganSkor === "EXCELLENT"
          ? 0.8
          : 0;

  const hasilKeputusanPengajuanKredit = proporsiPinjamanYangDiAcc > 0 ? "ACCEPT" : "REJECT";

  return {
    totalSkor,
    keteranganSkor,
    hasilKeputusanPengajuanKredit,
    totalPengajuan,
    proporsiPinjamanYangDiAcc,
    pinjamanYangDiperoleh: totalPengajuan * proporsiPinjamanYangDiAcc,
  };
}

export function getApplicationTotalSkor(app: Application): number {
  const steps = Object.keys(SCORING_RUBRIC) as StepKey[];
  const shouldRecalculate = steps.some((step) => hasScorableValues(app, step));

  if (shouldRecalculate) {
    return steps.reduce((total, step) => total + getApplicationStepScore(app, step), 0);
  }

  return app.totalSkor ?? app.totalScore;
}

export function getApplicationKelayakan(app: Application): KelayakanKreditResult | undefined {
  const totalPengajuan = app.totalPengajuan ?? app.kelayakanKredit?.totalPengajuan;
  if (!totalPengajuan) return app.kelayakanKredit;

  const shouldRecalculate = (Object.keys(SCORING_RUBRIC) as StepKey[]).some((step) =>
    hasScorableValues(app, step),
  );
  if (shouldRecalculate) {
    const validation = validateApplicationScores(app.values);
    if (validation.errors.length > 0) {
      return {
        totalSkor: validation.totalSkor,
        keteranganSkor: "INVALID",
        hasilKeputusanPengajuanKredit: "INVALID",
        totalPengajuan,
        proporsiPinjamanYangDiAcc: 0,
        pinjamanYangDiperoleh: 0,
        error: validation.errors[0].message,
      };
    }
  }

  return hitungKelayakanKredit(getApplicationTotalSkor(app), totalPengajuan);
}

export function getApplicationDecision(
  app: Application,
): CreditDecision | "Approved" | "Review" | "Rejected" {
  return getApplicationKelayakan(app)?.hasilKeputusanPengajuanKredit ?? app.decision;
}
