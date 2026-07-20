"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { Logo } from "@/components/Logo";

function localDate(d?: Date) {
  const now = d || new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getToday() {
  return localDate();
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

function shiftDate(d: string, days: number) {
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day + days);
  return localDate(date);
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Kahvaltı",
  lunch: "Öğle",
  dinner: "Akşam",
  snack: "Atıştırma",
  other: "Diğer",
};

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      title={theme === "light" ? "Dark mode" : "Light mode"}
    >
      {theme === "light" ? (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [todayWeight, setTodayWeight] = useState<any>(null);
  const [weightInput, setWeightInput] = useState("");
  const [weightCondition, setWeightCondition] = useState<"full" | "empty">("empty");
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [projection, setProjection] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadDaily();
    loadWeightData();
  }, [selectedDate]);

  const loadDaily = async () => {
    setLoading(true);
    try {
      const data = await api.food.daily(selectedDate);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeightData = async () => {
    try {
      const [today, history, proj] = await Promise.all([
        api.weight.today(),
        api.weight.historyAll(),
        api.weight.projection(),
      ]);
      setTodayWeight(today);
      setWeightHistory(history);
      setProjection(proj);
      if (today) {
        setWeightInput(today.weight.toString());
        setWeightCondition(today.condition);
      } else {
        setWeightInput("");
        setWeightCondition("empty");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWeight = async () => {
    if (!weightInput) return;
    setWeightSaving(true);
    try {
      const result = await api.weight.add(parseFloat(weightInput), weightCondition);
      setTodayWeight(result);
      loadWeightData();
    } catch (err) {
      console.error(err);
    } finally {
      setWeightSaving(false);
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await api.food.remove(id);
      setDeleteConfirm(null);
      loadDaily();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWeight = async (id: number) => {
    if (!window.confirm("Bu tartı ölçümünü silmek istediğine emin misin?")) return;
    try {
      await api.weight.remove(id);
      loadWeightData();
    } catch (err) {
      console.error(err);
    }
  };

  const isToday = selectedDate === getToday();
  const target = summary?.target_calorie || 2000;
  const consumed = summary?.total_calorie || 0;
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min((consumed / target) * 100, 100);

  const meals = summary?.meals || [];
  const groupedMeals = meals.reduce((acc: any, meal: any) => {
    const type = meal.meal_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  const last7 = weightHistory.slice(0, 7).reverse();
  const weightMin = last7.length > 0 ? Math.min(...last7.map((w: any) => w.weight)) : 0;
  const weightMax = last7.length > 0 ? Math.max(...last7.map((w: any) => w.weight)) : 100;
  const weightRange = weightMax - weightMin || 1;

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">CaloriTrack</h1>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={() => router.push("/profile")}
              className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="card p-4 flex items-center justify-between animate-fade-in">
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{formatDate(selectedDate)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {isToday ? "Bugün" : selectedDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getToday())}
                className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition"
              >
                Bugün
              </button>
            )}
            <button
              onClick={() => !isToday && setSelectedDate(shiftDate(selectedDate, 1))}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                isToday
                  ? "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-700 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              disabled={isToday}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500">Kalori İlerlemesi</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{consumed.toFixed(0)}</span>
                <span className="text-gray-400 dark:text-gray-500">/ {target} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${remaining > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {remaining.toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">kalan</p>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative"
                style={{
                  width: `${progress}%`,
                  background: progress > 90
                    ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                    : "linear-gradient(90deg, #34d399, #22c55e)",
                }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span>0</span>
              <span>{target}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/add-food?date=${selectedDate}`)}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all animate-slide-up flex items-center justify-center gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yemek Ekle
        </button>

        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="stat-card">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Protein</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {(summary?.total_protein || 0).toFixed(0)}<span className="text-sm font-normal text-gray-400">g</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Yağ</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {(summary?.total_fat || 0).toFixed(0)}<span className="text-sm font-normal text-gray-400">g</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Karbonhidrat</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {(summary?.total_carb || 0).toFixed(0)}<span className="text-sm font-normal text-gray-400">g</span>
            </p>
          </div>
        </div>

        {Object.keys(groupedMeals).length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 px-1">Yiyecekler</h3>
            <div className="space-y-3">
              {Object.entries(groupedMeals).map(([type, items]: [string, any]) => (
                <div key={type} className="card overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{MEAL_LABELS[type] || type}</p>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {items.map((meal: any) => (
                      <div
                        key={meal.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{meal.food_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{meal.gram}g</span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-500">P {meal.protein.toFixed(0)}g</span>
                              <span className="text-amber-500">Y {meal.fat.toFixed(0)}g</span>
                              <span className="text-rose-500">K {meal.carb.toFixed(0)}g</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{meal.calorie.toFixed(0)}</span>
                          <button
                            onClick={() => handleDeleteFood(meal.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition font-medium text-sm ${
                              deleteConfirm === meal.id
                                ? "bg-red-500 text-white animate-pulse"
                                : "text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            }`}
                          >
                            {deleteConfirm === meal.id ? (
                              <span className="text-xs">Sil?</span>
                            ) : (
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {meals.length === 0 && !loading && (
          <div className="card p-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Bu tarihte yemek eklenmemiş</p>
            <button
              onClick={() => router.push(`/add-food?date=${selectedDate}`)}
              className="mt-4 text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300"
            >
              + İlk yemeği ekle
            </button>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-5 animate-slide-up" style={{ animationDelay: "0.25s" }}>
          {isToday && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Tartı</p>
                    {todayWeight && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Bugünkü ölçüm kaydedildi
                      </p>
                    )}
                  </div>
                </div>
                {todayWeight && (
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    todayWeight.condition === "full"
                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  }`}>
                    {todayWeight.condition === "full" ? "Tok" : "Aç"}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="72.5"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="input-field !text-2xl !font-bold !py-3 !pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">kg</span>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setWeightCondition("empty")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    weightCondition === "empty"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  }`}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Aç
                </button>
                <button
                  onClick={() => setWeightCondition("full")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    weightCondition === "full"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  }`}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Tok
                </button>
              </div>

              <button
                onClick={handleSaveWeight}
                disabled={!weightInput || weightSaving}
                className="w-full py-2.5 rounded-xl bg-violet-500 text-white font-medium text-sm hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {weightSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : todayWeight ? (
                  "Güncelle"
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>
          )}

          {!isToday && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Tartı</p>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                Sadece bugünkü tartı ölçümleri kaydedilebilir
              </p>
            </div>
          )}

          {last7.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Son Ölçümler</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> Aç
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Tok
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 80 }}>
                {last7.map((w: any, i: number) => {
                  const h = ((w.weight - weightMin) / weightRange) * 50 + 20;
                  return (
                    <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{w.weight}</span>
                      <div
                        className={`w-full rounded-lg transition-all ${
                          w.condition === "full"
                            ? "bg-gradient-to-t from-amber-400 to-amber-300"
                            : "bg-gradient-to-t from-blue-400 to-blue-300"
                        }`}
                        style={{ height: `${h}px` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1.5 mt-2">
                {last7.map((w: any) => (
                  <div key={w.id} className="flex-1 text-center">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {new Date(w.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                {weightHistory.map((w: any, i: number) => {
                  const next = weightHistory[i + 1];
                  const diff = next ? w.weight - next.weight : 0;
                  const isDown = diff < 0;
                  const isUp = diff > 0;
                  const dt = new Date(w.date);
                  return (
                    <div key={w.id} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 group">
                      <div className={`w-1.5 h-8 rounded-full ${w.condition === "full" ? "bg-amber-400" : "bg-blue-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{w.weight} kg</span>
                          {diff !== 0 && (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              isDown
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}>
                              {isDown ? "↓" : "↑"} {Math.abs(diff).toFixed(1)} kg
                            </span>
                          )}
                          {i === weightHistory.length - 1 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">ilk ölçüm</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {dt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}{" "}
                          {dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          <span className={`ml-2 ${
                            w.condition === "full"
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-blue-500 dark:text-blue-400"
                          }`}>
                            {w.condition === "full" ? "Tok" : "Aç"}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteWeight(w.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition text-sm text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {projection && projection.target_weight && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Hedef Kilo</p>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{projection.target_weight}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">kg</span>
              </div>

              {projection.days !== null && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 mb-2">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    Tahmini <span className="font-bold">{projection.days} gün</span> içinde ulaşabilirsin
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                    Günlük ortalama: {projection.daily_avg > 0 ? "+" : ""}{projection.daily_avg} kg/gün
                  </p>
                </div>
              )}

              {projection.note && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
                  {projection.note}
                </p>
              )}

              {projection.note_text && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  "{projection.note_text}"
                </p>
              )}
            </div>
          )}
        </div>

        <div className="h-20" />
      </main>
    </div>
  );
}
