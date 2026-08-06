import { getGroup, getGroupsByType, Group } from "@/lib/group";
import { OrgChartTree, type OrgChartData, type OrgNode } from "./OrgChartTree";

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
      getGroup("hs"),
      getGroup("forvaltningsgruppen"),
      getGroupsByType("SUBGROUP"),
      getGroupsByType("COMMITTEE"),
      getGroupsByType("SPORTSTEAM"),
      getGroupsByType("INTERESTGROUP"),
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

  // Photon only started carrying `subtype` in migration 0043, and the values
  // are backfilled separately. Until that has run every group sorts into
  // "UKJENT" and both sublevels come back empty — which would render the
  // Interessegrupper heading above nothing at all. Fall back to one flat
  // level so the groups stay on the chart either way.
  const interestGroupLevel =
    interestGroupSublevels.length > 0
      ? { name: "Interessegrupper", children: [], sublevels: interestGroupSublevels }
      : { name: "Interessegrupper", children: interestGroups.map(toNode) };

  const data: OrgChartData = {
    topRow: [
      hs ? toNode(hs) : { name: "Hovedstyret" },
      fondet ? toNode(fondet) : { name: "Forvaltningsgruppen" },
    ],
    levels: [
      { name: "Undergrupper", children: subgroups.map(toNode) },
      { name: "Komiteer", children: committees.map(toNode) },
      { name: "Idrettslag", children: sportsTeams.map(toNode), singleColumn: true },
      interestGroupLevel,
    ],
  };

  return <OrgChartTree data={data} />;
}
