# copios-homepage

COPIOS 홈페이지 (순수 HTML / CSS / JavaScript)

## 구조

```
index.html      # 메인 페이지 (히어로 · 회사소개 · 서비스 · 핵심역량 · 문의하기)
css/style.css   # 스타일 (반응형, 스크롤 애니메이션 포함)
js/main.js      # 모바일 메뉴, 스크롤 효과, 문의 폼 등
```

## 로컬에서 보기

`index.html`을 브라우저로 열면 바로 확인할 수 있습니다.
또는 간단한 로컬 서버 사용:

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

## 내용 수정하기

- 회사 소개, 서비스 설명, 연락처 등 텍스트는 모두 `index.html`에서 직접 수정
- 색상은 `css/style.css` 상단의 `:root` 변수(`--primary` 등)에서 변경
- 문의 폼은 메일 클라이언트를 여는 방식(`mailto:`)이며, 수신 주소는
  `js/main.js` 하단에서 변경할 수 있습니다
