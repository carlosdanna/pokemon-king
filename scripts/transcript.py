"""Render a Claude Code session log as Markdown for docs/transcripts.md.

Usage: python3 -I scripts/transcript.py [session.jsonl]
Without an argument it uses the newest log of this project in ~/.claude/projects/.
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LOGS = Path.home() / '.claude/projects/-home-cduser-projects-pokemon-king'
REPO = '/home/cduser/projects/pokemon-king/'
TZ = ZoneInfo('Europe/Stockholm')


def hhmm(ts):
    return datetime.fromisoformat(ts.replace('Z', '+00:00')).astimezone(TZ).strftime('%H:%M')


def render(src):
    out, tools = [], {}
    for line in open(src):
        m = json.loads(line)
        if m.get('type') not in ('user', 'assistant'):
            continue
        c = m['message']['content']
        for b in [{'type': 'text', 'text': c}] if isinstance(c, str) else c:
            if b['type'] == 'text':
                txt = re.sub(r'</?pasted_content[^>]*>', '', b['text']).strip()
                if m['type'] == 'user' and txt.startswith('<'):
                    continue  # system reminders, not the user's words
                who = 'Carlos' if m['type'] == 'user' else 'Claude'
                out.append(f"#### {hhmm(m['timestamp'])} · {who}\n\n{txt}\n")
            elif b['type'] == 'tool_use':
                tools[b['id']] = b['name']
                i = b['input']
                if b['name'] == 'AskUserQuestion':
                    qs = '\n'.join(f"> **{q['question']}**\n> " + ' / '.join(o['label'] for o in q['options'])
                                   for q in i['questions'])
                    out.append(f"\n*Claude asked:*\n\n{qs}\n")
                elif b['name'] == 'Write' and '/.claude/plans/' in i['file_path']:
                    out.append(f"\n*Claude wrote the plan:*\n\n<details><summary>Plan</summary>\n\n"
                               f"~~~~markdown\n{i['content'].rstrip()}\n~~~~\n\n</details>\n")
                elif b['name'] != 'ToolSearch':
                    label = i.get('description') or i.get('file_path', '').replace(REPO, '') or b['name']
                    out.append(f"- *{b['name']}*: {label}")
            elif b['type'] == 'tool_result':
                name = tools.get(b['tool_use_id'])
                res = b['content'] if isinstance(b['content'], str) else ' '.join(x.get('text', '') for x in b['content'])
                if name == 'AskUserQuestion':
                    out.append('\n*Carlos answered:* ' + '; '.join(re.findall(r'"="([^"]+)"', res)) + '\n')
                elif name == 'ExitPlanMode':
                    out.append('\n*Carlos approved the plan.*\n')
    # a blank line after a run of tool bullets, so the next block is not swallowed by the list
    lines = []
    for entry in out:
        if lines and lines[-1].startswith('- *') and not entry.startswith(('- *', '\n')):
            lines.append('')
        lines.append(entry)
    return '\n'.join(lines)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else max(LOGS.glob('*.jsonl'), key=lambda p: p.stat().st_mtime)
    print(render(src))
