import {RenderGroupSummary} from "@/components/groups/RenderGroupSummary";
import {remark} from "remark";
import html from "remark-html";

type Group = {
    name: string; // Name
    slug: string; // Slug
    image?: string; // Image
    contact_email?: string; // Contact email
    leader?: any; // Leader
    description?: string; // Description
};

/**
 * Takes either a json object of all the group information or the slug of a group and returns a
 * summary of the group.
 *
 * @param group the group to summarize
 * @param slug the slug of the group to summarize
 * @constructor
 */
export async function GroupSummarizer({ group, slug }: | { group: Group, slug?: undefined } | { group?: undefined, slug: string }) {
    let groupData: Group | undefined = group
    
    // Fetch the group data if only the slug is provided
    if (slug && !group) {
        const response = await fetch(`https://api.tihlde.org/groups/${slug}/`);
        if (!response.ok) groupData = { name: "Ikke funnet", slug: slug };
        else groupData = await response.json();
    }
    
    if (!groupData) return null;
    
    const renderedDescription = (await remark().use(html).process(groupData.description)).toString();
    return <RenderGroupSummary group={groupData} description={renderedDescription} />
}