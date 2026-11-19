#!/bin/bash
# Build and deploy the three copy versions of Option 2.2 (M, G, S; task cf7dd8fd) to their own Firebase sites.
# Each site = option-2.2/site's assets (films, photos, fonts, sound) + that version's index.html, staged as real files.
# Never touches the five checkpoint sites or salon-om-2-2-next.
#   bash deploy-mgs.sh            # m g s
#   bash deploy-mgs.sh g          # one
#   CHANNEL=r2 bash deploy-mgs.sh # to a 7-day preview address per site (QA before the links J reviews change)
set -euo pipefail
cd "$(dirname "$0")"
letters=("${@:-m g s}"); [ $# -eq 0 ] && letters=(m g s)
python3 option-2.x-shared/source/build.py $(printf '2.2-%s ' "${letters[@]}")
# A deploy never turns off a feature J approved (task 448f6e27): refuses before anything is staged or sent, unless the
# deployed commit's message quotes J's words naming the row; and never goes out from a commit that lacks what is live
# (task 6328eca1: each site's deployed.json, else origin/mgs-options). Guards the CHANNEL= preview too.
python3 option-2.x-shared/source/approved_gate.py "${letters[@]}"
stage="${TMPDIR:-/tmp}/salon-om-mgs-stage"
for l in "${letters[@]}"; do
  site="salon-om-2-2-$l"; d="$stage/$l"
  rm -rf "$d"; mkdir -p "$d"
  rsync -a --exclude index.html --exclude firebase.json --exclude .firebaserc --exclude refs --exclude tweaks.json option-2.2/site/ "$d/"
  cp "option-2.2-mgs/$l/index.html" "$d/index.html"
  # the commit this site now carries (task 6328eca1): the gate reads it back so no later deploy goes out from an older base
  printf '{"commit": "%s", "at": "%s"}\n' "$(git rev-parse HEAD)" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$d/deployed.json"
  [ "$l" = m ] && rsync -a option-2.2-mgs/refs/ "$d/refs/"      # the reference page lives on M: salon-om-2-2-m.web.app/refs/
  python3 - "$d" "$site" <<'PY'
import json, sys
c = json.load(open('option-2.2/site/firebase.json')); c['hosting']['site'] = sys.argv[2]
json.dump(c, open(sys.argv[1] + '/firebase.json', 'w'), indent=2)
open(sys.argv[1] + '/.firebaserc', 'w').write('{ "projects": { "default": "salon-om-sites" } }\n')
PY
  # Firebase's own answer is never cut to its last lines or filtered to one: a failed upload (18 Nov: "HTTP Error: 429, You have exceeded the
  # Hosting storage quota", of which `| tail -2` showed only the closing "Tip: Manage your Hosting storage ...") prints Firebase's WHOLE
  # output, and the script stops before the next site; a good one prints the address(es) Firebase reports (task 1616847c)
  if [ -n "${CHANNEL:-}" ]; then
    fb=(firebase hosting:channel:deploy "$CHANNEL" --only "$site" --expires 7d --project salon-om-sites --non-interactive)
  else
    fb=(firebase deploy --only hosting --project salon-om-sites --non-interactive)
  fi
  if ! out=$(cd "$d" && "${fb[@]}" 2>&1); then
    printf '%s\n' "$out" >&2
    echo "deploy-mgs.sh: firebase failed for $site (its whole answer is above); stopping before the next site" >&2
    exit 1
  fi
  if [ -n "${CHANNEL:-}" ]; then
    url=$(printf '%s\n' "$out" | awk '/Channel URL/ { for (i = 1; i <= NF; i++) if ($i ~ /^https:\/\/.*web\.app/) { print $i; exit } }')
    if [ -z "$url" ]; then
      printf '%s\n' "$out" >&2
      echo "deploy-mgs.sh: firebase finished for $site but its answer has no Channel URL (whole answer above)" >&2
      exit 1
    fi
    echo "$url"
  else
    printf '%s\n' "$out" | awk '/Deploy complete|Hosting URL/'
    echo "https://$site.web.app"
  fi
done
