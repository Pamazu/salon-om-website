MINIMAX H3 (local, Mac Studio): Salon OM moment 01 "Rooted", TOP film (v13n-spout-h3, 5-SECOND TEST 11, 17 Nov 2026)

Why: J, 17 Nov 2026 08:21 Z (verbatim on task cc1fec01): "bro you don't use dreamina, use the mac studio local ai creative models. The ones storyforge is using, for video use minimax h3". Test Lab: EXP-salon-rooted-1, arm SR25 (MiniMax H3 Ref2VA local), compared with SR23 (test 10, Seedance 2.5 on Dreamina, renders/take-v13n-spout-5s-SR23.mp4).

What changed from v13n-water-noquote-spout (test 10, SR23):
- The model: MiniMax H3 Ref2VA, local on the Mac Studio, in place of Seedance 2.5 on Dreamina (J, above). Moving platform changes how references are named and how long the prompt can be, so this arm is not a one-change arm: it is the SR23 shot, in H3's form.
- References are named the way H3 reads them: <Picture 1> and <Video 1>, with no @ handles and no picker. The way <Video 1> is described is StoryForge's proven H3 wording for a grey 3D motion guide (h3mvr_coco, 5 Nov: "... comes from <Video 1>; her look comes only from <Picture 1> ... never the grey figure or the colours of <Video 1>").
- <Picture 1> is the room photo with only its readable brand words softened (resources/salon-photos/6-shampoo-basins-edit-notext.png, the test 11 reference, d84bed4). SR23's only fault was invented brand text on the bottles, and this photo is the fix made for it.
- <Video 1> is the same previz (Designer 1's v13n, 5 s), scaled to 512x288 so the prompt and both references stay under mlx-h3's 4096-token cap: h3/salon-om-rooted-previz-v13n-5s-512x288.mp4 (120 frames, 24 fps, 5.0 s, from renders/salon-om-rooted-previz-v13n-5s.mp4).
- The words are SR23's, cut from about 950 to 671 by merging its REFERENCES, LOOK, WHERE, SHOT and KEEP sections into one H3 brief, each fact said once. Prompt + <Picture 1> + <Video 1> = 2,027 tokens of mlx-h3's 4,096 (h3_tokens.py with mlx-h3's own tokenizer, 17 Nov 2026, Mac Studio). Every fact SR23 states is kept (the room, the two women, the low spout and the visible stream, the hands, the camera, the look, the sound), except the repeats.
- H3's line "DON'T ADD SUBTITLES" is added (StoryForge's H3 prompts, h3mvr_coco).
- Sound: H3 makes the sound in the same pass, so the sound line is kept.

SETTINGS: MiniMax H3 Ref2VA, local on the Mac Studio, run ONLY through StoryForge's H3 runner (S1 input check on the prompt and both references, S2 on every frame). 16:9, 864x480 (the same area as H3 local's 480x864), 124 frames = 5.17 s at 24 fps, ref_image_size match. Test render: mlx-h3, 12 steps, seed 42 (best-model-per-job row 44). Workflow: h3/rooted_h3_v13n_spout.api.json (built from StoryForge's h3mvr_coco.api.json with only the prompt, the size and the one picture changed). The video goes in as the batch job's reference video:
  h3_mlx_batch.py <S_result.json> rooted_h3_v13n_spout.api.json:H3MLX_rooted_sr25_s42@42+<dir>/salon-om-rooted-previz-v13n-5s-512x288.mp4 --serial
  with 6-shampoo-basins-edit-notext.png in ComfyUI's input folder.

Watch at S1 (before any render): <Picture 1> holds the salon's colour poster of a woman's face among green leaves. If the input check reads that printed face as a real, identifiable person, it refuses the job; the fix then is the photo with that face softened like its brand words, a reference edit, not a prompt change.

REFERENCES:
- <Picture 1> = resources/salon-photos/6-shampoo-basins-edit-notext.png
- <Video 1> = option-2.2/film-prompts/h3/salon-om-rooted-previz-v13n-5s-512x288.mp4

PROMPT (as is):

16:9 horizontal, photoreal, cinematic, one continuous 5-second shot, no cuts.
DON'T ADD SUBTITLES
<Picture 1> is the real Salon OM shampoo area: two black basins against the back wall, each with a short, low chrome spout on the back rim of the bowl, dark brown leather backwash chairs, glass shelves and wire baskets of slim bottles, a colour poster of a woman's face among green leaves, a small wood drawer unit and a cream wall, in warm light. The room is exactly <Picture 1>, everything in the same places.
<Video 1> is a plain grey 3D set with stand-in figures: the camera movement, where the two women are and which way they face come from <Video 1>; the room's look comes only from <Picture 1> and the women's look only from the words below, never the grey set, the figures or the colours of <Video 1>. The teal shape in <Video 1> only marks her body, which wears the black smock.
The woman: an adult woman of normal proportions lies face up in the backwash chair nearest the left wall, her head resting on the rim of that chair's black basin at the back wall, her long blond hair falling back into the bowl, her body running out along the chair toward the room, her bare feet on the round ottoman at its end. She wears a black salon smock and a chocolate-brown towel around her neck and shoulders. Her face is in profile looking up, eyes closed; she lies still, deeply relaxed, breathing slowly.
The stylist: an adult woman dressed all in black, standing at the right of the woman's head between the two basins, leaning over her. Her face stays above the top of the frame; her hands, forearms and torso are in view. Her movements are slow, gentle and natural.
The water: a bright, clearly visible stream of warm water, silvery where it catches the light, pours from the fixed low chrome spout on the back rim of her bowl onto the back of her head, runs through her hair into the bowl and pools there around her hair, plainly visible in every frame. The hand sprayer rests in its holder on the rim; the stylist's hands hold only her hair.
Look: cinematic and calm, soft warm studio light from above and slightly behind, the water a bright silver ribbon, gentle highlights on her hair, shallow depth of field: her face, her hair and the water in crisp focus, the room behind in a soft, warm blur, the bottles' small labels soft and out of focus. A rooted, grounded, peaceful mood.
0:00–0:05 Camera: a close view from the left-wall side at the woman's head height, a wide 30 mm view looking across her face in profile; a slow push-in that drifts very slightly to the left, as in <Video 1>, one smooth move with a soft start and a soft stop. Action: from the very first frame the stream already pours from the spout onto the back of her head, splashing softly into her hair; one of the stylist's hands cradles the back of her head, the other guides the water through her hair in long, slow strokes from the hairline back toward the ends; at 2.5 s her hair drifts in the bowl; in the last frame the view is a little closer and the water still flows.
In frame the whole time: her face and blond hair in the black bowl centre-left, the low spout just left of her head, her neck and shoulder running right toward the camera, the stylist's black-clad body at the right with her arms reaching down to the woman's head, the dark wood of the drawer unit a soft edge at the far left; behind them, soft: slim red, pink and green bottles on the lower glass shelf, the plain cream wall under that shelf and the poster. Nothing tall rises behind her head.
Sound: soft room tone and the gentle sound of water flowing into the basin, the only sound.

WHAT CAME BACK
(fill in after the take; Test Lab EXP-salon-rooted-1, arm SR25)
