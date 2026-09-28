"""학생 기기 연결 링크 꺼내기 (선생님용).
   python3 server/links.py        → 이름·마지막 동기화·링크 목록
   비밀키는 server/admin.local.json (gitignore). 앱은 처음 열릴 때 알아서 연결 코드를 만들어 올린다."""
import json, os, time, urllib.request, urllib.parse
cfg = json.load(open(os.path.join(os.path.dirname(__file__), 'admin.local.json')))
q = urllib.parse.urlencode({'action': 'keys', 'secret': cfg['secret']})
rows = json.load(urllib.request.urlopen(cfg['url'] + '?' + q))
if not rows:
    print('아직 연결된 기기가 없어요 (학생이 새 버전 앱을 한 번 열어야 생김)')
for r in rows:
    t = time.strftime('%m/%d %H:%M', time.localtime(r['upd'] / 1000)) if r['upd'] > 10**11 else '-'
    print(f"{r['me'] or '(이름 없음)':8} 마지막 {t}  https://reversecompany.github.io/nyang-study/#k={r['k']}")
