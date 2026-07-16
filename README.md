# copios-homepage

**COPIOS 투자법인 공식 홈페이지** — 순수 HTML / CSS / JavaScript 정적 사이트

🌐 **https://copios.co.kr** (GitHub Pages + 커스텀 도메인)

## 구조

```
index.html            # 메인 페이지 (히어로 · Philosophy · Brand Identity · Business · CEO Message)
css/style.css         # 스타일 (네이비+샴페인 골드 테마, 타입 토큰 시스템, 반응형)
js/main.js            # 메뉴 · 스크롤스파이 · 등장 애니메이션 · 히든 발표자료 게이트
assets/logo.png       # 풍요의 뿔(Cornucopia) 심볼
assets/deck.enc.json  # 암호화된 발표자료 (AES-256-GCM)
tools/encrypt_deck.py # 발표자료 암호화 스크립트
CNAME                 # 커스텀 도메인 (copios.co.kr)
```

## 배포 구성

- **호스팅**: GitHub Pages — `main` 브랜치 루트에서 자동 배포 (push 후 1~2분 내 반영)
- **도메인**: copios.co.kr — DNS는 Cloudflare에서 관리 (GitHub Pages A 레코드 4개 + www CNAME, DNS 전용)
- **HTTPS**: GitHub 자동 발급 인증서, Enforce HTTPS 활성화
- 별도 서버·빌드 과정 없음. `main`에 커밋하면 그게 곧 배포

## 히든 기능: 발표자료 (암호화)

상단 헤더의 **COPIOS 워드마크를 4초 안에 5번 클릭**하면 비밀번호 입력창이 뜹니다.

- 발표자료 HTML은 **AES-256-GCM으로 암호화**되어 `assets/deck.enc.json`에만 존재합니다.
  비밀번호가 곧 복호화 키라서, 페이지 소스를 열어봐도 내용을 읽을 수 없습니다.
- 복호화에 성공하면 전체화면 발표자료가 열립니다. 좌상단 홈 아이콘 또는 `Esc`로 복귀.
- 발표 모드에서는 발표 종료 버튼 외 모든 UI가 숨겨집니다.

## 발표자료 수정 — 자동 배포 (권장)

발표자료 원본은 **`gold` 저장소 `Dev` 브랜치의 `copios-발표자료.html`** 에서 관리합니다.
GitHub Actions(`gold/.github/workflows/deploy-deck.yml`)가 연결되어 있어서:

```
gold(Dev)에서 copios-발표자료.html 수정 → 커밋
  → Actions가 자동 암호화 → 이 저장소 main에 커밋 → 1~2분 내 사이트 반영
```

- 필요한 시크릿(gold 저장소): `HOMEPAGE_PUSH_TOKEN`(이 저장소 쓰기 권한 PAT), `DECK_PASSWORD`
- 평문 HTML은 이 저장소에 절대 커밋하지 않습니다 (GitHub Pages로 전부 공개되기 때문)

### 수동 반영 (예비 절차)

자동화가 동작하지 않을 때:

```bash
pip install cryptography   # 최초 1회
python3 tools/encrypt_deck.py <copios-발표자료.html 경로> <비밀번호>
# 생성된 assets/deck.enc.json 커밋 & push
```

비밀번호 변경도 같은 명령에 새 비밀번호를 넣어 실행한 뒤,
gold 저장소의 `DECK_PASSWORD` 시크릿을 함께 갱신하면 됩니다.

## 홈페이지 내용 수정

- 문구는 모두 `index.html`에서 직접 수정 → `main` 커밋 시 자동 배포
- 색상·타이포는 `css/style.css` 상단의 `:root` 토큰에서 변경
  (`--navy`, `--gold`, `--fs-*`, `--lh-*` 등)
- 로고 교체는 `assets/logo.png` 파일만 갈아끼우면 전체 반영

## 로컬에서 미리 보기

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```
