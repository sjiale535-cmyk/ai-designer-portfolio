"""Check web encodings before publishing; do not alter either copy."""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools' / 'python'))
import imageio_ffmpeg
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
report = json.loads((ROOT / '.tools' / 'compression-report.json').read_text())
source_dir = ROOT / 'public' / 'portfolio-videos'
if not source_dir.exists():
    source_dir = ROOT / '.video-originals' / 'portfolio-videos'

def inspect(path):
    result = subprocess.run(
        [ffmpeg, '-hide_banner', '-i', str(path)],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )
    match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', result.stderr)
    if not match:
        raise RuntimeError(f'Cannot inspect {path.name}')
    return sum(float(value) * factor for value, factor in zip(match.groups(), [3600, 60, 1])), result.stderr

for entry in report:
    name = entry['name']
    original_duration, _ = inspect(source_dir / name)
    target = ROOT / 'public' / 'web-videos' / name
    duration, metadata = inspect(target)
    assert abs(duration - original_duration) <= 0.2, f'{name}: duration mismatch'
    assert 'Video: h264' in metadata and 'yuv420p' in metadata, f'{name}: incompatible video format'
    assert target.stat().st_size < 100 * 1024 * 1024, f'{name}: exceeds GitHub file limit'
    with target.open('rb') as handle:
        assert b'moov' in handle.read(4096), f'{name}: missing fast-start metadata'
    print(f'PASS {name}: {duration:.2f}s', flush=True)
print(f'Verified {len(report)} videos', flush=True)
