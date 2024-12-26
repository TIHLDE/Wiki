import {GroupSummarizer} from "@/components/groups/GroupSummarizer";
import {Group} from "@/lib/group";


/**
 * Summarizes all groups of a given type excluding the description
 * 
 * @param type type of group, can be 'SUBGROUP', 'COMMITTEE', 'INTERESTGROUP'
 * @constructor
 */
export async function GroupTypeSummarizer({ type }: { type: string }) {
    // Fetch the groups of the type
    const response = await fetch(`https://api.tihlde.org/groups/?type=${type}`);
    const groups: Array<Group> = await response.json();
    
    if (!groups) return null;
    
    return (
        <div className="grid grid-cols-1 gap-x-12 gap sm:grid-cols-1 lg:grid-cols-2">
            {groups.map((group: Group) => (
                <GroupSummarizer key={group.slug} group={group}/>
            ))}
        </div>
    );
}