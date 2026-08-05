# 극한 벽짓고 살아남기 Remaster Bank Editor

## 지원 기능
- `.SC2Bank` 업로드/검증
- 편집 항목: `Data1`(레벨), `Data2`(현재 경험치), `Data4`(플레이 횟수), `Data5`(클리어 횟수)
- 저장 시 `PS`와 `Signature` 자동 재계산
- 수정 전/후 변경값(레벨/XP/플레이/클리어/PS/Signature) 리뷰
- 계정 식별/진단 상태(PS, Signature) 노출
- 권장 `Banks` 경로/저장 파일 힌트 제공

## 사용
- https://TPP5a.github.io/UnlimitedSuviveWall-Bank-Editor/

## 토큰(.env) 관리
- `GITHUB_TOKEN`은 로컬 환경의 `.env` 또는 `.env.local` 파일에만 넣습니다.
- 커밋에는 `.env`, `.env.local`을 넣지 않습니다. 템플릿은 `.env.example`만 공유합니다.

## 로컬 실행 (Windows)
- `npm install`
- `npm run dev`

## 참고
- 식별값 예시(개인정보 제외)
  - 권장 경로: `%USERPROFILE%\\Documents\\StarCraft II\\Accounts\\[본인 Battle.net 계정 번호]\\[맵 고유 핸들]\\Banks`
  - 권장 저장 파일: `%USERPROFILE%\\Documents\\StarCraft II\\Accounts\\[본인 Battle.net 계정 번호]\\[맵 고유 핸들]\\Banks\\UnlimitedSuviveWall.SC2Bank`
- 예시(맵 고유 핸들 예시): `3-S2-1-1910618`
- 문제가 발생해도 공개 채널에는 사용자 계정 식별값을 넣지 않습니다.
- 민감 정보가 필요하면 비공개 방식으로 처리됩니다.

## 개인정보/보안
- `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` 미사용
- `localStorage`, `sessionStorage`, `indexedDB` 미사용
- CSP는 `index.html`의 `<meta http-equiv="Content-Security-Policy">`에 정의되어 있으며, 개발/배포 환경(로컬 호스트 소켓 포함)에서 사용할 수 있도록 구성되어 있습니다.

## 라이선스
- MIT (프로젝트 코드)
- StarCraft II 및 관련 맵/게임 콘텐츠의 권리는 각 권리자에게 귀속됩니다.
