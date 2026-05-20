import type { CategoryId } from "./types";

const UNSPLASH = (id: string, w = 1600, q = 75) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const IMAGES = {
  heroArena: UNSPLASH("1504450758481-7338eba7524a", 1800, 72),
  trophy: UNSPLASH("1518091043644-c1d4457512c6", 1200, 75),
  community: UNSPLASH("1612872087720-bb876e2e67d1", 1400, 75),
  basketballAction: UNSPLASH("1577471488278-16eec37ffcc2", 900, 75),
} as const;

/* ============================================================
 * ROSTER — real athletes working with FanLinc on the event.
 * Photos live in /public/players/. Names + chips below are
 * placeholders the event team can update before showtime.
 * ============================================================ */
export interface RosterPlayer {
  index: string;
  name: string;
  sport: string;
  team: string;
  photo: string;
}

export const ROSTER: RosterPlayer[] = [
  {
    index: "01",
    name: "Conor Walton",
    sport: "Hockey",
    team: "Windsor Spitfires · OHL",
    photo: "/players/player-01.jpg",
  },
  {
    index: "02",
    name: "Kieron Walton",
    sport: "Hockey",
    team: "Junior · #76",
    photo: "/players/player-02.jpg",
  },
  {
    index: "03",
    name: "Outfielder · #14",
    sport: "Baseball",
    team: "McCook · NCAA",
    photo: "/players/player-03.jpg",
  },
  {
    index: "04",
    name: "Weston Thompson",
    sport: "Baseball",
    team: "Niagara · Summer League",
    photo: "/players/player-04.jpg",
  },
];

export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  basketball: UNSPLASH("1577471488278-16eec37ffcc2", 900, 75),
  "ohl-hockey": UNSPLASH("1504450758481-7338eba7524a", 900, 75),
  baseball: UNSPLASH("1471295253337-3ceaaedca402", 900, 75),
  "fanlinc-mix": UNSPLASH("1612872087720-bb876e2e67d1", 900, 75),
};

export const CATEGORY_ACCENT: Record<CategoryId, string> = {
  basketball: "#ff5a1f",
  "ohl-hockey": "#6b8cff",
  baseball: "#ffcc33",
  "fanlinc-mix": "#00ff95",
};

/* ============================================================
 * SIDE GALLERY — natural colour. Ordered:
 *   1) Basketball  2) Baseball  3) Hockey/arena  4) Other sports
 * ============================================================ */
export const SIDE_GALLERY: string[] = [
  // — Basketball
  UNSPLASH("1546519638-68e109498ffc", 800, 78), // hoop + ball
  UNSPLASH("1577471488278-16eec37ffcc2", 800, 78), // dunk action
  UNSPLASH("1515523110800-9415d13b84a8", 800, 78), // through-the-hoop
  UNSPLASH("1542652694-40abf526446e", 800, 78), // basketball in shadow gym

  // — Baseball
  UNSPLASH("1471295253337-3ceaaedca402", 800, 78), // stadium aerial

  // — Hockey / arena venue
  UNSPLASH("1504450758481-7338eba7524a", 800, 78), // packed indoor arena
  UNSPLASH("1431324155629-1a6deb1dec8d", 800, 78), // night stadium under lights

  // — Other sports (soccer, tennis, cycling, swimming, training, athletics)
  UNSPLASH("1517466787929-bc90951d0974", 800, 78), // soccer kick player
  UNSPLASH("1574629810360-7efbbe195018", 800, 78), // soccer ball mid-kick
  UNSPLASH("1606925797300-0b35e9d1794e", 800, 78), // soccer tackle
  UNSPLASH("1622279457486-62dcc4a431d6", 800, 78), // tennis swing
  UNSPLASH("1517649763962-0c623066013b", 800, 78), // cycling peloton
  UNSPLASH("1530549387789-4c1017266635", 800, 78), // swimmer butterfly
  UNSPLASH("1599058917765-a780eda07a3e", 800, 78), // battle ropes (MMA energy)
  UNSPLASH("1556817411-31ae72fa3ea0", 800, 78), // deadlift
  UNSPLASH("1605296867424-35fc25c9212a", 800, 78), // pull-up back
  UNSPLASH("1574680096145-d05b474e2155", 800, 78), // barbell B&W
  UNSPLASH("1483721310020-03333e577078", 800, 78), // runner tying shoes
  UNSPLASH("1539794830467-1f1755804d13", 800, 78), // athlete stretch
  UNSPLASH("1612872087720-bb876e2e67d1", 800, 78), // volleyball silhouettes sunset
  UNSPLASH("1571902943202-507ec2618e8f", 800, 78), // gym interior
];

/* === Per-page priority pools ===
 * Each page biases toward a sport but mixes the others in.
 * The pickGallery() helper seeds the shuffle so order stays
 * stable across reloads while feeling unique per route.
 */

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// We want the FIRST stack on each page to lead with the sport hierarchy
// (basketball → baseball → hockey → other). For deeper stacks we shuffle
// the full pool seeded for variety.
export function pickGallery(seed: number, count = 6): string[] {
  return shuffleSeeded(SIDE_GALLERY, seed).slice(0, count);
}

// Lead stack — always opens with basketball/baseball/hockey before others
export function pickLeadGallery(seed: number, count = 6): string[] {
  const lead = SIDE_GALLERY.slice(0, 7); // bball + baseball + hockey
  const rest = SIDE_GALLERY.slice(7);
  const ordered = [...lead, ...shuffleSeeded(rest, seed)];
  return ordered.slice(0, count);
}
