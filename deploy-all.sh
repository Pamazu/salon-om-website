#!/usr/bin/env bash
# Salon OM: publish Option 1, 2, 2.2, 2.3 and 2.4 on Firebase Hosting.
# One Firebase project, five sites. Run from anywhere:
#   ~/j-workspace/"Maggie website"/deploy-all.sh            (project: salon-om-sites)
#   ~/j-workspace/"Maggie website"/deploy-all.sh my-project  (another project id)
set -uo pipefail
cd "$(dirname "$0")"
PROJECT="${1:-salon-om-sites}"
FOLDERS=("option-1" "option-2" "option-2.2" "option-2.3" "option-2.4")

if ! command -v firebase >/dev/null 2>&1; then
  echo "Installing the Firebase CLI…"; npm install -g firebase-tools || { echo "Could not install firebase-tools."; exit 1; }
fi
firebase login:list 2>/dev/null | grep -q "Logged in as" || firebase login || exit 1

if ! firebase projects:list --json 2>/dev/null | grep -q "\"projectId\": *\"$PROJECT\""; then
  echo "Creating Firebase project ${PROJECT}…"
  firebase projects:create "$PROJECT" --display-name "Salon OM" \
    || { echo "Could not create $PROJECT (the id may be taken). Run again with another id: ./deploy-all.sh salon-om-$RANDOM"; exit 1; }
fi

fail=0; urls=()
for dir in "${FOLDERS[@]}"; do
  cfg="$dir/site/firebase.json"
  [ -f "$cfg" ] || { echo "Missing $cfg"; fail=1; continue; }
  site="$(sed -n 's/.*"site": *"\([^"]*\)".*/\1/p' "$cfg" | head -1)"
  if ! firebase hosting:sites:get "$site" --project "$PROJECT" >/dev/null 2>&1; then
    firebase hosting:sites:create "$site" --project "$PROJECT" \
      || { echo "The site name \"$site\" is taken. Change \"site\" in $cfg to something unique and run again."; fail=1; continue; }
  fi
  echo; echo "== $dir → https://$site.web.app"
  if (cd "$dir/site" && firebase deploy --only hosting --project "$PROJECT" --non-interactive); then
    urls+=("$dir  https://$site.web.app")
  else fail=1; fi
done

echo; echo "Live:"; for u in "${urls[@]}"; do echo "  $u"; done
[ $fail -eq 0 ] || echo "Some sites did not deploy; see the messages above."
exit $fail
