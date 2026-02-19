
export type Gender = 'girl' | 'boy';

export interface SnackItem {
  id: string;
  name: string;
  count: number;
  timing: string; // e.g., '아침 전', '아침 후', '점심 전', '점심 후', '저녁 전', '저녁 후'
}

export interface Nutrition {
  breakfastMenu: string;
  breakfastRate: number;
  lunchMenu: string;
  lunchRate: number;
  dinnerMenu: string;
  dinnerRate: number;

  /**
   * 탄/단/지 (하루 총량, g)
   * - 정확한 영양 계산이 목적이 아니라 “대략적인 균형”을 기록/가이드에 반영하기 위한 값입니다.
   */
  carbsG?: number;
  proteinG?: number;
  fatG?: number;

  snacks: SnackItem[];
}

export interface PlayRecord {
  fineMotor: string;
  grossMotor: string;
  books: string;
}

export interface DisciplineRecord {
  /** 혼냄(훈육) 횟수 */
  count: number;
  /** 훈육이 발생한 상황(상세) */
  situation: string;
  /** 아이가 했던 잘못된 행동(요약/키워드) */
  behavior: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  months: number;
  gender: Gender;
  imageUrl: string | null;
  play: PlayRecord;
  nutrition: Nutrition;
  milestone: string;
  discipline: DisciplineRecord;
}

export interface GuideData {
  play: string;
  education: string;
  nutrition: string;
  /** 훈육/행동 가이드 (최근 기록/특성 기반) */
  discipline?: string;
}

/**
 * 아이 특성(부모 관찰 기반) 체크용 프로필
 * - API 없이도 룰 기반으로 가이드 문장을 개인화하기 위한 입력값
 */
export interface ChildTraits {
  /** 편식 정도 */
  pickyEating: 'none' | 'some' | 'severe';
  /** 수면 이슈 */
  sleepIssue: 'none' | 'hardToSleep' | 'frequentWake';
  /** 언어 발달(표현/이해) 걱정 */
  languageConcern: boolean;
  /** 대근육(걷기/점프/균형) 걱정 */
  grossMotorConcern: boolean;
  /** 소근육(집기/가위/그리기) 걱정 */
  fineMotorConcern: boolean;
  /** 간식을 자주/많이 먹는 편 */
  snackOften: boolean;

  /** 최근 기록 기반 자동 인사이트를 가이드에 반영 */
  useAutoInsights: boolean;
}

export enum MonthRange {
  NEWBORN = '0-6',
  INFANT = '7-12',
  TODDLER = '13-24',
  PRESCHOOL = '25+'
}
