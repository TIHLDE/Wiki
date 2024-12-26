"use client";

import {Button} from "@/components/mdx";
import React from "react";
import {useEffect, useRef, useState} from "react";
import {Group} from "@/lib/group";

/**
 * Renders a summary of a group
 *
 * @param group the group to summarize
 * @param description rendered description as string
 * @constructor
 */
export function RenderGroupSummary({ group, description }: { group: Group, description?: string }) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    // insert after first '>' in description
    // WARNING: Very hacking solution as were modfying the very html and not using
    // proper scripting to remove the first tag
    const trimmedDescription = description?.slice(0, description.indexOf(">")) 
        + ' class="mt-3" '
        + description?.slice(description.indexOf(">"));
    
    // Check if the description is overflowing and set a shadow if it is the case
    useEffect(() => {
        const checkOverflow = () => {
            if (descriptionRef.current) {
                setIsOverflowing(
                    descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
                );
            }
        };
    
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
    
        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, [description]);
    
    return (
        <div className="h-96 relative flex flex-col p-6 my-6 overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-3xl shadow hover:shadow-lg border border-transparent transition dark:hover:border-zinc-500">
            <div className="flex flex-row items-center gap-4">
                {group.image ? <img src={group.image} alt={group.name} className="size-14 rounded m-0" /> : <></>}
                
                <div className="flex flex-col">
                    <h1 className="m-0 p-0">{group.name}</h1>
                    { group.leader && <div className="m-0">Leder: <b>{group.leader.first_name} {group.leader.last_name}</b></div> }
                </div>
            </div>
            
            <hr className="mt-3 mb-0" />
            
            <div
                className="grow overflow-hidden relative"
                ref={descriptionRef}>
                {description ?
                    <div dangerouslySetInnerHTML={{__html: trimmedDescription}} className={"*:first-o:bg-amber-400"} /> :
                    <p className="mt-3">Ingen beskrivelse</p>
                }
                {isOverflowing && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-zinc-100 dark:from-zinc-800 to-transparent pointer-events-none"/>
                )}
            </div>
            
            <hr className="mt-0 mb-3"/>
            
            <div className="flex flex-row content-center justify-between">
                <Button target="_blank" href={`https://tihlde.org/grupper/${group.slug}`}>Les mer</Button>
                <Button href={`mailto:${group.contact_email}`}>Kontakt gruppen</Button>
            </div>
        </div>
    );
}