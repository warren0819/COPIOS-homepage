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

## 히든 기능: 발표자료

상단 헤더의 **COPIOS 워드마크를 4초 안에 5번 클릭**하면 비밀번호 입력창이 뜨고,
일치하면 전체화면 발표자료 모드로 전환됩니다.

- 기본 비밀번호: `copios2026`
- 조작: `←` `→` 방향키 또는 화면 버튼으로 슬라이드 이동, `Esc` 또는 ✕로 닫기

### 비밀번호 변경

`js/main.js`의 `PW_HASH` 값을 새 비밀번호의 SHA-256 해시로 교체하면 됩니다:

```bash
python3 -c "import hashlib; print(hashlib.sha256('새비밀번호'.encode()).hexdigest())"
```

> 참고: 정적 사이트 특성상 발표자료 내용 자체는 페이지 소스에 포함됩니다.
> 민감한 수치를 담아야 한다면 내용 암호화 방식으로 업그레이드가 필요합니다.

### 슬라이드 수정

`index.html`의 `<div class="deck">` 안 `<section class="slide">` 블록을
수정/추가하면 됩니다. 슬라이드 수는 자동으로 반영됩니다.

## 내용 수정하기

- 텍스트는 모두 `index.html`에서 직접 수정
- 색상·타이포는 `css/style.css` 상단의 `:root` 토큰에서 변경
  (`--navy`, `--gold`, `--fs-*`, `--lh-*` 등)
