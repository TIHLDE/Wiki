"use client"

import {navigation} from "@/components/Navigation";
import React, {useRef, useState} from "react";
import {Button} from "@/components/Button";
import {Transition} from "@headlessui/react";
import clsx from "clsx";

export function TableOfContents() {

    const [selectedNavGroup, setSelectedNavGroup] = useState(navigation[0]);
    
    return (
        <React.Fragment>
            <div className="p-4 border-t rounded-3xl border-zinc-200 dark:border-zinc-700" >
                <div className="flex flex-row flex-wrap gap-3">
                    { navigation.map((navGroup) => (
                        <Button 
                            key={navGroup.title} 
                            variant="outline"
                            className={selectedNavGroup === navGroup 
                                ? "bg-zinc-300 text-zinc-900 dark:bg-white/5 dark:text-white" +
                                " border-zinc-900 dark:border-white" 
                                : ""}
                            onClick={() => setSelectedNavGroup(navGroup)}
                        >{navGroup.title}</Button>
                    ))}
                </div>
                <div className="m-3 grid grid-cols-1 grid-rows-1 overflow-hidden relative pl-5">
                    <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent pointer-events-none" />

                    { navigation.map((navGroup) => (
                        <React.Fragment key={navGroup.title}>
                            <Transition show={selectedNavGroup == navGroup} appear={true} >
                                <div className={clsx([
                                    'col-start-1 row-start-1',
                                    'data-[closed]:opacity-0',
                                    'data-[enter]:duration-100 data-[enter]:data-[closed]:-translate-x-full',
                                    'data-[leave]:duration-300 data-[leave]:data-[closed]:translate-x-full',
                                    ])}
                                >
                                    { navGroup.links.map((link) => (
                                        <a key={link.title}
                                            href={link.href}
                                        >
                                            {link.title}<br/>
                                        </a>
                                    ))}
                                </div>
                            </Transition>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </React.Fragment>
    )
}