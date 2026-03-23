import { Group } from "@/lib/group";
import { OrgChartTree, type OrgChartData, type OrgNode } from "./OrgChartTree";

async function fetchGroup(slug: string): Promise<Group | null> {
  const res = await fetch(`https://api.tihlde.org/groups/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchGroupsByType(type: string): Promise<Group[]> {
  const res = await fetch(`https://api.tihlde.org/groups/?type=${type}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

function toNode(group: Group): OrgNode {
  return { name: group.name, slug: group.slug, image: group.image };
}

const INTEREST_GROUP_SUBTYPE_LABELS: Record<string, string> = {
  GRUPPE: "Gruppe",
  IDRETTSGRUPPE: "Idrettsgruppe",
};

export async function OrgChart() {
  const [hs, fondet, subgroups, committees, sportsTeams, interestGroups] = await Promise.all(
    [
      fetchGroup("hs"),
      fetchGroup("forvaltningsgruppen"),
      fetchGroupsByType("SUBGROUP"),
      fetchGroupsByType("COMMITTEE"),
      fetchGroupsByType("SPORTSTEAM"),
      fetchGroupsByType("INTERESTGROUP"),
    ],
  );

  const interestGroupsBySubtype = interestGroups.reduce<Record<string, Group[]>>((acc, group) => {
    const subtype = group.subtype ?? "UKJENT";
    if (!acc[subtype]) {
      acc[subtype] = [];
    }
    acc[subtype].push(group);
    return acc;
  }, {});

  const interestGroupSublevels = ["GRUPPE", "IDRETTSGRUPPE"]
    .map((subtype) => {
      const groups = interestGroupsBySubtype[subtype] ?? [];
      if (groups.length === 0) return null;
      return {
        name: INTEREST_GROUP_SUBTYPE_LABELS[subtype],
        children: groups.map(toNode),
        twoColumns: true,
      };
    })
    .filter((level): level is NonNullable<typeof level> => level !== null);

  const data: OrgChartData = {
    topRow: [
      hs ? toNode(hs) : { name: "Hovedstyret" },
      fondet ? toNode(fondet) : { name: "Forvaltningsgruppen" },
    ],
    levels: [
      { name: "Undergrupper", children: subgroups.map(toNode) },
      { name: "Komiteer", children: committees.map(toNode) },
      { name: "Idrettslag", children: sportsTeams.map(toNode), singleColumn: true },
      { name: "Interessegrupper", children: [], sublevels: interestGroupSublevels },
    ],
  };

  return <OrgChartTree data={data} />;
}
