# 냥공부

고양이랑 매일 조금씩 공부하는 PWA. https://reversecompany.github.io/nyang-study/

- 데이터는 학생 폰(localStorage)에만 저장된다. 서버 없음.
- 매일 20:00 KST, GitHub Actions(`daily.yml`)가 구독자에게 빈 푸시를 보낸다.
  무슨 말을 할지는 폰의 `sw.js`가 공부 기록을 보고 고른다.
- 학생이 설정 탭에서 보낸 "알림 코드" 등록: `python3 add_sub.py 이름 'NYANG:...'`
- 수동 테스트 발송: `gh workflow run daily.yml -R reversecompany/nyang-study`
