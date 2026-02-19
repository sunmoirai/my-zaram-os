
import React, { useState, useRef, useMemo } from 'react';
import { DiaryEntry, Nutrition, PlayRecord, DisciplineRecord, SnackItem, Gender } from '../types';
import { Card } from './ui/Card';

interface DiaryFormProps {
  onSave: (entry: Omit<DiaryEntry, 'id' | 'date' | 'months' | 'gender'>) => void;
  currentMonths: number;
  gender: Gender;
}

const MealBlock: React.FC<{
  label: string;
  icon: string;
  menu: string;
  rate: number;
  onMenuChange: (val: string) => void;
  onRateChange: (val: number) => void;
  gender: Gender;
}> = ({ label, icon, menu, rate, onMenuChange, onRateChange, gender }) => {
  const rates = [0, 50, 100, 125];
  const isGirl = gender === 'girl';
  
  return (
    <div className={`p-4 rounded-2xl bg-white border ${isGirl ? 'border-pink-50' : 'border-blue-50'} shadow-sm space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
          {icon} {label}
        </span>
        <div className="flex gap-1">
          {rates.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => onRateChange(val)}
              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all border ${
                rate === val 
                  ? (val === 125 ? 'bg-emerald-400 border-emerald-400 text-white' : (isGirl ? 'bg-pink-400 border-pink-400 text-white' : 'bg-blue-400 border-blue-400 text-white')) 
                  : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              {val === 125 ? '더 많이!' : val === 100 ? '완식' : val === 0 ? '안먹음' : `${val}%`}
            </button>
          ))}
        </div>
      </div>
      <input 
        type="text"
        value={menu}
        onChange={e => onMenuChange(e.target.value)}
        placeholder={`${label} 메뉴 입력`}
        className={`w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'} text-sm`}
      />
    </div>
  );
};

export const DiaryForm: React.FC<DiaryFormProps> = ({ onSave, currentMonths, gender }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [play, setPlay] = useState<PlayRecord>({ fineMotor: '', grossMotor: '', books: '' });
  const [nutrition, setNutrition] = useState<Nutrition>({ 
    breakfastMenu: '', 
    breakfastRate: 100,
    lunchMenu: '', 
    lunchRate: 100,
    dinnerMenu: '', 
    dinnerRate: 100,
    carbsG: undefined,
    proteinG: undefined,
    fatG: undefined,
    snacks: [] 
  });
  const [milestone, setMilestone] = useState('');
  const [discipline, setDiscipline] = useState<DisciplineRecord>({ count: 0, situation: '', behavior: '' });
  
  const [newSnackName, setNewSnackName] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('아침');
  const [selectedRelative, setSelectedRelative] = useState('후');

  const meals = ['아침', '점심', '저녁'];
  const relatives = ['전', '후'];
  const allTimings = ['아침 전', '아침 후', '점심 전', '점심 후', '저녁 전', '저녁 후'];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGirl = gender === 'girl';

  const totalSnacks = useMemo(() => 
    nutrition.snacks.reduce((acc, curr) => acc + curr.count, 0)
  , [nutrition.snacks]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSnack = () => {
    if (!newSnackName.trim()) return;
    const combinedTiming = `${selectedMeal} ${selectedRelative}`;
    const newSnack: SnackItem = {
      id: Date.now().toString(),
      name: newSnackName.trim(),
      count: 1,
      timing: combinedTiming
    };
    setNutrition(prev => ({ ...prev, snacks: [...prev.snacks, newSnack] }));
    setNewSnackName('');
  };

  const updateSnackCount = (id: string, delta: number) => {
    setNutrition(prev => ({
      ...prev,
      snacks: prev.snacks.map(s => s.id === id ? { ...s, count: Math.max(0, s.count + delta) } : s).filter(s => s.count > 0)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ imageUrl, play, nutrition, milestone, discipline });
    setImageUrl(null);
    setPlay({ fineMotor: '', grossMotor: '', books: '' });
    setNutrition({ 
      breakfastMenu: '', breakfastRate: 100,
      lunchMenu: '', lunchRate: 100,
      dinnerMenu: '', dinnerRate: 100,
      snacks: [] 
    });
    setMilestone('');
    setDiscipline({ count: 0, situation: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 transition-colors duration-500">
      {/* Nutrition Section */}
      <Card title="식단 및 간식 관리" icon="🥣" className={isGirl ? 'border-pink-50' : 'border-blue-50'}>
        <div className="space-y-6">
          <div className="space-y-3">
            <MealBlock 
              label="아침" icon="☀️" gender={gender}
              menu={nutrition.breakfastMenu} rate={nutrition.breakfastRate}
              onMenuChange={(val) => setNutrition({...nutrition, breakfastMenu: val})}
              onRateChange={(val) => setNutrition({...nutrition, breakfastRate: val})}
            />
            <MealBlock 
              label="점심" icon="☁️" gender={gender}
              menu={nutrition.lunchMenu} rate={nutrition.lunchRate}
              onMenuChange={(val) => setNutrition({...nutrition, lunchMenu: val})}
              onRateChange={(val) => setNutrition({...nutrition, lunchRate: val})}
            />
            <MealBlock 
              label="저녁" icon="🌙" gender={gender}
              menu={nutrition.dinnerMenu} rate={nutrition.dinnerRate}
              onMenuChange={(val) => setNutrition({...nutrition, dinnerMenu: val})}
              onRateChange={(val) => setNutrition({...nutrition, dinnerRate: val})}
            />
          
          {/* Macros Section */}
          <div className={`space-y-3 p-4 rounded-2xl bg-white border ${isGirl ? 'border-pink-50' : 'border-blue-50'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1">🍚 탄·단·지(대략)</span>
              <span className="text-[10px] text-gray-400 font-bold">g 단위 (선택)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 ml-1">탄수화물</div>
                <input
                  type="number"
                  min={0}
                  value={nutrition.carbsG ?? ''}
                  onChange={(e) => setNutrition({ ...nutrition, carbsG: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="예: 120"
                  className={`w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'} text-sm`}
                />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 ml-1">단백질</div>
                <input
                  type="number"
                  min={0}
                  value={nutrition.proteinG ?? ''}
                  onChange={(e) => setNutrition({ ...nutrition, proteinG: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="예: 35"
                  className={`w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'} text-sm`}
                />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 ml-1">지방</div>
                <input
                  type="number"
                  min={0}
                  value={nutrition.fatG ?? ''}
                  onChange={(e) => setNutrition({ ...nutrition, fatG: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="예: 25"
                  className={`w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'} text-sm`}
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-500 leading-relaxed">
              * 정확한 계산이 아니라 “균형 감”을 잡기 위한 기록입니다. (예: 단백질이 너무 낮으면 가이드가 보강됩니다.)
            </div>
          </div>

</div>

          <div className={`space-y-4 pt-4 border-t ${isGirl ? 'border-pink-50' : 'border-blue-50'}`}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">간식 기록 (총 {totalSnacks}개)</label>
              {totalSnacks >= 3 && <span className="text-[10px] text-red-500 font-bold animate-pulse">⚠️ 간식 과다 주의!</span>}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 ml-1">식사 시점 선택</span>
                  <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                    {meals.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMeal(m)}
                        className={`flex-1 min-w-[60px] py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          selectedMeal === m 
                            ? (isGirl ? 'bg-pink-400 text-white' : 'bg-blue-400 text-white') 
                            : 'bg-white text-gray-400 border border-gray-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 ml-1">전/후 선택</span>
                  <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                    {relatives.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRelative(r)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          selectedRelative === r 
                            ? (isGirl ? 'bg-pink-400 text-white' : 'bg-blue-400 text-white') 
                            : 'bg-white text-gray-400 border border-gray-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-100 mt-2">
                <input 
                  type="text" value={newSnackName} onChange={e => setNewSnackName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSnack())}
                  placeholder={`${selectedMeal} ${selectedRelative} 간식 이름`}
                  className={`flex-1 p-2.5 text-sm rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-1 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'}`}
                />
                <button 
                  type="button" onClick={addSnack} 
                  className={`px-5 py-2.5 ${isGirl ? 'bg-pink-400' : 'bg-blue-400'} text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all`}
                >
                  추가
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {allTimings.map(t => {
                const snacksInTiming = nutrition.snacks.filter(s => s.timing === t);
                if (snacksInTiming.length === 0) return null;
                const timingColor = isGirl ? 'text-pink-300 bg-pink-50/30' : 'text-blue-300 bg-blue-50/30';
                const listBorder = isGirl ? 'border-pink-50' : 'border-blue-50';
                return (
                  <div key={t} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-[1px] flex-1 ${isGirl ? 'bg-pink-50' : 'bg-blue-50'}`}></div>
                      <span className={`text-[10px] font-bold ${timingColor} px-2 py-0.5 rounded-full`}>{t}</span>
                      <div className={`h-[1px] flex-1 ${isGirl ? 'bg-pink-50' : 'bg-blue-50'}`}></div>
                    </div>
                    {snacksInTiming.map(snack => (
                      <div key={snack.id} className={`flex items-center justify-between p-3 bg-white border ${listBorder} rounded-2xl shadow-sm`}>
                        <span className="text-sm text-gray-700 font-medium">{snack.name}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => updateSnackCount(snack.id, -1)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs">－</button>
                          <span className={`text-sm font-bold ${isGirl ? 'text-pink-600' : 'text-blue-600'} w-6 text-center`}>{snack.count}</span>
                          <button type="button" onClick={() => updateSnackCount(snack.id, 1)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs">＋</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {nutrition.snacks.length === 0 && <p className="text-center text-xs text-gray-400 py-6">오늘 기록된 간식이 없습니다.</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Play & Education */}
      <Card title="놀이 및 독서 기록" icon="🎨" className={isGirl ? 'border-pink-50' : 'border-blue-50'}>
        <div className="space-y-4">
          {[
            { id: 'fine', label: '소근육 놀이', val: play.fineMotor, set: (v: string) => setPlay({...play, fineMotor: v}), ph: '예: 색종이 찢기' },
            { id: 'gross', label: '대근육 놀이', val: play.grossMotor, set: (v: string) => setPlay({...play, grossMotor: v}), ph: '예: 공놀이' },
            { id: 'book', label: '함께 읽은 책', val: play.books, set: (v: string) => setPlay({...play, books: v}), ph: '예: 사과가 쿵!' }
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input 
                type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} 
                className={`w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'}`} 
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Growth Milestone */}
      <Card title="성장 마일스톤" icon="⭐" className={`bg-yellow-50/50 border-yellow-100`}>
        <textarea 
          value={milestone} onChange={e => setMilestone(e.target.value)} 
          placeholder="오늘 처음으로 한 행동이나 말을 기록해보세요!" 
          className="w-full p-3 rounded-xl bg-white border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-200 min-h-[100px]" 
        />
      </Card>

      {/* Discipline Section */}
      <Card title="훈육 및 행동 교정" icon="🚫" className={isGirl ? 'border-pink-50' : 'border-blue-50'}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-700">오늘의 훈육 횟수</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setDiscipline(p => ({...p, count: Math.max(0, p.count-1)}))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">－</button>
              <span className="font-bold text-xl">{discipline.count}회</span>
              <button type="button" onClick={() => setDiscipline(p => ({...p, count: p.count+1}))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">＋</button>
            </div>
          </div>
          <input
            type="text"
            value={discipline.behavior}
            onChange={(e) => setDiscipline({ ...discipline, behavior: e.target.value })}
            placeholder="잘못된 행동(키워드/요약) 예: 장난감 던짐, 때림, 떼쓰기"
            className={`w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'} text-sm`}
          />

          <textarea 
            value={discipline.situation} onChange={e => setDiscipline({...discipline, situation: e.target.value})} 
            placeholder="상황을 구체적으로 적어주세요" 
            className={`w-full p-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 ${isGirl ? 'focus:ring-pink-200' : 'focus:ring-blue-200'}`} 
          />
        </div>
      </Card>

      {/* Photo Section */}
      <Card title="오늘의 사진" icon="📸" className={isGirl ? 'border-pink-50' : 'border-blue-50'}>
        <div className={`relative w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed ${isGirl ? 'border-pink-200' : 'border-blue-200'} flex flex-col items-center justify-center overflow-hidden transition-colors`}>
          {imageUrl ? (
            <><img src={imageUrl} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full text-xs">✕</button></>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer text-center p-4">
              <div className="text-3xl mb-2">➕</div><p className="text-gray-400 text-sm font-medium">이곳을 클릭하여 사진을 추가하세요</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
      </Card>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <button 
          type="submit" 
          className={`w-full py-4 rounded-2xl ${isGirl ? 'bg-[#FFC1CC] hover:bg-[#ffb1bd]' : 'bg-[#A2D2FF] hover:bg-[#91c5f8]'} text-white font-bold text-lg shadow-lg active:scale-95 transition-all`}
        >
          기록 완료하기
        </button>
      </div>
    </form>
  );
};
