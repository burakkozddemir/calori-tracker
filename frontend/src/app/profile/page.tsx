"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activity: "sedentary",
    goal: "maintain",
    target_weight: "",
    weight_note: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await api.auth.me();
      setProfile({
        age: user.age?.toString() || "",
        height: user.height?.toString() || "",
        weight: user.weight?.toString() || "",
        gender: user.gender || "male",
        activity: user.activity || "sedentary",
        goal: user.goal || "maintain",
        target_weight: user.target_weight?.toString() || "",
        weight_note: user.weight_note || "",
      });
    } catch {
      console.error("Profil yüklenemedi");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.auth.updateProfile({
        age: Number(profile.age),
        height: Number(profile.height),
        weight: Number(profile.weight),
        gender: profile.gender,
        activity: profile.activity,
        goal: profile.goal,
        target_weight: profile.target_weight ? Number(profile.target_weight) : null,
        weight_note: profile.weight_note || null,
      });
      setMsg("Profil güncellendi!");
    } catch (err: any) {
      setMsg(err.message || "Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <h1 className="font-bold text-gray-800 dark:text-gray-100">Profilim</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <form onSubmit={handleSave} className="card p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-bold text-center text-gray-800 dark:text-gray-100">Kişisel Bilgiler</h2>

          {msg && (
            <div
              className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
                msg.includes("Hata")
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                  : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
              }`}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Yaş</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Boy (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Kilo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Cinsiyet</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="input-field"
              >
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Aktivite Seviyesi</label>
            <select
              value={profile.activity}
              onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
              className="input-field"
            >
              <option value="sedentary">Sedanter (Masa başı)</option>
              <option value="light">Hafif Aktif (Haftada 1-3 gün)</option>
              <option value="moderate">Orta Aktif (Haftada 3-5 gün)</option>
              <option value="active">Aktif (Haftada 6-7 gün)</option>
              <option value="very_active">Çok Aktif (Günde 2 kez)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Hedef</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "lose", label: "Kilo Ver", icon: "📉" },
                { value: "maintain", label: "Koruma", icon: "⚖️" },
                { value: "gain", label: "Kilo Al", icon: "📈" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, goal: g.value })}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    profile.goal === g.value
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-700"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="block text-lg">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Hedef Kilo & Not</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Hedef Kilo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="örn: 75.0"
                  value={profile.target_weight}
                  onChange={(e) => setProfile({ ...profile, target_weight: e.target.value })}
                  className="input-field"
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5">
                  Tartı ölçümlerine göre kaç günde ulaşacağınızı hesaplar
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1.5 font-medium">Not</label>
                <textarea
                  rows={3}
                  placeholder="Kilo verme sürecinle ilgili notların..."
                  value={profile.weight_note}
                  onChange={(e) => setProfile({ ...profile, weight_note: e.target.value })}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              "Kaydet"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
