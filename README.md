# copios-homepage

COPIOS 투자법인 홈페이지 (순수 HTML / CSS / JavaScript)

## 구조

```
index.html      # 메인 페이지 (히어로 · Philosophy · Brand Identity · Business · CEO Message)
css/style.css   # 스타일 (네이비+골드 테마, 타입 토큰 시스템, 반응형)
js/main.js      # 메뉴, 스크롤 효과, 히든 발표자료 게이트
assets/logo.png # 풍요의 뿔(Cornucopia) 심볼
```

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## GitHub Pages 배포

1. GitHub 저장소 → **Settings** → **Pages** 이동
2. **Source**: `Deploy from a branch` 선택
3. **Branch**: `main` / 폴더 `/ (root)` 선택 후 저장
4. 몇 분 후 `https://<계정명>.github.io/copios-homepage/` 에서 확인

커스텀 도메인(copios.co.kr)을 연결하려면 Pages 설정의 **Custom domain**에
도메인을 입력하고, DNS에서 CNAME 레코드를 `<계정명>.github.io`로 지정하면 됩니다.

## 히든 기능: 발표자료 (암호화)

상단 헤더의 **COPIOS 워드마크를 4초 안에 5번 클릭**하면 비밀번호 입력창이 뜹니다.

- 발표자료 HTML은 **AES-256-GCM으로 암호화**되어 `assets/deck.enc.json`에만 존재합니다.
  비밀번호가 곧 복호화 키라서, 페이지 소스를 열어봐도 내용을 읽을 수 없습니다.
- 복호화에 성공하면 전체화면 발표자료가 열립니다. `Esc` 또는 ✕로 닫기.
- 발표자료 자체 조작(슬라이드 이동, 발표 모드, 테마)은 발표자료에 내장된 기능을 그대로 씁니다.

### 발표자료 수정 / 비밀번호 변경

발표자료 원본(평문 HTML)은 **이 저장소에 커밋하지 않습니다**
(GitHub Pages로 전부 공개되기 때문). 원본은 `gold` 저장소에서 관리하세요.

수정 절차:

```bash
# 1. gold 저장소에서 발표자료 HTML 수정
# 2. 암호화해서 이 저장소에 반영 (비밀번호를 바꾸려면 새 비밀번호로 실행)
pip install cryptography          # 최초 1회
python3 tools/encrypt_deck.py <발표자료.html 경로> <비밀번호>
# 3. assets/deck.enc.json 커밋 & push
```

## 내용 수정하기

- 텍스트는 모두 `index.html`에서 직접 수정
- 색상·타이포는 `css/style.css` 상단의 `:root` 토큰에서 변경
  (`--navy`, `--gold`, `--fs-*`, `--lh-*` 등)
