"""Soundscapes for Salon OM Option 2: each = ambient music bed (+ a nature layer), loudness-matched,
made into a seamless loop with an equal-power crossfade, then padded by 0.5s each side so the page
can loop [0.5, 0.5+L] exactly (immune to MP3 encoder delay)."""
import subprocess, re, json, os
SRC = '/mnt/user-data/uploads/Maggie website/option-2/media/raw/sound/'
OUT = '/home/claude/opt2/site/sound/'; W = '/home/claude/opt2/work/snd/'
os.makedirs(OUT, exist_ok=True)
SEG0, SEGLEN, XF, PAD = 20.0, 96.0, 6.0, 0.5
PLAN = {  # name: (music, music LUFS, layer, layer LUFS)
  'earth': ('snd-earth-music.mp3', -21, 'snd-earth-forest.mp3', -31),
  'water': ('snd-water-music.mp3', -22, 'snd-water-waves.mp3', -25),
  'fire':  ('snd-fire-music.mp3',  -22, 'snd-fire-embers.mp3', -28),
  'air':   ('snd-air-music.mp3',   -22, 'snd-air-breeze.mp3', -28),
  'ether': ('snd-ether-music.mp3', -21, None, None),
  'bed':   ('snd-bed-music.mp3',   -23, 'snd-bed-rainforest.mp3', -31),
}
def run(*a): subprocess.run(a, check=True, capture_output=True)
def lufs(path):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
    return I, P
report = {}
for name, (mus, mt, lay, lt) in PLAN.items():
    m = W + f'{name}-m.wav'
    run('ffmpeg', '-y', '-v', 'error', '-ss', str(SEG0), '-t', str(SEGLEN), '-i', SRC + mus, '-ar', '44100', '-ac', '2', m)
    mi, _ = lufs(m); parts = [(m, mt - mi)]
    if lay:
        l = W + f'{name}-l.wav'
        run('ffmpeg', '-y', '-v', 'error', '-stream_loop', '4', '-i', SRC + lay, '-t', str(SEGLEN), '-ar', '44100', '-ac', '2', l)
        li, _ = lufs(l); parts.append((l, lt - li))
    mix = W + f'{name}-mix.wav'
    ins = sum([['-i', p] for p, _ in parts], [])
    f = ''.join(f'[{i}:a]volume={g:.2f}dB[a{i}];' for i, (_, g) in enumerate(parts))
    f += ''.join(f'[a{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,alimiter=limit=0.84:attack=20:release=400[o]' if len(parts) > 1 else '[a0]alimiter=limit=0.84:attack=20:release=400[o]'
    run('ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', f, '-map', '[o]', mix)
    # seamless loop: body = mix[XF:], its tail crossfaded (equal power) into mix[0:XF]
    loop = W + f'{name}-loop.wav'
    run('ffmpeg', '-y', '-v', 'error', '-i', mix, '-i', mix, '-filter_complex',
        f'[0:a]atrim=start={XF},asetpts=PTS-STARTPTS[a];[1:a]atrim=end={XF},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d={XF}:c1=qsin:c2=qsin[o]',
        '-map', '[o]', loop)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', loop, '-f', 's16le', '-'], capture_output=True).stdout
    L = len(raw) / 4 / 44100; assert L > 60, (name, L)
    # pad: [last PAD s] + loop + [first PAD s]  -> the file is periodic, loop region [PAD, PAD+L]
    padded = W + f'{name}-pad.wav'
    run('ffmpeg', '-y', '-v', 'error', '-i', loop, '-i', loop, '-i', loop, '-filter_complex',
        f'[0:a]atrim=start={L-PAD},asetpts=PTS-STARTPTS[h];[2:a]atrim=end={PAD},asetpts=PTS-STARTPTS[t];[h][1:a][t]concat=n=3:v=0:a=1[o]',
        '-map', '[o]', padded)
    out = OUT + f'{name}.mp3'
    run('ffmpeg', '-y', '-v', 'error', '-i', padded, '-af', 'volume=-2.5dB', '-c:a', 'libmp3lame', '-b:a', '112k', '-ar', '44100', out)
    I, P = lufs(out)
    report[name] = {'loop_seconds': round(L, 3), 'pad': PAD, 'lufs': I, 'peak_dbfs': P, 'kb': os.path.getsize(out) // 1024}
    print(name, report[name], flush=True)
json.dump(report, open(OUT + 'loops.json', 'w'), indent=1)
