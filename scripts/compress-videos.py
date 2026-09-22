"""Create H.264 web copies without modifying source videos."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools' / 'python'))
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TARGET = ROOT / 'public' / 'web-videos'
TARGET.mkdir(exist_ok=True)
names = sorted(set(re.findall(r'/(?:portfolio-videos|web-videos)/([^\s\x27\x22]+\.mp4)', (ROOT / 'src' / 'App.jsx').read_text(encoding='utf-8'))))

def compress(name):
    source = ROOT / 'public' / 'portfolio-videos' / name
    target = TARGET / name
    if not target.exists():
        result = subprocess.run([
            FFMPEG, '-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-i', str(source),
            '-map', '0:v:0', '-map', '0:a?', '-vf',
            "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p',
            '-threads', '2', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(target)
        ], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError(f'{name}: {result.stderr}')
    check = subprocess.run([FFMPEG, '-v', 'error', '-i', str(target), '-map', '0:v:0', '-frames:v', '1', '-f', 'null', '-'], capture_output=True, text=True)
    if check.returncode:
        raise RuntimeError(f'{name}: verification failed: {check.stderr}')
    record = {'name': name, 'originalBytes': source.stat().st_size, 'webBytes': target.stat().st_size}
    print(json.dumps(record), flush=True)
    return record

with ThreadPoolExecutor(max_workers=2) as pool:
    records = list(pool.map(compress, names))
(ROOT / '.tools' / 'compression-report.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(json.dumps({'count': len(records), 'originalBytes': sum(r['originalBytes'] for r in records), 'webBytes': sum(r['webBytes'] for r in records)}), flush=True)
