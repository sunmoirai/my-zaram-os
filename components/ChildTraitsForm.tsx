import React from 'react';
import { Card } from './ui/Card';
import { ChildTraits, Gender } from '../types';

interface ChildTraitsFormProps {
  traits: ChildTraits;
  onChange: (next: ChildTraits) => void;
  gender: Gender;
  autoInsights?: {
    avgRate: number;
    totalSnacks: number;
    pickyAuto: ChildTraits['pickyEating'];
    snackOftenAuto: boolean;
  } | null;
}

const labelCls = 'text-sm font-semibold text-gray-700';
const hintCls = 'text-xs text-gray-500 leading-relaxed';

export const ChildTraitsForm: React.FC<ChildTraitsFormProps> = ({ traits, onChange, gender, autoInsights }) => {
  const isGirl = gender === 'girl';
  const themeColor = isGirl ? 'text-pink-600' : 'text-blue-600';

  return (
    <Card
      title="아이 특성 체크"
      icon="🧩"
      className={`bg-white ${isGirl ? 'border-pink-100' : 'border-blue-100'}`}
    >
      <div className="space-y-5">

        <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={traits.useAutoInsights}
              onChange={(e) => onChange({ ...traits, useAutoInsights: e.target.checked })}
            />
            <div>
              <div className={`${labelCls} ${themeColor}`}>🤖 최근 기록 기반 자동 반영</div>
              <div className={hintCls}>
                최근 기록(식사량/간식/훈육)을 분석해 가이드에 자동으로 반영합니다. (원하면 끌 수 있어요)
              </div>
              {traits.useAutoInsights && autoInsights && (
                <div className="mt-2 text-[11px] text-gray-600 leading-relaxed">
                  • 최근 식사량 평균: <span className="font-semibold">{Math.round(autoInsights.avgRate)}%</span> / 간식 총합:{' '}
                  <span className={`font-semibold ${autoInsights.totalSnacks >= 3 ? 'text-red-600' : ''}`}>{autoInsights.totalSnacks}개</span>
                  {autoInsights.totalSnacks >= 3 && <span className="ml-2 text-red-600 font-bold">⚠️ 간식 과다</span>}
                </div>
              )}
              {traits.useAutoInsights && !autoInsights && (
                <div className="mt-2 text-[11px] text-gray-500">* 아직 기록이 없어서 자동 분석이 적용되지 않았습니다.</div>
              )}
            </div>
          </label>
        </div>


        <div>
          <div className={`${labelCls} ${themeColor}`}>🍽️ 편식 정도</div>
          <div className={hintCls}>현재 식단에서 거부가 잦은 편인지 선택해주세요.</div>
          <select
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={traits.pickyEating}
            onChange={(e) => onChange({ ...traits, pickyEating: e.target.value as ChildTraits['pickyEating'] })}
          >
            <option value="none">거의 없음</option>
            <option value="some">가끔 있음</option>
            <option value="severe">자주/심함</option>
          </select>
        </div>

        <div>
          <div className={`${labelCls} ${themeColor}`}>😴 수면</div>
          <div className={hintCls}>잠들기까지 오래 걸리거나, 밤중에 자주 깨나요?</div>
          <select
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={traits.sleepIssue}
            onChange={(e) => onChange({ ...traits, sleepIssue: e.target.value as ChildTraits['sleepIssue'] })}
          >
            <option value="none">문제 없음</option>
            <option value="hardToSleep">잠들기 어려움</option>
            <option value="frequentWake">밤에 자주 깸</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={traits.languageConcern}
              onChange={(e) => onChange({ ...traits, languageConcern: e.target.checked })}
            />
            <div>
              <div className={`${labelCls} ${themeColor}`}>🗣️ 언어 걱정</div>
              <div className={hintCls}>표현/이해가 또래 대비 느리거나 말이 적다고 느끼나요?</div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={traits.grossMotorConcern}
              onChange={(e) => onChange({ ...traits, grossMotorConcern: e.target.checked })}
            />
            <div>
              <div className={`${labelCls} ${themeColor}`}>🏃 대근육 걱정</div>
              <div className={hintCls}>걷기/점프/균형 등 전신 움직임이 걱정되나요?</div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={traits.fineMotorConcern}
              onChange={(e) => onChange({ ...traits, fineMotorConcern: e.target.checked })}
            />
            <div>
              <div className={`${labelCls} ${themeColor}`}>✋ 소근육 걱정</div>
              <div className={hintCls}>집기/그리기/가위 등 손 사용이 걱정되나요?</div>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={traits.snackOften}
              onChange={(e) => onChange({ ...traits, snackOften: e.target.checked })}
            />
            <div>
              <div className={`${labelCls} ${themeColor}`}>🍪 간식 과다</div>
              <div className={hintCls}>간식을 자주/많이 먹는 편인가요? (과자/주스 포함)</div>
            </div>
          </label>
        </div>

        <div className="text-xs text-gray-500">
          * 이 체크는 진단이 아니라 <span className="font-semibold">가이드 개인화</span>를 위한 참고값입니다.
        </div>
      </div>
    </Card>
  );
};
