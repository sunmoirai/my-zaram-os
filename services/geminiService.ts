import { ChildTraits, DiaryEntry, GuideData } from "../types";

/**
 * Gemini API 없이 동작하도록 "오프라인(정적) + 룰 기반" 발달 가이드를 제공합니다.
 *
 * ✅ 장점: 네트워크/키 없이 항상 동작
 * ✅ 개인화: 월령 + (아이 특성 체크) + (최근 기록: 식단/간식/훈육) 기반 문장 조합
 * ⚠️ 한계: LLM 수준의 자연어 생성/대화형 추론은 제공되지 않음
 */

const clampMonths = (m: number) => {
  if (Number.isNaN(m)) return 0;
  return Math.max(0, Math.min(84, Math.floor(m)));
};

type GuideBucket = {
  min: number; // inclusive
  max: number; // inclusive
  play: string;
  education: string;
  nutrition: string;
};

/**
 * 월령 기본 가이드
 * - 0~12개월: 1개월 단위(조금 더 촘촘)
 * - 13~36개월: 3개월 단위
 * - 37~84개월: 6개월 단위
 */
const getBaseBucket = (months: number): GuideBucket => {
  const m = clampMonths(months);

  // 0~12: 1개월 단위
  if (m <= 12) {
    const byMonth: Record<number, GuideBucket> = {
      0: { min: 0, max: 0, play: "짧은 터미타임과 촉감 놀이로 목·몸통을 부드럽게 자극해주세요.", education: "흑백 대비 그림(초점책)과 부드러운 목소리로 짧게 말 걸어주세요.", nutrition: "모유/분유 중심으로 수유 리듬을 관찰하고 트림·역류를 확인하세요." },
      1: { min: 1, max: 1, play: "양방향으로 몸을 살짝 돌려보며 목·코어 자극을 늘려보세요.", education: "짧은 문장으로 반복(“엄마야”, “안녕”)해 주고 반응을 기다려주세요.", nutrition: "수유량은 ‘총량’보다 ‘기분/배변/성장’을 함께 관찰하세요." },
      2: { min: 2, max: 2, play: "손을 펴고 쥐는 놀이, 딸랑이 따라보기로 시각-손 협응을 돕습니다.", education: "소리(의성어) 중심으로 자주 말 걸고, 표정 놀이를 해보세요.", nutrition: "밤낮 리듬을 위해 낮에는 밝게, 밤에는 조용히(자극 최소) 유지해보세요." },
      3: { min: 3, max: 3, play: "터미타임 시간을 조금씩 늘리고, 손에 닿는 장난감을 제공해보세요.", education: "이름 부르기 + 반응 기다리기(3초)를 반복해보세요.", nutrition: "수유 후 잠드는 패턴을 기록해 ‘우리집 루틴’을 잡아갑니다." },
      4: { min: 4, max: 4, play: "잡기/입에 넣기(치발기)와 뒤집기 연습으로 코어·소근육을 키워주세요.", education: "한 장씩 넘기는 촉감책을 보며 ‘이건 ○○’처럼 단어를 반복해주세요.", nutrition: "이유식 준비 단계라면 알레르기·삼킴을 관찰하며 소량부터 시작을 준비하세요." },
      5: { min: 5, max: 5, play: "옆으로 굴리기/뒤집기 유도, 앉기 보조로 균형감각을 시작해보세요.", education: "거울 놀이, 이름-행동(“손 흔들자”)을 짧게 연결해보세요.", nutrition: "이유식 시작 시기라면 ‘철분’이 중요한 시기입니다(쌀미음+단백질 점진)." },
      6: { min: 6, max: 6, play: "스스로 앉기 연습, 컵/블록 잡기 놀이로 손 사용을 늘려보세요.", education: "같은 책을 반복해도 좋아요. ‘반복’이 언어를 키웁니다.", nutrition: "이유식은 ‘양’보다 ‘경험’이 우선입니다. 소량·다양·천천히." },
      7: { min: 7, max: 7, play: "기어다니기 유도(장난감 조금 멀리), 앉아서 손 놀이를 섞어주세요.", education: "그림을 가리키며 ‘공/엄마/아빠’처럼 명사 중심으로 짧게 말해보세요.", nutrition: "이유식 횟수를 늘리며 단백질(두부/계란/생선)을 천천히 확장하세요." },
      8: { min: 8, max: 8, play: "서기 보조/무릎 걷기 등 이동을 다양화하고, 손가락 집기 놀이를 해보세요.", education: "“어디 있지?” 같은 찾기 질문이 부담이 덜합니다.", nutrition: "자극적인 간식/주스는 피하고, 물·과일·요거트로 리듬을 잡아주세요." },
      9: { min: 9, max: 9, play: "기어다니기+잡고 서기, 공 굴리기 놀이로 균형·협응을 돕습니다.", education: "동작+단어(“굴려!”, “줘!”)를 같이 써보세요.", nutrition: "철분 식품(살코기/달걀노른자/콩류)을 규칙적으로 포함해보세요." },
      10: { min: 10, max: 10, play: "잡고 서기·옆걸음 연습과 공 굴리기 놀이로 균형감각을 키워주세요.", education: "반복되는 문장 구조의 그림책을 함께 읽고, 의성어/의태어를 많이 써주세요.", nutrition: "유아식 전환 준비: 씹기 연습을 위해 질감을 단계적으로 올려주세요." },
      11: { min: 11, max: 11, play: "손잡고 걷기, 상자 넣기/빼기 놀이로 대·소근육을 같이 자극해요.", education: "일상에서 ‘이름 붙이기’를 늘리고, 아이가 소리내면 바로 확장해 말해주세요.", nutrition: "간은 약하게, 다양한 식재료를 ‘재노출’(10회+)로 익숙하게 해주세요." },
      12: { min: 12, max: 12, play: "서서 균형 잡기, 공 던지기 흉내로 전신 협응을 시작합니다.", education: "책+생활대화로 단어를 늘리고, 손짓/표정으로 의사표현을 도와주세요.", nutrition: "유아식으로 넘어가며 ‘과자/주스’는 습관이 되기 전에 규칙을 만들어보세요." },
    };
    return byMonth[m] ?? byMonth[12];
  }

  // 13~36: 3개월 단위
  const buckets3m: GuideBucket[] = [
    { min: 13, max: 15, play: "걷기 연습과 블록 쌓기(2~4개)로 대·소근육을 같이 키워주세요.", education: "하루 10분 책읽기 루틴 + 아이가 가리키는 것을 이름 붙여주세요.", nutrition: "세 끼+간식 리듬을 잡고, 단백질(달걀·두부·생선)을 꾸준히 주세요." },
    { min: 16, max: 18, play: "계단 오르내리기(보호자 동반), 공 굴리기/던지기 흉내를 해보세요.", education: "“줘/더/안해” 같은 기능어를 생활 속에서 자주 써주세요.", nutrition: "편식 시작기: ‘한 입 규칙’과 선택지 2개 제시로 부담 없이 확장해보세요." },
    { min: 19, max: 21, play: "점프 흉내, 끌기/밀기 놀이로 전신 협응을 늘려보세요.", education: "짧은 이야기책을 읽고 ‘다음엔 뭐할까?’처럼 간단 질문을 던져보세요.", nutrition: "탄·단·지 균형을 의식하고, 당류 간식은 횟수와 양을 정해 관리하세요." },
    { min: 22, max: 24, play: "그림 그리기(크레용)·퍼즐(2~6조각)로 집중과 소근육을 키우세요.", education: "2단어 문장(“빨간 공”, “엄마 같이”)을 자연스럽게 모델링해 주세요.", nutrition: "식사시간은 20~30분, 종료 후 간식 X 등 규칙을 단순하게 유지해보세요." },
    { min: 25, max: 27, play: "역할놀이(요리/병원)와 간단한 규칙 놀이로 사회성·자기조절을 시작해보세요.", education: "그림책+생활 대화로 문장을 늘리고, 색/모양/수(1~3) 놀이를 가볍게 섞어주세요.", nutrition: "채소는 ‘한 입 + 재노출’, 단백질은 매 끼니 작은 단위로 넣어주세요." },
    { min: 28, max: 30, play: "균형 놀이(한 발 서기 흉내), 공 차기/던지기 게임을 해보세요.", education: "‘왜?’ 질문이 늘면 공감→짧은 설명으로 이어가주세요.", nutrition: "우유/유제품, 생선/콩류로 칼슘·단백질을 꾸준히 보강하세요." },
    { min: 31, max: 33, play: "가위(안전가위)·풀·스티커로 소근육을, 야외 달리기로 대근육을 키우세요.", education: "하루 1권 책읽기+자기 말로 따라하기(1문장)를 놀이처럼 해보세요.", nutrition: "간식은 시간 고정(예: 3시) + 과일/요거트 위주로 구성해보세요." },
    { min: 34, max: 36, play: "협동 놀이(순서 지키기), 만들기(레고/공작)로 성취감을 키우세요.", education: "감정 단어(기쁘다/속상하다)를 붙여 말하는 연습을 해보세요.", nutrition: "식사 리듬이 흔들리면 ‘식사→간식’ 순서와 시간을 다시 고정해보세요." },
  ];
  const hit3 = buckets3m.find((b) => m >= b.min && m <= b.max);
  if (hit3) return hit3;

  // 37~84: 6개월 단위
  const buckets6m: GuideBucket[] = [
    { min: 37, max: 42, play: "자전거(밸런스)·균형 놀이로 대근육을, 가위/풀로 소근육을 키우세요.", education: "규칙 있는 책읽기(하루 1권)와 낱말/숫자 놀이로 기초 습관을 잡아주세요.", nutrition: "단백질+채소를 매 끼니 한 가지 이상 포함하고, 간식은 정해진 시간에만 제공하세요." },
    { min: 43, max: 48, play: "공놀이/달리기/점프로 체력과 협응을, 간단한 보드게임으로 규칙 지키기를 연습해요.", education: "‘순서대로 말하기’(처음-중간-끝)를 놀이로 해보세요.", nutrition: "당류 간식/주스는 주 1~2회로 한도를 정해 일관되게 관리해보세요." },
    { min: 49, max: 54, play: "협동 게임과 야외 활동(달리기·공놀이)로 체력과 팀워크를 키우세요.", education: "관심 주제(공룡/우주 등) 독서와 간단한 기록(그림·한 줄)을 연결해보세요.", nutrition: "활동량이 늘면 수분·과일·단백질을 충분히, 늦은 시간 당류는 줄여보세요." },
    { min: 55, max: 60, play: "규칙 있는 스포츠 기초와 만들기(레고/공작)로 성취감을 키우세요.", education: "읽기 이해를 위해 ‘요약 1문장’ 놀이를 하고, 수/도형 감각을 생활 속에서 다뤄주세요.", nutrition: "성장기 균형식(탄·단·지) 유지 + 철분/칼슘 식품을 신경 써주세요." },
    { min: 61, max: 66, play: "팀워크 놀이와 미세 작업(글씨/공작)으로 사회성·소근육을 강화하세요.", education: "기초 글쓰기(일기/감상 2~3문장)로 표현력을 확장해보세요.", nutrition: "규칙적인 식사/수면 리듬이 우선입니다. 야식/당류는 습관화되지 않게 관리하세요." },
    { min: 67, max: 72, play: "규칙과 팀워크가 필요한 놀이로 사회성을, 집중 필요한 공작으로 소근육을 강화하세요.", education: "관심 분야 독서와 발표(말로 설명하기 1분)를 연결해보세요.", nutrition: "성장속도 개인차가 큰 시기이니 과식·당류를 줄이고 균형식을 유지하세요." },
    { min: 73, max: 78, play: "운동+휴식 균형을 잡고, 손글씨/공작 등 미세작업을 꾸준히 해주세요.", education: "‘내 생각-근거-결론’ 3단 말하기를 가볍게 연습해보세요.", nutrition: "편식/간식은 규칙이 핵심입니다. ‘정해진 시간+정해진 양’으로 관리해보세요." },
    { min: 79, max: 84, play: "팀 놀이와 규칙 게임으로 사회성을, 공작/그림으로 집중력을 강화하세요.", education: "독서+기초 글쓰기(감상 3문장)로 표현력을 확장해보세요.", nutrition: "규칙적인 식사/수면 리듬을 우선하고, 당류는 습관이 되기 전에 제한하세요." },
  ];
  return buckets6m.find((b) => m >= b.min && m <= b.max) ?? buckets6m[buckets6m.length - 1];
};

const getStaticGuide = (months: number): GuideData => {
  const b = getBaseBucket(months);
  return { play: b.play, education: b.education, nutrition: b.nutrition };
};

export const getDevelopmentGuide = async (months: number): Promise<GuideData> => {
  // 기존 시그니처 호환: traits 없이 호출되면 기본 가이드만 반환합니다.
  return getStaticGuide(months);
};

type GuideContext = {
  latestEntry?: DiaryEntry | null;
};

const uniq = (arr: string[]) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));

const calcMacroPct = (carbsG?: number, proteinG?: number, fatG?: number) => {
  const c = typeof carbsG === "number" ? carbsG : undefined;
  const p = typeof proteinG === "number" ? proteinG : undefined;
  const f = typeof fatG === "number" ? fatG : undefined;
  if (c == null && p == null && f == null) return null;

  const cK = (c ?? 0) * 4;
  const pK = (p ?? 0) * 4;
  const fK = (f ?? 0) * 9;
  const total = cK + pK + fK;
  if (total <= 0) return null;

  return {
    carbPct: Math.round((cK / total) * 100),
    proteinPct: Math.round((pK / total) * 100),
    fatPct: Math.round((fK / total) * 100),
    totalKcal: Math.round(total),
  };
};

/**
 * 룰 기반 개인화 가이드
 * - 기본(월령) 가이드 + 특성 체크 + 최근 기록(식단/간식/훈육) 인사이트를 조합
 */
export const getRuleBasedDevelopmentGuide = async (
  months: number,
  traits: ChildTraits,
  ctx?: GuideContext
): Promise<GuideData> => {
  const base = getStaticGuide(months);
  const m = clampMonths(months);

  const play: string[] = [base.play];
  const edu: string[] = [base.education];
  const nut: string[] = [base.nutrition];
  const dis: string[] = [];

  const latest = ctx?.latestEntry ?? null;

  // ---------------------------
  // 1) 특성 체크 기반(수면/언어/운동/편식/간식)
  // ---------------------------
  if (traits.sleepIssue === "hardToSleep") {
    edu.push("• 취침 전 20~30분은 조용한 루틴(조명 낮추기, 책 1권, 동일한 자장가)으로 ‘잠 신호’를 반복해주세요.");
    play.push("• 낮 시간에 햇빛(산책 15~30분)과 신체 놀이로 에너지를 쓰면 밤잠 전환이 쉬워집니다.");
  }
  if (traits.sleepIssue === "frequentWake") {
    edu.push("• 밤중 각성은 ‘완전 깨지 않게’ 짧고 동일한 방식(토닥임/속삭임)으로 대응하고, 자극(불빛/대화)은 최소화하세요.");
    nut.push("• 늦은 시간 당류 간식/주스는 각성을 늘릴 수 있어 저녁 이후는 물 위주로 정리해보세요.");
  }

  if (traits.languageConcern) {
    edu.push("• ‘말 걸기 + 기다리기(3초)’를 반복하세요. 아이가 소리/제스처로라도 반응하면 바로 확장해 말해줍니다. (예: “공!” → “빨간 공 굴리자”)");
    edu.push("• 질문은 “이거 뭐야?”보다 “어디 있지?”처럼 찾기 질문이 부담이 덜해요.");
    if (m >= 12) edu.push("• 또래 대비 걱정이 지속되면 소아과/발달센터에 선별검사(언어) 상담을 받아보는 것도 도움이 됩니다.");
  }

  if (traits.grossMotorConcern) {
    play.push("• 대근육은 ‘짧게 자주’가 좋아요: 하루 3회 × 5분(계단 오르내리기 보조/공 굴리기/균형 잡기)처럼 쪼개보세요.");
    play.push("• 성공 경험을 위해 난이도를 한 단계 낮추고(손잡이/벽 짚기), 점진적으로 보조를 줄입니다.");
  }
  if (traits.fineMotorConcern) {
    play.push("• 소근육은 집기/끼우기/찢기/붙이기 4종이 기본입니다. (콩 집기, 스티커 붙이기, 종이 찢기, 끈 끼우기)");
    edu.push("• ‘따라 그리기’보다 ‘자유 그리기 + 이름 붙이기’가 부담이 적고 지속하기 좋아요.");
  }

  if (traits.pickyEating === "some") {
    nut.push("• 편식은 ‘한 입 규칙 + 선택지 2개’가 효과적입니다. (예: 브로콜리 1입 vs 당근 1입, 둘 중 선택)");
    nut.push("• 같은 재료도 조리법/모양을 바꿔 재노출(10~15회)하면 수용도가 올라갑니다.");
  }
  if (traits.pickyEating === "severe") {
    nut.push("• 편식이 심하면 ‘주식은 안전식 + 신식은 소량’ 원칙으로 스트레스를 줄이세요. (접시 한 구역만 신식)");
    nut.push("• 식사 규칙 단순화(식사시간 20~30분, 종료 후 간식 X)로 패턴이 안정됩니다.");
    if (m >= 18) nut.push("• 체중/성장곡선이 흔들리거나 식사 거부가 지속되면 소아과 상담으로 영양/철분 체크를 권장합니다.");
  }

  if (traits.snackOften) {
    nut.push("• 간식은 ‘시간과 종류’를 고정하세요. (예: 오후 3시, 과일/요거트 중 1개)");
    nut.push("• 과자/주스는 주 1~2회로 한도를 정하고, 배고픔 신호는 물/과일/우유로 먼저 조절해보세요.");
  }

  // 0~6개월은 규칙을 더 부드럽게
  if (m <= 6) {
    nut.unshift("• 영아기에는 수유/수면 패턴을 억지로 맞추기보다 하루 흐름을 기록하며 안정감을 만들어주세요.");
  }

  // ---------------------------
  // 2) 최근 기록 기반 자동 인사이트(식단/간식/훈육)
  // ---------------------------
  if (latest && traits.useAutoInsights) {
    const rates = [latest.nutrition.breakfastRate, latest.nutrition.lunchRate, latest.nutrition.dinnerRate];
    const avgRate = rates.reduce((a, b) => a + b, 0) / 3;

    if (avgRate < 80) {
      nut.push("• 최근 식사량(완식)이 낮은 편이라면 ‘양’보다 ‘규칙’에 집중해보세요: 식사시간 20~30분, 종료 후 간식 X.");
    }
    if (rates.some((r) => r === 0)) {
      nut.push("• 끼니를 자주 거르면 다음 끼니 폭식/간식 과다로 이어질 수 있어, ‘작게라도 규칙적으로’가 좋아요.");
    }

    // 간식 패턴
    const totalSnacks = latest.nutrition.snacks.reduce((acc, s) => acc + (s.count || 0), 0);
    const afterDinnerSnacks = latest.nutrition.snacks
      .filter((s) => (s.timing || "").includes("저녁 후"))
      .reduce((acc, s) => acc + (s.count || 0), 0);

    const sugaryKeywords = ["과자", "쿠키", "초코", "사탕", "젤리", "주스", "콜라", "빵", "아이스"];
    const sugary = latest.nutrition.snacks.some((s) => sugaryKeywords.some((k) => (s.name || "").includes(k)));

    if (totalSnacks >= 3) {
      nut.push("• 최근 간식 총량이 많은 편입니다. ‘정해진 시간 1회’로 먼저 줄이고, 종류는 과일/요거트 위주로 바꿔보세요.");
    }
    if (afterDinnerSnacks >= 1) {
      nut.push("• ‘저녁 후 간식’은 수면을 방해할 수 있어 물/우유 정도로 마무리하는 것을 추천합니다.");
    }
    if (sugary) {
      nut.push("• 당류 간식(과자/주스 등)이 포함되어 있다면 주 1~2회로 한도를 정해보세요.");
    }

    // 탄단지(대략) 인사이트
    const macro = calcMacroPct(latest.nutrition.carbsG, latest.nutrition.proteinG, latest.nutrition.fatG);
    if (macro) {
      nut.push(`• 탄/단/지(대략): 탄 ${macro.carbPct}%, 단 ${macro.proteinPct}%, 지 ${macro.fatPct}% (약 ${macro.totalKcal}kcal)`);
      if (macro.proteinPct < 12) {
        nut.push("• 단백질 비중이 낮아 보입니다. 매 끼니 ‘단백질 1가지’(달걀/두부/생선/살코기/그릭요거트)를 추가해보세요.");
      }
      if (macro.fatPct < 15 && m <= 36) {
        nut.push("• 지방 비중이 너무 낮으면 포만감이 떨어질 수 있어요. 견과류(알레르기 주의), 아보카도, 올리브유 등 ‘좋은 지방’을 소량 추가해보세요.");
      }
      if (macro.carbPct > 70) {
        nut.push("• 탄수화물 비중이 높다면 단백질/채소를 먼저 먹고, 탄수화물은 뒤로 미루는 방식도 도움이 됩니다.");
      }
    }

    // 훈육/행동 인사이트
    const dCount = latest.discipline.count || 0;
    const behavior = (latest.discipline.behavior || "").trim();
    const situation = (latest.discipline.situation || "").trim();
    const text = `${behavior} ${situation}`.trim();

    if (dCount === 0 && (behavior || situation)) {
      dis.push("• 오늘은 혼냄 없이 상황을 정리하셨어요. 좋은 기록 습관입니다!");
    }
    if (dCount >= 1) {
      dis.push("• 훈육은 ‘짧고 일관되게’가 핵심입니다: (규칙 1문장) → (즉시 결과) → (대안 행동 제시).");
      dis.push("• 아이가 진정되면 ‘왜 안 되는지’ 설명은 길게 하지 말고 1~2문장으로 끝내세요.");
    }
    if (dCount >= 3) {
      dis.push("• 훈육 횟수가 많은 날은 부모/아이 모두 에너지가 고갈된 상태일 수 있어요. 안전만 확보하고 ‘쿨다운 5분’ 후 다시 시도해보세요.");
      dis.push("• 규칙을 1~2개로 줄여(예: 던지기 금지, 때리기 금지) 성공 경험을 먼저 만들면 횟수가 줄어듭니다.");
    }

    // 키워드 기반 맞춤 문장
    const has = (k: string) => text.includes(k);
    if (has("던") || has("집어") || has("부수")) {
      dis.push("• ‘던지면 치운다’ 규칙을 고정하고, 던질 수 있는 대체물(말랑 공/쿠션)을 따로 제공해보세요.");
    }
    if (has("때리") || has("밀") || has("물")) {
      dis.push("• 공격 행동은 즉시 제지(안전) → 짧게 “몸은 아프게 하면 안 돼” → 대안(손잡기/말로하기)을 반복해주세요.");
      dis.push("• 반복되면 피곤/배고픔/경쟁 상황이 트리거인 경우가 많아, ‘발생 직전 신호’를 기록해보세요.");
    }
    if (has("떼쓰") || has("울") || has("소리")) {
      dis.push("• 감정 폭발 때는 설득보다 공감(“속상했구나”)→선택지 2개(“A할래, B할래?”)가 효과적입니다.");
    }
    if (has("거부") || has("안해") || has("싫어")) {
      dis.push("• ‘선택권’을 작게 주면 거부가 줄어듭니다. (예: 빨간 컵 vs 파란 컵, 먼저 양치 vs 먼저 책)");
    }

    // 안전 관련(심각 키워드) - 조심스럽게 안내
    const dangerKeywords = ["머리", "계단", "도로", "불", "칼", "콘센트"];
    if (dangerKeywords.some((k) => text.includes(k))) {
      dis.push("• 안전 관련 행동은 ‘즉시 차단 + 대안 제시’가 우선입니다. (설명은 짧게, 반복은 많이)");
    }
  }

  return {
    play: uniq(play).join("\n"),
    education: uniq(edu).join("\n"),
    nutrition: uniq(nut).join("\n"),
    discipline: dis.length ? uniq(dis).join("\n") : undefined,
  };
};
