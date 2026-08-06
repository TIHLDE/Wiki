const API = process.env.PHOTON_API ?? "https://photon.tihlde.org/api";

/**
 * Group data is read straight from Photon, the site's own backend. Values
 * change on the order of once a semester, so a five minute window keeps the
 * wiki current without a request per group per visitor — the previous
 * `no-store` meant every page view refetched every group.
 */
const REVALIDATE = { next: { revalidate: 300 } } as const;

export type Group = {
    name: string;
    slug: string;
    subtype?: string | null;
    image?: string;
    contact_email?: string;
    description?: string;
    /**
     * Photon returns a single display name rather than first/last. Splitting
     * it back apart guesses wrong on anyone with two given names or a
     * multi-part surname, so the whole name is carried as one field.
     */
    leader?: { name: string };
};

type PhotonGroup = {
    name: string;
    slug: string;
    type: string;
    subtype: string | null;
    description: string | null;
    contactEmail: string | null;
    imageUrl: string | null;
    logoUrl: string | null;
};

type PhotonMember = {
    role: string;
    user: { name: string } | null;
};

/**
 * The leader lives on the membership list, not on the group itself, so it
 * costs an extra request per group. Failures are swallowed: a missing leader
 * hides one line, while throwing would take down the whole page.
 */
async function fetchLeader(slug: string): Promise<Group["leader"]> {
  try {
    const res = await fetch(
      `${API}/groups/${encodeURIComponent(slug)}/members`,
      REVALIDATE,
    );
    if (!res.ok) return undefined;

    const members = (await res.json()) as PhotonMember[];
    const leader = members.find((m) => m.role === "leader");
    return leader?.user?.name ? { name: leader.user.name } : undefined;
  } catch {
    return undefined;
  }
}

function toGroup(g: PhotonGroup, leader?: Group["leader"]): Group {
  return {
    name: g.name,
    slug: g.slug,
    subtype: g.subtype,
    // `logoUrl` is the square mark the old Lepton `image` field held; the
    // separate `imageUrl` is a wide banner and would break the avatar layout.
    image: g.logoUrl ?? undefined,
    contact_email: g.contactEmail ?? undefined,
    description: g.description ?? undefined,
    leader,
  };
}

export async function getGroup(slug: string): Promise<Group | null> {
  const res = await fetch(
    `${API}/groups/${encodeURIComponent(slug)}`,
    REVALIDATE,
  );
  if (!res.ok) return null;

  const group = (await res.json()) as PhotonGroup;
  return toGroup(group, await fetchLeader(slug));
}

/**
 * Which of the two interest-group categories a group belongs to.
 *
 * "Grupper" is the catch-all, straight from the definition further down the
 * struktur page: a group that cannot be defined as an idrettsgruppe or an
 * idrettslag is a gruppe. So a missing subtype is not an unknown third
 * category — it is a gruppe, and treating it as unknown drops the group off
 * the page entirely.
 */
export function interestSubtype(group: Pick<Group, "subtype">): string {
  return group.subtype === "IDRETTSGRUPPE" ? "IDRETTSGRUPPE" : "GRUPPE";
}

/**
 * Groups of one type, newest API shape mapped to the one the components use.
 *
 * `subtype` narrows the result here rather than in the query string: Photon's
 * list endpoint filters on type only. Leaders are fetched concurrently so the
 * page waits for the slowest one, not the sum of them.
 */
export async function getGroupsByType(
  type: string,
  subtype?: string,
): Promise<Group[]> {
  const res = await fetch(
    `${API}/groups?type=${encodeURIComponent(type)}`,
    REVALIDATE,
  );
  if (!res.ok) return [];

  const all = (await res.json()) as PhotonGroup[];
  const groups = subtype
    ? all.filter((g) => interestSubtype(g) === subtype)
    : all;

  return Promise.all(
    groups.map(async (g) => toGroup(g, await fetchLeader(g.slug))),
  );
}
