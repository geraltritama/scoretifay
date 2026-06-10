import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StepCard, SelectField, StepKey } from "@/components/StepCard";
import { saveApplication, scoreField, decisionFromScore } from "@/lib/applications";


export const Route = createFileRoute("/_app/new-application")({
  head: () => ({ meta: [{ title: "New Application — CreditScore5C" }] }),
  component: NewApplication,
});

const STEP_ORDER: StepKey[] = ["character", "capacity", "capital", "condition", "collateral"];

const FIELDS: Record<StepKey, { title: string; subtitle: string; fields: { label: string; placeholder: string; options: string[] }[] }> = {
  character: {
    title: "Character",
    subtitle: "Your credit reputation and repayment track record.",
    fields: [
      { label: "Usia", placeholder: "Pilih Rentang Usia", options: ["< 25", "25-35", "36-45", "46-55", "> 55"] },
      { label: "Pendidikan Terakhir", placeholder: "Pilih Pendidikan Terakhir", options: ["SMA", "Diploma", "S1", "S2", "S3"] },
      { label: "Jenis Kelamin", placeholder: "Pilih Jenis Kelamin", options: ["Laki-laki", "Perempuan"] },
      { label: "Status", placeholder: "Pilih Status", options: ["Belum Menikah", "Menikah", "Cerai"] },
      { label: "Pekerjaan", placeholder: "Pilih Pekerjaan", options: ["Karyawan Swasta", "PNS", "Wiraswasta", "Profesional"] },
      { label: "Lama Bekerja pada Bidang Pekerjaan", placeholder: "Pilih Lama Bekerja", options: ["< 1 tahun", "1-3 tahun", "3-5 tahun", "> 5 tahun"] },
      { label: "Jabatan Pekerjaan", placeholder: "Pilih Jabatan Pekerjaan", options: ["Staff", "Supervisor", "Manager", "Direktur"] },
      { label: "Jumlah Tanggungan", placeholder: "Pilih Jumlah Tanggungan", options: ["0", "1", "2", "3", "4+"] },
      { label: "Kepemilikan Kartu Debit", placeholder: "Pilih Kepemilikan Kartu Debit", options: ["Ya", "Tidak"] },
    ],
  },
  capacity: {
    title: "Capacity",
    subtitle: "Your ability to repay based on income and obligations.",
    fields: [
      { label: "Penghasilan Perbulan", placeholder: "Pilih Penghasilan", options: ["< 5 juta", "5-10 juta", "10-25 juta", "> 25 juta"] },
      { label: "Pengeluaran Perbulan", placeholder: "Pilih Pengeluaran", options: ["< 3 juta", "3-7 juta", "7-15 juta", "> 15 juta"] },
      { label: "Penghasilan Pasangan Perbulan", placeholder: "Pilih Penghasilan Pasangan", options: ["Tidak ada", "< 5 juta", "5-10 juta", "> 10 juta"] },
      { label: "Jumlah Pinjaman Aktif", placeholder: "Pilih Jumlah Pinjaman", options: ["0", "1", "2", "3+"] },
      { label: "Jumlah Pinjaman Aktif (Rp)", placeholder: "Pilih Jumlah Pinjaman (Rp)", options: ["< 10 juta", "10-50 juta", "50-100 juta", "> 100 juta"] },
      { label: "Jumlah Pinjaman yang Menunggak", placeholder: "Pilih Jumlah Pinjaman Menunggak", options: ["0", "1", "2+"] },
      { label: "Jumlah Waktu Pinjaman Aktif Terlama", placeholder: "Pilih Jumlah Pinjaman Aktif Terlama", options: ["< 1 tahun", "1-3 tahun", "> 3 tahun"] },
    ],
  },
  capital: {
    title: "Capital",
    subtitle: "Your savings, investments, and net financial position.",
    fields: [
      { label: "Kepemilikan Investasi Aset Lancar", placeholder: "Pilih Kepemilikan Investasi", options: ["Ya", "Tidak"] },
      { label: "Kepemilikan Bisnis", placeholder: "Pilih Kepemilikan Bisnis", options: ["Ya", "Tidak"] },
      { label: "Total Nilai Kepemilikan Seluruh Aset", placeholder: "Pilih Total Kepemilikan Seluruh Aset", options: ["< 100 juta", "100-500 juta", "500 juta - 1 M", "> 1 M"] },
      { label: "Umur Bisnis", placeholder: "Pilih Umur Bisnis", options: ["Tidak ada", "< 1 tahun", "1-5 tahun", "> 5 tahun"] },
      { label: "Tabungan (Jangka Waktu)", placeholder: "Pilih Jangka Waktu Tabungan", options: ["< 1 tahun", "1-3 tahun", "> 3 tahun"] },
    ],
  },
  condition: {
    title: "Condition",
    subtitle: "The purpose, amount, and terms of the requested loan.",
    fields: [
      { label: "Kondisi Keuangan 6 Bulan Terakhir", placeholder: "Pilih Kondisi Keuangan", options: ["Stabil", "Meningkat", "Menurun"] },
      { label: "Pengaruh Makro Ekonomi Terhadap Pendapatan", placeholder: "Pilih Pengaruh Makro Ekonomi", options: ["Tidak ada", "Sedikit", "Sedang", "Besar"] },
      { label: "Posisi Perusahaan", placeholder: "Pilih Posisi Perusahaan", options: ["Berkembang", "Stabil", "Menurun"] },
      { label: "Harga Produk Usaha", placeholder: "Pilih Harga Produk Usaha", options: ["Murah", "Sedang", "Mahal"] },
    ],
  },
  collateral: {
    title: "Collateral",
    subtitle: "Assets pledged to secure the loan.",
    fields: [
      { label: "Kepemilikan SK", placeholder: "Pilih Kepemilikan SK", options: ["Ya", "Tidak"] },
      { label: "Kepemilikan Aset Tidak Lancar", placeholder: "Pilih Kepemilikan Aset Tidak Lancar", options: ["Ya", "Tidak"] },
      { label: "Lama Kepemilikan Aset", placeholder: "Pilih Lama Kepemilikan Aset", options: ["< 1 tahun", "1-5 tahun", "> 5 tahun"] },
      { label: "Pihak Lain Sebagai Penjamin", placeholder: "Pilih Pihak Lain Sebagai Penjamin", options: ["Ada", "Tidak ada"] },
      { label: "Status Kepemilikan SK", placeholder: "Pilih Status Kepemilikan SK", options: ["Pribadi", "Bersama"] },
      { label: "Status Kepemilikan Tempat Tinggal", placeholder: "Pilih Status Kepemilikan Tempat Tinggal", options: ["Milik Sendiri", "Sewa", "Milik Keluarga"] },
    ],
  },
};

function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>("character");
  const [values, setValues] = useState<Record<string, string>>({});

  const config = FIELDS[step];

  const handleSubmit = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate({ to: "/my-applications" });
    }
  };

  return (
    <StepCard
      current={step}
      title={config.title}
      subtitle={config.subtitle}
      onSubmit={handleSubmit}
    >
      {config.fields.map((f) => (
        <SelectField
          key={f.label}
          label={f.label}
          placeholder={f.placeholder}
          options={f.options}
          value={values[f.label] ?? ""}
          onChange={(v) => setValues((s) => ({ ...s, [f.label]: v }))}
        />
      ))}
    </StepCard>
  );
}
