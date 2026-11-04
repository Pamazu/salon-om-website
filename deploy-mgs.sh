#!/bin/bash
# Build and deploy the three copy versions of Option 2.2 (M, G, S; task cf7dd8fd) to their own Firebase sites.
# Each site = option-2.2/site's assets (films, photos, fonts, sound) + that version's index.html, staged as real files.
# Never touches the five checkpoint sites or salon-om-2-2-next.
#   bash deploy-mgs.sh            # m g s
#   bash deploy-mgs.sh g          # one
set -euo pipefail
cd "$(dirname "$0")"
letters=("${@:-m g s}"); [ $# -eq 0 ] && letters=(m g s)
python3 option-2.x-shared/source/build.py $(printf '2.2-%s ' "${letters[@]}")
stage="${TMPDIR:-/tmp}/salon-om-mgs-stage"
for l in "${letters[@]}"; do
  site="salon-om-2-2-$l"; d="$stage/$l"
  rm -rf "$d"; mkdir -p "$d"
  rsync -a --exclude index.html --exclude firebase.json --exclude .firebaserc --exclude refs --exclude tweaks.json option-2.2/site/ "$d/"
  cp "option-2.2-mgs/$l/index.html" "$d/index.html"
  [ "$l" = m ] && rsync -a option-2.2-mgs/refs/ "$d/refs/"      # the reference page lives on M: salon-om-2-2-m.web.app/refs/
  python3 - "$d" "$site" <<'PY'
import json, sys
c = json.load(open('option-2.2/site/firebase.json')); c['hosting']['site'] = sys.argv[2]
json.dump(c, open(sys.argv[1] + '/firebase.json', 'w'), indent=2)
open(sys.argv[1] + '/.firebaserc', 'w').write('{ "projects": { "default": "salon-om-sites" } }\n')
PY
  (cd "$d" && firebase deploy --only hosting --project salon-om-sites --non-interactive) | tail -2
  echo "https://$site.web.app"
done
