# 📝 술로그 (Sool-Log) 기능 정의서 v3.0 (Nocturne Indigo Edition)

## 1. 프로젝트 개요
- **목적**: 개인의 음주 패턴을 예술적으로 기록하고 관리하는 프리미엄 라이프스타일 대시보드
- **핵심 가치**: 데이터의 시각적 즐거움(Ritual), 직관적인 기록 경험, 개인화된 건강 인사이트
- **디자인 컨셉**: **Nocturne Indigo** (High-Fidelity Dark Mode, Editorial Typography, Cinematic Glow)

---

## 2. 시스템 아키텍처 및 스택
- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4 (Pure utility approach), Framer Motion (Page & Element animation)
- **Fonts**: **Manrope** (Main - Bold/Black), Inter (Secondary)
- **Backend**: Firebase (Auth, Firestore)
- **Native Bridge**: Capacitor (iOS, Android Support)
- **Design Core**: Stitch MCP Integration (Indigo & Violet Accents)

---

## 3. 핵심 기능 및 UI 구조

### A. 레이아웃 프레임 (App Framework)
- **AppShell**: 전체 콘텐츠의 컨테이너. 배경에 앰비언트 글로우(Ambient Glow) 레이어 적용.
- **TopBar (Floating)**: 상단에 떠 있는 24px 라운딩 글래스 바. 로고(Sool.Log)와 알림/프로필 버튼 배치.
- **BottomNavigation (Floating)**: 하단 플로팅 글래스 바. 4개의 주요 탭(HOME, LOGS, STATS, ME)과 중앙의 거대 기록 버튼(Plus) 배치.

### B. 홈 대시보드 (Home Dashboard)
- **Hero: Sober Status**: 마지막 음주 후 경과 시간을 대형 디지털 글로우 숫자로 표시.
- **Quick Stats**: 월간 지출액(KRW) 및 섭취 칼로리(kcal)를 입체적인 그리드 카드로 요약.
- **Activity Feed**: 최근 음주 기록을 타임라인 카드로 노출.
- **Weekly Insight**: 주간 목표 달성률을 프로그레스 링과 함께 에디토리얼 배너로 표시.

### C. 음주 기록 시스템 (Logs & Entry)
- **Add Log Modal**: 하프 시트 스타일의 레이어드 폼. 
  - **입력 필드**: h-16 높이, 24-32px 라운드값, 인디고 포커스 링 적용.
  - **주종 검색**: 마스터 DB 연동 검색 및 수동 입력 전환 지원.
- **Log Timeline**: 기록 목록 화면. 날짜별 구분선과 주종별 고유 컬러/글로우 아이콘 적용.
- **Log Ticket (Detail)**: 기록 상세 화면. '프리미엄 영수증' 테마의 티켓 디자인 적용. 톱날형 절취선 장식 및 대형 데이터 포인트.

### D. 데이터 분석 (Advanced Analytics)
- **Weekly Flow**: Recharts AreaChart 활용. 네온 인디고 그라데이션 필(Fill) 및 4px 두께의 부드러운 곡선 적용.
- **Distribution**: Donut Chart 활용. 중앙에 입체적인 **Glass Center** (Backdrop blur + Total Count) 레이어 적용.
- **Health Insight**: 사용자의 패턴을 분석하여 '수면 질 리포트' 등 텍스트 기반의 인텔리전스 배너 제공.

---

## 4. UI/UX 디자인 규격 (Standard)
- **배경**: `#131315` (Deep Charcoal) + Radial Gradient Glows
- **포인트 컬러**: 
  - Primary: `#6366f1` (Indigo)
  - Light: `#c0c1ff`
  - Secondary: `#a855f7` (Violet)
- **공통 컴포넌트**:
  - `card`: 32px 라운딩, 블러 40px 적용된 유리 질감, 미세한 내부 보더광.
  - `btn-primary`: h-18, 강렬한 인디고 그라데이션, 강력한 그림자 및 글로우 효과.
  - `input-field`: h-16, bg-white/3, 테두리 없음, 포커스 시 ring-primary/15.

---

## 5. 현재 해결이 필요한 이슈 (꼬인 기능 목록)
- [ ] **필터링 로직 점검**: 리디자인된 FilterBar와 LogList 간의 상태 동기화 재확인 필요.
- [ ] **모달 레이어 순위(Z-index)**: 플로팅 네비게이션과 AddLogModal, LogDetailScreen 간의 레이어 겹침 현상 정밀 조정.
- [ ] **데이터 바인딩 오류**: 일부 요약 카드에서 실제 Firebase 데이터가 아닌 정적 샘플 값이 노출되는 부분 수정.
- [ ] **네이티브 안전 영역**: 플로팅 바 적용 후 iOS/Android 하단 노치 영역에서의 여백(Safe-area) 간섭 확인.
