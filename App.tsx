
import React, { useState, useEffect, useCallback } from 'react';
import { ChildTraits, DiaryEntry, GuideData, Gender } from './types';
import { getRuleBasedDevelopmentGuide } from './services/geminiService';
import { Header } from './components/Header';
import { MonthlyGuideSection } from './components/MonthlyGuideSection';
import { DiaryForm } from './components/DiaryForm';
import { ChildTraitsForm } from './components/ChildTraitsForm';

const App: React.FC = () => {
  const [months, setMonths] = useState<number>(12);
  const [gender, setGender] = useState<Gender>('girl');
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loadingGuide, setLoadingGuide] = useState<boolean>(false);
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('zaram:entries');
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        return (parsed || []).map((e: any) => ({
          ...e,
          nutrition: {
            ...e.nutrition,
          },
          discipline: {
            count: e.discipline?.count ?? 0,
            situation: e.discipline?.situation ?? '',
            behavior: e.discipline?.behavior ?? '',
          },
        })) as DiaryEntry[];
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [showToast, setShowToast] = useState(false);
  const [traits, setTraits] = useState<ChildTraits>(() => {
    try {
      const raw = localStorage.getItem('zaram:traits');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ChildTraits>;
        return {
          pickyEating: 'none',
          sleepIssue: 'none',
          languageConcern: false,
          grossMotorConcern: false,
          fineMotorConcern: false,
          snackOften: false,
          useAutoInsights: true,
          ...parsed,
        } as ChildTraits;
      }
    } catch {
      // ignore
    }
    return {
      pickyEating: 'none',
      sleepIssue: 'none',
      languageConcern: false,
      grossMotorConcern: false,
      fineMotorConcern: false,
      snackOften: false,
      useAutoInsights: true,
    };
  });
  const latestEntry = entries.length > 0 ? entries[0] : null;

  const buildAutoInsights = useCallback((entry: DiaryEntry | null) => {
    if (!entry) return null;

    const rates = [entry.nutrition.breakfastRate, entry.nutrition.lunchRate, entry.nutrition.dinnerRate].filter(
      (v) => typeof v === 'number'
    ) as number[];
    const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 100;

    const totalSnacks = entry.nutrition.snacks.reduce((acc, s) => acc + (s.count || 0), 0);

    const pickyAuto: ChildTraits['pickyEating'] =
      avgRate < 50 || rates.some((r) => r === 0) ? 'severe' : avgRate < 80 ? 'some' : 'none';

    const snackOftenAuto = totalSnacks >= 3;

    return {
      pickyAuto,
      snackOftenAuto,
      avgRate,
      totalSnacks,
      carbsG: entry.nutrition.carbsG,
      proteinG: entry.nutrition.proteinG,
      fatG: entry.nutrition.fatG,
      disciplineCount: entry.discipline.count,
      disciplineBehavior: entry.discipline.behavior,
      disciplineSituation: entry.discipline.situation,
    };
  }, [latestEntry]);

  const autoInsights = buildAutoInsights(latestEntry);

  const effectiveTraits: ChildTraits = React.useMemo(() => {
    if (!traits.useAutoInsights || !autoInsights) return traits;

    // 사용자가 체크한 특성은 유지하되, “식단/간식” 관련은 최근 기록 기반 자동 판정으로 보강
    return {
      ...traits,
      pickyEating: autoInsights.pickyAuto,
      snackOften: traits.snackOften || autoInsights.snackOftenAuto,
    };
  }, [traits, autoInsights]);


  const fetchGuide = useCallback(async (m: number, t: ChildTraits) => {
    setLoadingGuide(true);
    const data = await getRuleBasedDevelopmentGuide(m, t, { latestEntry });
    setGuide(data);
    setLoadingGuide(false);
  }, [latestEntry]);

  useEffect(() => {
    fetchGuide(months, effectiveTraits);
  }, [months, effectiveTraits, fetchGuide]);

  useEffect(() => {
    try {
      localStorage.setItem('zaram:traits', JSON.stringify(traits));
    } catch {
      // ignore
    }
  }, [traits]);

  useEffect(() => {
    try {
      // 최근 90개까지만 저장
      localStorage.setItem('zaram:entries', JSON.stringify(entries.slice(0, 90)));
    } catch {
      // ignore
    }
  }, [entries]);



  // Sync body background color with theme
  useEffect(() => {
    document.body.className = gender === 'girl' ? 'theme-girl' : 'theme-boy';
  }, [gender]);

  const handleSaveEntry = (entryData: Omit<DiaryEntry, 'id' | 'date' | 'months' | 'gender'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      months: months,
      gender: gender
    };
    
    console.log("Saving Diary Entry:", JSON.stringify(newEntry, null, 2));
    
    setEntries((prev) => [newEntry, ...prev]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen pb-10 max-w-2xl mx-auto">
      <Header 
        months={months} 
        onMonthsChange={(m) => setMonths(m)} 
        gender={gender}
        onGenderChange={(g) => setGender(g)}
      />
      
      <main className="px-4 py-6 space-y-6">
        <MonthlyGuideSection 
          months={months} 
          guide={guide} 
          loading={loadingGuide} 
          gender={gender}
        />

        <ChildTraitsForm traits={traits} onChange={setTraits} gender={gender} autoInsights={autoInsights ? { avgRate: autoInsights.avgRate, totalSnacks: autoInsights.totalSnacks, pickyAuto: autoInsights.pickyAuto, snackOftenAuto: autoInsights.snackOftenAuto } : null} />
        
        <div className={`border-t ${gender === 'girl' ? 'border-pink-100' : 'border-blue-100'} pt-6`}>
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">오늘의 성장 기록</h2>
          <DiaryForm 
            onSave={handleSaveEntry} 
            currentMonths={months} 
            gender={gender}
          />
        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span>✅</span>
          <span>기록이 안전하게 저장되었습니다!</span>
        </div>
      )}
    </div>
  );
};

export default App;
