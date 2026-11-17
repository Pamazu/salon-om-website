# Salon photos: the photographer's full-size originals

The salon photos in `resources/salon-photos/` (1,280 px on the long side) are scaled-down copies of the photographer's Lightroom exports from the February 2026 shoot. These are those exports at full size, found 17 Nov 2026 in the shoot folder the client shared with J. None is in git: all 17 sit in this folder on the Mac Studio's disk (`/Users/j/all-worktrees/salon-om-website-b9a04e51/resources/salon-photos/originals/`), and the source is the photographer's shoot folder, whose link is on task c7892a3c (not here: this repository is public and the folder holds photos of people). Each repo photo was matched to its original by picture (all 17 matches at 0.996 or above; every runner-up at 0.69 or below).

| Repo photo | Original | Pixels | Person in it |
|---|---|---|---|
| 1 portrait standing, product wall | 5B3A1307-2 | 8192 x 5464 | yes |
| 2 lounge, fireplace | 5B3A1048 | 5330 x 7991 | no |
| 3 portrait, arms crossed | 5B3A1343 | 5464 x 8192 | yes |
| 4 styling chair, window | 5B3A1068 | 5464 x 8192 | no |
| 5 portrait seated, fireplace | 5B3A1413 | 8192 x 5464 | yes |
| 6 shampoo basins | 5B3A1072 | 8192 x 5464 | no |
| 7 Aveda product shelves | 5B3A1050 | 8192 x 5464 | no |
| 8 glo skincare display | 5B3A1070 | 8192 x 5464 | no |
| 9 team of three | 5B3A1134 | 8192 x 5464 | yes |
| 10 colour bar | 5B3A1078 | 8192 x 5464 | no |
| 11 styling stations | 5B3A1083 | 5464 x 8192 | no |
| 12 shampoo basins, back bar | 5B3A1067 | 5464 x 8192 | no |
| 13 portrait outdoor, white blazer | 5B3A1353 | 5315 x 7972 | yes |
| 14 portrait standing, shelves | 5B3A1319 | 5464 x 8192 | yes |
| 15 Aveda plant artwork | 5B3A1081 | 5464 x 8192 | no |
| 16 portrait, team member, mirror | 5B3A1438 | 8192 x 5464 | yes |
| 17 shampoo basins, wide | 5B3A1065 | 8192 x 5464 | no |

- Photo 1 has two exports of the same frame; 5B3A1307-2 is the edit the repo copy came from (mean difference 1.9 vs 8.4 at 480 px).
- Photo 6 has two files, 5B3A1072 and 5B3A1072-2, pixel-identical (only metadata differs).
- The photos with a person in them are never committed until StoryLegal's client-photo conditions are met; the folder's `.gitignore` keeps every original out of git.
- The shoot folder holds 86 photos in all (3.2 GB); the 69 not used on the site are not copied here.
