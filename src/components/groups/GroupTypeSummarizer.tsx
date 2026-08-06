import {GroupSummarizer} from "@/components/groups/GroupSummarizer";
import {getGroupsByType, Group} from "@/lib/group";


/**
 * Summarizes all groups of a given type excluding the description
 * 
 * @param type type of group, can be 'SUBGROUP', 'COMMITTEE', 'SPORTSTEAM', 'INTERESTGROUP'
 * @param subtype optional subtype filter
 * @constructor
 */
export async function GroupTypeSummarizer({ type, subtype }: { type: string; subtype?: string }) {
    const groups = await getGroupsByType(type, subtype);

    if (!groups.length) return null;

    return (
        <div className="grid grid-cols-1 gap-x-12 gap sm:grid-cols-1 lg:grid-cols-2">
            {groups.map((group: Group) => (
                <GroupSummarizer key={group.slug} group={group}/>
            ))}
        </div>
    );
}