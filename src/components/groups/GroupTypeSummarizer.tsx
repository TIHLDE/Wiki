import {GroupSummarizer} from "@/components/groups/GroupSummarizer";


/**
 * Summarizes all groups of a given type excluding the description
 * 
 * @param type type of group, can be 'SUBGROUP', 'COMMITTEE', 'INTERESTGROUP'
 * @constructor
 */
export async function GroupTypeSummarizer({ type }: { type: string }) {
    // Fetch the groups of the type
    const response = await fetch(`https://api.tihlde.org/groups/?type=${type}`);
    const groups: any = await response.json();
    
    if (!groups) return null;
    
    return (
        <div className="grid grid-cols-1 gap-x-12 gap sm:grid-cols-1 lg:grid-cols-2">
            {groups.map((group: any) => (
                <GroupSummarizer key={group.slug} group={group} className="w-full"/>
            ))}
        </div>
    );
}