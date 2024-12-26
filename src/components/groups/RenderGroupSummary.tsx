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

    useEffect(() => {
        if (descriptionRef.current) {
            setIsOverflowing(
                descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
            );
        }
    }, [description]);

    return (
        <div className="relative bg-zinc-100 dark:bg-zinc-800 rounded-3xl p-6 my-6 overflow-hidden shadow border border-transparent transition dark:hover:border-zinc-500">
            <div className="flex flex-row content-center gap-4">
                {group.image ? <img src={group.image} alt={group.name} className="size-9 rounded m-0" /> : <></>}
                <h1 className="m-0 p-0">{group.name}</h1>
            </div>

            { group.leader && <div className="mt-2">Leder: <b>{group.leader.first_name} {group.leader.last_name}</b></div> }
            <hr className="my-3" />

            { group.description &&
            ( <React.Fragment>
                <div className="h-64 overflow-hidden relative bg-zinc-200 dark:bg-zinc-900 shadow-inner px-4"
                    ref={descriptionRef} >
                    {description ?
                        <div dangerouslySetInnerHTML={{__html: description}} /> :
                        <div>Ingen beskrivelse</div>
                    }
                    {isOverflowing && (
                    <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-zinc-200 dark:from-zinc-900 to-transparent pointer-events-none" />
                    )}
                </div>
                <br/>
            </React.Fragment>
            )}
            
            <div className="flex flex-row content-center justify-between">
                <Button target="_blank" href={`https://tihlde.org/grupper/${group.slug}`}>Les mer</Button>
                <Button href={`mailto:${group.contact_email}`}>Kontakt {group.name}</Button>
            </div>
        </div>
    );
}