/** Public URLs for vehicle menu previews and in-game sprites. */
export const VEHICLE_SPRITE_URLS: Record<string, string> = {
  volt_mini_gt: '/assets/sprites/vehicles/volt_mini_gt.png',
  sweep_x_buggy: '/assets/sprites/vehicles/sweep_x_buggy.png',
  charge_van: '/assets/sprites/vehicles/charge_van.png',
  photon_racer: '/assets/sprites/vehicles/photon_racer.png',
};

/** AI racers — drop Lovable cutouts here (fallback: tinted volt_mini_gt). */
export const AI_VEHICLE_SPRITE_URLS: Record<string, string> = {
  ai_balanced: '/assets/sprites/vehicles/ai_balanced.png',
  ai_agile: '/assets/sprites/vehicles/ai_agile.png',
  ai_speed: '/assets/sprites/vehicles/ai_speed.png',
};

/**
 * Extra prop sprites (fridge, island, …) — deferred.
 * Race look comes from Lovable TRACK_THUMB_URLS boards.
 */
export const BIOME_SPRITE_URLS: Record<string, string> = {
  kitchen_island: '/assets/sprites/biomes/kitchen_island.png',
  kitchen_fridge: '/assets/sprites/biomes/kitchen_fridge.png',
  roof_solar: '/assets/sprites/biomes/roof_solar.png',
  roof_ac: '/assets/sprites/biomes/roof_ac.png',
  garden_tree: '/assets/sprites/biomes/garden_tree.png',
  garden_lawn: '/assets/sprites/biomes/garden_lawn.png',
  garage_charger: '/assets/sprites/biomes/garage_charger.png',
  garage_bench: '/assets/sprites/biomes/garage_bench.png',
  security_camera: '/assets/sprites/biomes/security_camera.png',
  security_laser: '/assets/sprites/biomes/security_laser.png',
  warehouse_shelf: '/assets/sprites/biomes/warehouse_shelf.png',
  warehouse_pallet: '/assets/sprites/biomes/warehouse_pallet.png',
  living_tv: '/assets/sprites/biomes/living_tv.png',
  living_sofa: '/assets/sprites/biomes/living_sofa.png',
  balcony_planter: '/assets/sprites/biomes/balcony_planter.png',
  balcony_sensor: '/assets/sprites/biomes/balcony_sensor.png',
  desk_setup: '/assets/sprites/biomes/desk_setup.png',
  desk_lamp: '/assets/sprites/biomes/desk_lamp.png',
  city_towers: '/assets/sprites/biomes/city_towers.png',
  city_lamp: '/assets/sprites/biomes/city_lamp.png',
};

/** Build minigame part icons (9). */
export const PART_SPRITE_URLS: Record<string, string> = {
  wheels_slick: '/assets/sprites/parts/wheels_slick.png',
  wheels_knobby: '/assets/sprites/parts/wheels_knobby.png',
  wheels_rain: '/assets/sprites/parts/wheels_rain.png',
  body_aero: '/assets/sprites/parts/body_aero.png',
  body_compact: '/assets/sprites/parts/body_compact.png',
  body_tank: '/assets/sprites/parts/body_tank.png',
  engine_volt: '/assets/sprites/parts/engine_volt.png',
  engine_torque: '/assets/sprites/parts/engine_torque.png',
  engine_pulse: '/assets/sprites/parts/engine_pulse.png',
};

/** Power-up HUD / pickup icons (15). */
export const POWERUP_ICON_URLS: Record<string, string> = {
  turbo_cell: '/assets/sprites/ui/powerups/turbo_cell.png',
  overcharge_boost: '/assets/sprites/ui/powerups/overcharge_boost.png',
  side_dash: '/assets/sprites/ui/powerups/side_dash.png',
  smart_grip: '/assets/sprites/ui/powerups/smart_grip.png',
  emp_pulse: '/assets/sprites/ui/powerups/emp_pulse.png',
  nano_mine: '/assets/sprites/ui/powerups/nano_mine.png',
  drone_zap: '/assets/sprites/ui/powerups/drone_zap.png',
  paint_foam: '/assets/sprites/ui/powerups/paint_foam.png',
  shield_bubble: '/assets/sprites/ui/powerups/shield_bubble.png',
  auto_correct: '/assets/sprites/ui/powerups/auto_correct.png',
  jam_blocker: '/assets/sprites/ui/powerups/jam_blocker.png',
  camera_cloak: '/assets/sprites/ui/powerups/camera_cloak.png',
  gate_hack: '/assets/sprites/ui/powerups/gate_hack.png',
  charge_link: '/assets/sprites/ui/powerups/charge_link.png',
  magnet_pull: '/assets/sprites/ui/powerups/magnet_pull.png',
};

/** Menu track thumbnails — also used as full race boards (Lovable). */
export const TRACK_THUMB_URLS: Record<string, string> = {
  kitchen_8: '/assets/sprites/ui/tracks/kitchen_8.png',
  bathroom_8: '/assets/sprites/ui/tracks/bathroom_8.png',
  garden_8: '/assets/sprites/ui/tracks/garden_8.png',
  garage_8: '/assets/sprites/ui/tracks/garage_8.png',
  balcony_8: '/assets/sprites/ui/tracks/balcony_8.png',
  desk_8: '/assets/sprites/ui/tracks/desk_8.png',
};

export const UI_SPRITE_URLS = {
  logo: '/assets/sprites/ui/logo_smart_rush.png',
} as const;

/** Optional VFX overlays (priority C — engine Graphics until dropped). */
export const VFX_SPRITE_URLS: Record<string, string> = {
  boost_flame: '/assets/sprites/vfx/boost_flame.png',
  shield_ring: '/assets/sprites/vfx/shield_ring.png',
  emp_burst: '/assets/sprites/vfx/emp_burst.png',
  exhaust: '/assets/sprites/vfx/exhaust.png',
};

export const HAZARD_SPRITE_URLS: Record<string, string> = {
  robot_vacuum: '/assets/sprites/hazards/robot_vacuum.png',
  robot_mower: '/assets/sprites/hazards/robot_mower.png',
  drone: '/assets/sprites/hazards/drone.png',
  conveyor: '/assets/sprites/hazards/conveyor.png',
};

export const PICKUP_SPRITE_URLS: Record<string, string> = {
  powerup_crate: '/assets/sprites/pickups/powerup_crate.png',
  powerup_crate_glow: '/assets/sprites/pickups/powerup_crate_glow.png',
  token: '/assets/sprites/pickups/token.png',
  mine: '/assets/sprites/pickups/mine.png',
  boost_pad: '/assets/sprites/pickups/boost_pad.png',
  boost_pad_glow: '/assets/sprites/pickups/boost_pad_glow.png',
};
