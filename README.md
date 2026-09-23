# 냥공부

고양이랑 매일 조금씩 공부하는 PWA. https://reversecompany.github.io/nyang-study/

- 데이터는 학생 폰(localStorage)에만 저장된다. 서버 없음.
- 매일 20:00 KST, GitHub Actions(`daily.yml`)가 구독자에게 빈 푸시를 보낸다.
  무슨 말을 할지는 폰의 `sw.js`가 공부 기록을 보고 고른다.
- 학생이 설정 탭에서 보낸 "알림 코드" 등록: `python3 add_sub.py 이름 'NYANG:...'`
- 수동 테스트 발송: `gh workflow run daily.yml -R reversecompany/nyang-study`

## 사문 탭 (2026-09-23)
- `samun.js` — 퀴즈 엔진(간격 반복 복습, 인출 속도 판정, 자료 계산 드릴, 예상 점수). 기록은 `S.sm` (백업 코드에 포함).
- `samun_cards.json` — 카드 795장. **직접 고치지 말 것**: `~/클로드코드/사문_작업/build_cards.py`로 다시 만든다.
  - 마더텅 2027 「기출 OX 607제」(정답·해설은 교재 정답표 그대로) + 수특 2027 개념 체크·보조단 용어.
- 예상 점수 = 단원별 숙련도 × 2026학년도 6·9월 모평 + 수능 단원별 문항 수 가중, 등급은 대략적인 컷 환산(참고값).
