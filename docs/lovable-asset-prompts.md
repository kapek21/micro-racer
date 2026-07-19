# Smart Rush (Micro Racer) — Lovable asset pack

Gra: top-down wyścig mikro-pojazdów po smart-home ósemkach (PixiJS).  
Wrzuć PNG do `public/assets/sprites/...` pod **dokładnymi nazwami** z listy.  
Manifest: `public/assets/art-manifest.json`.

---

## Zasady techniczne

1. **True alpha** — obiekt wycięty, bez sceny, bez ramki, bez podłoża, bez tekstu, bez watermarku.
2. **Bez baked shadow** — silnik rysuje własny cień.
3. **Jeden obiekt na plik**, wyśrodkowany, ~8–10% marginesu.
4. **Orientacja:**
   - pojazdy / AI: **top-down, nos w PRAWO** kadru;
   - hazards / pads: top-down;
   - biome props: lekko 3/4 z góry, stoi;
   - ikony części / power-upów: front / lekko 3/4;
   - track thumbs: top-down ósemka na tle biomu (tu tło OK).
5. **Styl:** stylizowany arcade + bogate materiały (nie flat cartoon, nie fotoreal).
6. **Paleta:** cyan `#20c8e8`, zielony `#40e878`, orange `#ffa030`, pink `#ff4080`, metal `#8899aa`, dark UI `#060a14`.

---

## JEDEN PROMPT — skopiuj całość do Lovable

```
Smart Rush / Micro Racer premium game asset pack. Stylized arcade hybrid (not flat cartoon, not photoreal), rich materials (gloss paint, rubber tires, brushed metal, soft plastic smart-home gadgets), clean readable silhouettes at small size. Neutral studio lighting. Every asset is a SEPARATE transparent PNG with true alpha: single subject centered, ~8–10% margin, NO scenery, NO ground plane, NO baked drop shadow under the whole canvas, NO frame, NO border, NO text, NO logo, NO watermark, NO checkerboard. Palette accents: cyan #20c8e8, green #40e878, orange #ffa030, pink #ff4080, metal #8899aa, dark #060a14.

Generate ALL of the following files with EXACT filenames and EXACT pixel sizes:

=== VEHICLES (top-down bird's-eye, NOSE pointing RIGHT toward the right edge of the frame) — 256×256 each ===
1) volt_mini_gt.png — Balanced micro GT sports car, cyan #20c8e8 body, dark windshield, four visible wheels at corners, compact smart-toy look.
2) sweep_x_buggy.png — Agile open buggy / drone buggy, green #40e878 body, high ground clearance, chunky knobby tires, visible roll bar.
3) charge_van.png — Heavy micro cargo van, orange #ffa030 body, boxy silhouette, thicker frame, nose right.
4) photon_racer.png — Speed racer, pink #ff4080 sleek body, low profile, pointed nose right, thin tires.
5) ai_balanced.png — Neutral AI racer, grey-blue #8899aa body, simple balanced coupe, nose right.
6) ai_agile.png — AI agile racer, muted green-grey, lighter buggy silhouette, nose right.
7) ai_speed.png — AI speed racer, muted magenta-grey, sleek pointed shape, nose right.

=== BIOME PROPS (slight high 3/4 view, standing upright, base near bottom) — 320×320 each ===
8) kitchen_island.png — Modern kitchen island counter with soft smart LED strip, warm wood + white.
9) kitchen_fridge.png — Tall smart fridge with cyan status LED, kitchen appliance.
10) roof_solar.png — Roof solar panel array tile, dark glass + metal frame, warm sun glint.
11) roof_ac.png — Rooftop AC unit, metal vents, compact HVAC box.
12) garden_tree.png — Small garden tree / bush prop, lush green, pot optional.
13) garden_lawn.png — Garden lawn patch with grass tufts and tiny path stones (still cutout, no full scene).
14) garage_charger.png — Wall EV charger pedestal with cyan #20c8e8 cable glow.
15) garage_bench.png — Garage workbench with tools, wood + metal.
16) balcony_planter.png — Balcony planter box with plants, wet rain droplets hint.
17) balcony_sensor.png — Weather / wind sensor pole with cyan LED.
18) desk_setup.png — Desk monitor + keyboard stack, tech clutter, warm desk wood.
19) desk_lamp.png — Desk lamp with soft warm light cone (glow on lamp only, no floor).

=== HAZARDS (top-down) ===
20) robot_vacuum.png — 192×192 — Round robot vacuum cleaner top-down, dark plastic, cyan status ring.
21) robot_mower.png — 192×192 — Compact robot lawn mower top-down, green accents.
22) drone.png — 192×192 — Quadcopter drone top-down, four rotors, cyan LEDs.
23) conveyor.png — 256×112 — Short conveyor belt segment top-down, horizontal, rollers visible.

=== PICKUPS / PADS (top-down) ===
24) powerup_crate.png — 144×144 — Small glowing smart crate / loot box, cyan edges.
25) powerup_crate_glow.png — 144×144 — Soft additive glow halo matching the crate (transparent center OK).
26) token.png — 128×128 — Collectible coin / energy token, metallic cyan-gold disc.
27) mine.png — 112×112 — Tiny nano mine puck, warning red LED.
28) boost_pad.png — 256×128 — Asphalt boost arrow pad, chevrons pointing RIGHT, cyan neon.
29) boost_pad_glow.png — 256×128 — Soft glow version of boost pad for overlay.

=== PART ICONS (front / slight 3/4 icon, for build UI) — 256×256 each ===
30) wheels_slick.png — Slick street racing tires pair icon, smooth black rubber.
31) wheels_knobby.png — Knobby off-road tires icon, dirt trail tread.
32) wheels_rain.png — Rain groove wet tires icon, water channel tread.
33) body_aero.png — Aero shell body chassis icon, pink #ff4080 speed silhouette.
34) body_compact.png — Compact cabin body icon, cyan #20c8e8 balanced shell.
35) body_tank.png — Tank frame heavy body icon, orange #ffa030 armored shell.
36) engine_volt.png — Volt Core electric engine brick, cyan sparks.
37) engine_torque.png — Torque Pump engine, chunky dirt-power look.
38) engine_pulse.png — Pulse Turbine engine, wet/metal blue glow.

=== POWER-UP ICONS (front icon, readable at 56px) — 112×112 each ===
39) turbo_cell.png — Turbo cell battery with flame/cyan boost.
40) overcharge_boost.png — Overcharged capacitor boost icon.
41) side_dash.png — Side dash chevron arrows.
42) smart_grip.png — Tire grip / traction magnet icon.
43) emp_pulse.png — EMP pulse ring shockwave.
44) nano_mine.png — Nano mine drop icon.
45) drone_zap.png — Drone zap bolt icon.
46) paint_foam.png — Paint foam splash icon.
47) shield_bubble.png — Shield bubble dome.
48) auto_correct.png — Steering auto-correct arrows.
49) jam_blocker.png — Signal jam blocker shield.
50) camera_cloak.png — Camera cloak / stealth eye.
51) gate_hack.png — Gate hack key / chip.
52) charge_link.png — Charge link cable plug.
53) magnet_pull.png — Magnet pull horseshoe.

=== UI ===
54) kitchen_8.png — 512×288 — Track thumbnail: figure-8 circuit on kitchen carpet vibe (background allowed), top-down, no UI text.
55) solar_8.png — 512×288 — Figure-8 on solar roof metal panels.
56) garden_8.png — 512×288 — Figure-8 on garden dirt path.
57) garage_8.png — 512×288 — Figure-8 on garage asphalt.
58) balcony_8.png — 512×288 — Figure-8 on wet balcony tiles / wind.
59) desk_8.png — 512×288 — Figure-8 on desk gravel / clutter path.
60) logo_smart_rush.png — 1024×512 — Game logo mark "SMART RUSH" stylized wordmark with micro-car silhouette, transparent bg, cyan/white, premium arcade title (text allowed ONLY in this logo file).

Output each as its own PNG with the exact filename above. Keep vehicles' noses strictly pointing RIGHT.
```

---

## Drop paths (po wygenerowaniu)

| Plik(i) | Katalog |
|---------|---------|
| `volt_mini_gt.png` … `ai_speed.png` | `public/assets/sprites/vehicles/` |
| biome props | `public/assets/sprites/biomes/` |
| hazards | `public/assets/sprites/hazards/` |
| pickups / pads | `public/assets/sprites/pickups/` |
| parts | `public/assets/sprites/parts/` |
| power-up icons | `public/assets/sprites/ui/powerups/` |
| track thumbs | `public/assets/sprites/ui/tracks/` |
| `logo_smart_rush.png` | `public/assets/sprites/ui/` |

---

## Poza jednym promptem (Później / priorytet C)

Nie wymagane do v1 — osobna generacja gdy będzie potrzeba:

| Plik | Size | Opis |
|------|------|------|
| `biomes/security_camera.png` | 320×320 | Kamera ochrony |
| `biomes/security_laser.png` | 320×320 | Laser gate prop |
| `biomes/warehouse_shelf.png` | 320×320 | Regał magazynowy |
| `biomes/warehouse_pallet.png` | 320×320 | Paleta |
| `biomes/living_tv.png` | 320×320 | TV salon |
| `biomes/living_sofa.png` | 320×320 | Sofa |
| `biomes/city_towers.png` | 320×320 | Mini wieżowce |
| `biomes/city_lamp.png` | 320×320 | Latarnia |
| `ui/cosmetics/skin_*.png` (4) | 256×256 | Skiny sklep |
| `ui/cosmetics/trail_*.png` (2) | 256×256 | Traile |
| `ui/cosmetics/banner_*.png` (2) | 256×256 | Bannery |
| `vfx/boost_flame.png` | 128×128 | Płomień boost |
| `vfx/shield_ring.png` | 128×128 | Pierścień tarczy |
| `vfx/emp_burst.png` | 128×128 | EMP burst |
| `vfx/exhaust.png` | 64×64 | Spaliny |
