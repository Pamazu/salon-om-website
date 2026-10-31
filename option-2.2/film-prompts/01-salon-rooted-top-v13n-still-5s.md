DREAMINA: Salon OM moment 01 "Rooted", TOP film (v13n-still, 5-SECOND TEST 7 by route 2, 1 Nov 2026)
Why: J, 29 Oct ~08:00 (verbatim on task cc1fec01), on tests 4 and 5: the room behind "look[s] very flat. I think that's because the video includes a flat image ... you don't need to place that flat image in the video"; "we need to show where the water comes out, as it's important to include water flowing into the hair in a peaceful way"; "the hand movements on her head feel robotic and a bit creepy, not peaceful or relaxing"; "the overall look should be cinematic—lighting, studio quality". Test Lab: EXP-salon-rooted-1, arm SR13 (planned), vs SR12.
What changed from v13g (route 2, CEO MA 31 Oct 22:15), ONE change:
- The motion reference becomes a STILL: @move is the v13g previz's middle frame (renders/previz-v13g-mid.png), an image, not the video. Dreamina's review refused the v13g VIDEO within seconds (30 Oct); the still showed no refusal after 3 min 40 s (31 Oct). The camera move is now carried by words: slow, left to right, the view staying on the part of the room the basins photo shows. Test Lab arm SR18 = SR17 with the still in place of the video.
What changed from v12 (kept):
- The previz (Designer 1's v13) is a plain grid set with plain stand-ins: the photo is no longer in the video. So every line saying "the room in the video is the photo itself" is gone; the room's look comes only from the image reference @loc_basins (SRH12).
- Camera and framing follow Designer 1's v13 previz (rooted-previz-v9 @ 9847c4d): between test 4 and test 5, 60% toward test 5 (J: "Perhaps the camera should be positioned between the two"); from the left-wall side at her head height, 30 mm, a slow push-in. The drawer spot was checked and NOT used: with the drawer unit removed, 27% of that frame is room no photo shows (J: "If that happens, it's better not to do it"). This camera: 3.9% unseen by any of the three basin photos (mixar/v13-coverage/), the plain cream wall under the glass shelf, named in words.
- v13n (test 7, 1 Nov): Designer 1's free review bisect (renders/review-checks-2026-10-31.md): with her body one skin-coloured shape, the faceless head, the pool or the stream each got the previz refused; ONE change, a dark teal salon cape on her body (`--cape`), and the v13n still was APPROVED. These words are v13g's plus one clause saying the teal shape only marks her body, which wears the black smock (SRH18).
- v13g (test 7, arm SR17, 29 Oct ~11:30): the face cause did NOT hold (SRH17 corrected 31 Oct): the 29 Oct "approved" reads were taken before Dreamina's review had finished, and v13g itself was refused on a settled read (30 Oct). Designer 1's v13g is v13d with faceless adult mannequin heads. These words are v13d's, unchanged: her face is described in words ("face in profile looking up, eyes closed"), never drawn by the previz (SRH3).
- v13d (test 7, arm SR16, 29 Oct ~11:00): v13c (thin arc) was refused too, and a v13 control with new bytes was approved: the review refuses every previz without v13's big glassy water (SRH17). Designer 1's v13d has the low cylinder tap, a THICK glassy stream onto the back of her head and water pooled in the bowl. These words are v13b's plus one clause for the pooled water ("where clear water pools around her hair"); the repeat of her feet in KEEP CONSISTENT is cut to stay under 1,000 words (the feet stay in the shot lines).
- v13c (test 7, arm SR15, 29 Oct ~10:30): Dreamina's upload review refused every previz with no water in it (SR14 not run, 0 credits), so Designer 1's v13c shows a short, thin, clear water arc from the low spout onto the back of her head, in place of v13's tall glassy column. These words are v13b's unchanged; they already describe that arc ("a soft, clear stream" from "the short, low chrome spout").
- v13b (test 7, arm SR14), two changes together because J named the tap (29 Oct ~10:00: "In Spanish it's like Grifo. The think water drops is not aligned to how it is in the actual image"): (1) Designer 1's v13b previz has NO water stand-in (test 6 drew it as a tall chrome column); (2) the tap is now the photos' own: a short, low chrome spout on the back rim of her black bowl (photos 12 and 17), never a gooseneck, and the water runs from it onto the back of her head. KEEP adds "nothing tall rises behind her head" (CEO MA, from J). The drawer unit stays in frame (J: "it's a key feature of that location").
- Water (SRH13): a soft, slow-motion stream from that low spout onto the back of her head, running through her hair into the bowl; the words alone carry the water (SRH16).
- Hands (SRH14): one hand cradles the back of her head at the scalp, the other guides the water through her hair in long, slow strokes; v12's "small circles" is gone. The previz hands stay still at the scalp behind her ears (1 cm in 5 s): they mark where the hands are, and the words carry the motion.
- Look: cinematic, soft studio light, shallow depth of field, rooted and grounded.
- Printed words: only the poster line that the close-up shows ("Lush, replenished visibly healthy hair") is quoted. "AVEDA" and "EFFORTLESS" are no longer quoted, because in take 5 the quoted EFFORTLESS was printed onto the bottles (SRH11).
Kept from v12: sides named by fixed things in the photo (SRH8); an adult woman of normal proportions in words (SRH3); the stylist at the right of her head between the two basins, her face above the frame; black smock, chocolate-brown towel; the red and green bottle basket and the poster behind; the camera-only line; positive statements only.

SETTINGS (J's): Dreamina Video, Seedance 2.5 (full, not Draft), references mode (Omni reference, not first/last frame), 16:9, 480P, 5 s. Two images, no video. Guard plan: plan-v13n-still-5s.json (cap 75).

REFERENCES (upload the photo FIRST and the previz still SECOND, then call each from the @ picker; Dreamina labels uploads itself, so match by thumbnail, not by number):
- @loc_basins = resources/salon-photos/6-shampoo-basins-edit.png (J's pick, the real Salon OM). In the @ picker: the photo of the salon shampoo area (usually "Image 1").
- @move = option-2.2/film-prompts/renders/previz-v13n-mid.png (frame 60 of Designer 1's v13n previz, @ 98b122a: the grey set, the faceless figures, her body in a teal cape). In the @ picker: the grey previz picture (usually "Image 2").
- Chip pasting: scripts/paste_prompt_chips.py maps @move to the VIDEO reference only; with two images it needs @move = the second image reference (the grey previz still).

PROMPT (paste as is; replace each @ handle with the picker chip for that file):

One continuous 5-second shot, 16:9, cinematic, in the real Salon OM shampoo area shown in @loc_basins: a stylist gently rinses the hair of a woman who reclines in the backwash chair nearest the left wall, warm water flowing slowly into her hair.
Use @move ONLY for where the camera stands and how the frame is composed. The grey set and the figures in @move are NOT the room or the people: they only mark where everything is and which way the two women face; the teal shape only marks her body, which wears the black smock below.
Camera: a close view from the left-wall side at the woman's head height, framed as in @move, looking across her face in profile, a wide 30 mm view; it moves slowly from left to right by a short distance, the view staying on the part of the room @loc_basins shows, one smooth move with a soft start and a soft stop.

REFERENCES
@loc_basins is the room, exactly as photographed: the two black basins against the back wall, each with its short, low chrome spout on the back rim of the bowl, the dark brown leather backwash chairs, the dark grey cushions, the glass shelves and wire baskets of bottles, the colour Aveda poster, the small wood drawer unit and the cream wall, in the same places and the same warm light. Everything around the two women is this room.
@move gives only the camera position and framing, where the two women are and which way they face; how the room and the people look comes from @loc_basins and the words below.

LOOK
Cinematic and calm: soft, warm studio light from above and slightly behind, gentle highlights on the water and on her hair, shallow depth of field. Her face, her hair and the water are in crisp focus; the room behind falls into a soft, warm blur. A rooted, grounded, peaceful mood.

WHERE EVERYTHING IS (fixed for the whole clip)
The woman: an adult woman of normal proportions, lying face up along the backwash chair nearest the left wall. Her head rests on the rim of that chair's black basin at the back wall, her long blond hair falls back into the bowl, and her body runs from the basin out along the chair toward the room, her bare feet on the round ottoman at the end of that chair.
The stylist: an adult woman standing at the right of the woman's head, between the two black basins, leaning over her.
The water: comes from the short, low chrome spout on the back rim of her black bowl, a soft, clear stream that runs onto the back of her head and through her hair into the bowl, where clear water pools around her hair.
In frame: the woman's face in profile looking up, eyes closed, her head and blond hair in the black bowl centre-left; the low chrome spout on the bowl's back rim just left of her head, its soft stream running onto the back of her head; her neck and shoulder running to the right toward the camera; the stylist's black-clad body at the right, her arms reaching down to the woman's head, her hands at the scalp; the dark wood of the small drawer unit as a soft edge at the far left. Behind them, soft, as in @loc_basins: the red, pink and green bottles on the lower glass shelf, the plain cream wall under that shelf, and the dark colour Aveda poster with its printed line "Lush, replenished visibly healthy hair".

SHOT
0:00-0:05 Camera: the close view, framed as in @move, moves slowly from left to right, one continuous move. THE VERY FIRST FRAME, framed as in @move: the woman's face in profile, eyes closed, the clear water already running from the low chrome spout onto the back of her head and into the black bowl, the stylist's hands in her hair at the scalp. The water flows in slow motion, catching the warm light. One of the stylist's hands cradles the back of the woman's head; the other guides the water through her hair in long, slow strokes from the hairline back toward the ends. Halfway (2.5 s) the water runs through her hair from the back of her head and her hair drifts in the bowl. THE LAST FRAME (5 s): the same view a little further to the right, the water still flowing, the woman still at rest.
The woman: lies still and deeply relaxed the whole time, eyes closed, breathing slowly. She wears a black salon smock and a chocolate-brown towel around her neck and shoulders. Her bare feet rest on the left ottoman the whole time.
The stylist: dressed all in black, her face above the top of the frame. Her movements are slow, gentle and natural.

SOUND
Soft room tone and the gentle sound of water flowing into the basin, the only sound.

KEEP CONSISTENT
- The room is @loc_basins, unchanged, in the same places.
- The woman lies in the chair nearest the left wall, her head in that chair's basin at the back wall, her body running out toward the room, for the whole clip.
- The stylist stands at the right of the woman's head, between the two basins, for the whole clip.
- The water comes from the short, low chrome spout on the back rim of her basin and flows softly onto the back of her head, the whole clip.
- Nothing tall rises behind her head: the low spout sits on the bowl's back rim.
- Under the lower glass shelf is plain cream wall.
- The poster keeps its own printed line, "Lush, replenished visibly healthy hair"; the bottles keep their own plain labels.
- The stylist's face stays above the top of the frame; her hands, forearms and torso are in view.
- One continuous move from the first frame to the last.

WHAT CAME BACK
(fill in after the take; Test Lab EXP-salon-rooted-1, arm SR19)
