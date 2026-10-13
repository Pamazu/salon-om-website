# Deploy handoff for Claude Code

Paste everything between the lines into Claude Code in Terminal on this Mac.

---

Please deploy my Salon OM websites to Firebase Hosting: four static sites in one Firebase project.

Folder: `~/j-workspace/Maggie website`

| Folder | Firebase site | Address |
| --- | --- | --- |
| `option-2/site` | `salon-om-option-2` | https://salon-om-option-2.web.app |
| `option-2.2/site` | `salon-om-2-2` | https://salon-om-2-2.web.app |
| `option-2.3/site` | `salon-om-2-3` | https://salon-om-2-3.web.app |
| `option-2.4/site` | `salon-om-2-4` | https://salon-om-2-4.web.app |

Each `site` folder is a finished static site with its own `firebase.json` (site name, cache headers) and `.firebaserc` (project `salon-om-sites`). Don't change `index.html`, the media or the sound files, and don't delete anything in these folders.

1. Run `cd ~/j-workspace/"Maggie website" && bash deploy-all.sh`. It installs `firebase-tools` if needed, checks I'm signed in, creates the project `salon-om-sites` and the four sites if they don't exist yet, and deploys each folder.
2. If I'm not signed in, run `firebase login` and wait while I finish it in the browser. My Firebase notes are in `~/All` if you need to know which Google account or existing project to use. Read only what you need and never print keys, tokens or passwords.
3. First check `firebase projects:list`. If I already have a Salon OM project (for example `salon-om-option-2` or `salon-om-variations`), reuse it: run `bash deploy-all.sh <that-project-id>` and set the same id in the four `.firebaserc` files.
4. If the project id or a site name is already taken by someone else, choose a unique one (add `-maggie` or a short number), update `"site"` in that folder's `firebase.json` (and the project id in the `.firebaserc` files), and run the script again.
5. If creating the project needs me to accept terms or set up billing, stop and tell me exactly what to click in the Firebase console.
6. Check each site: `curl -sI https://<site>.web.app` should return 200, and `curl -sI https://<site>.web.app/media/hero.mp4` should return 200 with `content-type: video/mp4` and a `cache-control` header.
7. Tell me the four live addresses. Also remind me that the free Spark plan allows 360 MB of transfer a day per project, and one full visit with the films is roughly 25 to 30 MB, so before sharing widely I should switch the project to Blaze (pay as you go) in the Firebase console. Don't change billing yourself.

---

Firebase Hosting serves from a global CDN, so the sites load fast in the US and elsewhere; nothing extra is needed for that.
