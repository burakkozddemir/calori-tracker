"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

const MODES = [
  { key: "text", label: "Metin", icon: "Aa" },
  { key: "image", label: "Fotoğraf", icon: "📷" },
  { key: "manual", label: "Arama", icon: "🔍" },
] as const;

const MEALS = [
  { value: "breakfast", label: "Kahvaltı", icon: "☀️" },
  { value: "lunch", label: "Öğle", icon: "🌤️" },
  { value: "dinner", label: "Akşam", icon: "🌙" },
  { value: "snack", label: "Atıştırma", icon: "🍿" },
  { value: "other", label: "Diğer", icon: "🍽️" },
];

export default function AddFoodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") || (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  })();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"text" | "image" | "manual">("text");
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [mealType, setMealType] = useState("other");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.food.analyzeText(textInput);
      setAiResults(result.foods);
    } catch (err: any) {
      setError(err.message || "Analiz hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalyze = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const result = await api.food.analyzeImage(file);
      setAiResults(result.foods);
    } catch (err: any) {
      setError(err.message || "Fotoğraf analiz hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageAnalyze(file);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.food.search(query);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  const addFood = async (food: any, fromAi: boolean = true) => {
    try {
      const gram = fromAi ? food.gram : 100;
      const multiplier = gram / 100;
      await api.food.add({
        food_name: food.name,
        gram: gram,
        calorie: fromAi ? food.calorie : food.calorie_100g * multiplier,
        protein: fromAi ? food.protein : food.protein_100g * multiplier,
        fat: fromAi ? food.fat : food.fat_100g * multiplier,
        carb: fromAi ? food.carb : food.carb_100g * multiplier,
        meal_type: mealType,
        food_id: fromAi ? null : food.id,
        date: selectedDate,
      });
      if (fromAi) {
        setAddedIds((prev) => new Set(prev).add(aiResults.indexOf(food)));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addAllFoods = async () => {
    for (let i = 0; i < aiResults.length; i++) {
      if (!addedIds.has(i)) {
        await addFood(aiResults[i], true);
      }
    }
    router.push(`/dashboard?date=${selectedDate}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push(`/dashboard?date=${selectedDate}`)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <h1 className="font-bold text-gray-800 dark:text-gray-100">Yemek Ekle</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                mode === m.key
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base block">{m.icon}</span>
              <span className="text-xs mt-0.5 block">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="card p-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">Öğün Seç</label>
          <div className="flex gap-2">
            {MEALS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  mealType === m.value
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-700"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="block text-base">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {mode === "text" && (
          <div className="card p-5 space-y-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={"150 gram tavuk göğsü\n200 gram pirinç\n10 gram zeytinyağı"}
                className="input-field h-36 resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-300 dark:text-gray-600">
                {textInput.length > 0 && `${textInput.length} karakter`}
              </div>
            </div>
            <button
              onClick={handleTextAnalyze}
              disabled={loading || !textInput.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI Analiz Ediyor...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI ile Analiz Et
                </>
              )}
            </button>
          </div>
        )}

        {mode === "image" && (
          <div className="card p-5 text-center animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
                loading
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
              }`}
            >
              {loading ? (
                <div className="space-y-4">
                  <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Fotoğraf analiz ediliyor</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">AI yemekleri tanıyor...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Fotoğraf Yükle</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Yemek fotoğrafını çek veya seç</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="card p-5 space-y-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tavuk, pirinç, yumurta..."
                className="input-field pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">{food.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {food.calorie_100g} kcal — P:{food.protein_100g}g Y:{food.fat_100g}g K:{food.carb_100g}g <span className="text-gray-300 dark:text-gray-600">/100g</span>
                      </p>
                    </div>
                    <button
                      onClick={() => addFood(food, false)}
                      className="ml-3 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition shadow-sm shadow-green-500/20"
                    >
                      + Ekle
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-300 dark:text-gray-600 text-3xl mb-2">🔍</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Sonuç bulunamadı</p>
              </div>
            )}
          </div>
        )}

        {aiResults.length > 0 && (
          <div className="card p-5 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">AI Sonuçları</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{aiResults.length} malzeme bulundu</p>
              </div>
              <button onClick={addAllFoods} className="btn-primary !px-4 !py-2 text-sm">
                Tümünü Ekle
              </button>
            </div>
            <div className="space-y-2">
              {aiResults.map((food, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    addedIds.has(i)
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                      : "bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{food.name}</p>
                      {addedIds.has(i) && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Eklendi</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{food.gram}g</span>
                      <span className="text-xs text-blue-500">P:{food.protein}g</span>
                      <span className="text-xs text-amber-500">Y:{food.fat}g</span>
                      <span className="text-xs text-rose-500">K:{food.carb}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{food.calorie}</span>
                    {!addedIds.has(i) && (
                      <button
                        onClick={() => addFood(food, true)}
                        className="bg-emerald-500 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shadow-green-500/20 hover:bg-emerald-600 transition text-lg font-light"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
