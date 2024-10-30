import Link from "next/link";
import { Heading } from "../Heading";
import { EnvelopeIcon } from "../icons/EnvelopeIcon";
import { GridPattern } from "../GridPattern";
import { ChatBubbleIcon } from "../icons/ChatBubbleIcon";
import { BellIcon } from "../icons/BellIcon";
import { DiscordIcon, LinkedInIcon } from "../Footer";


interface Contact {
    href: string;
    name: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    pattern: Omit<
    React.ComponentPropsWithoutRef<typeof GridPattern>,
        'width' | 'height' | 'x'
    >
};

const contacts: Array<Contact> = [
    {
        href: "mailto:hs@tihlde.org",
        name: "hs@tihlde.org",
        description: "Send oss en e-post, så svarer vi så fort vi kan.",
        icon: EnvelopeIcon,
        pattern: {
            y: 16,
            squares: [
              [0, 1],
              [1, 3],
            ],
          },
    },
    {
        href: "https://docs.google.com/forms/d/e/1FAIpQLScswku-d5-RDpMyKOnRuCEPgSovprPVvRX8oM7NL_wP9uhrIw/viewform",
        name: "Varslingsportal",
        description: "Send oss en anonym varsling om noe du mener vi bør vite.",
        icon: BellIcon,
        pattern: {
            y: 16,
            squares: [
              [0, 1],
              [1, 3],
            ],
        },
    },
    {
        href: "https://www.facebook.com/messages/t/tihlde",
        name: "Facebook Messenger",
        description: "Send oss en melding på Facebook Messenger.",
        icon: ChatBubbleIcon,
        pattern: {
            y: -6,
            squares: [
              [-1, 2],
              [1, 3],
            ],
        },
    },
    {
        href: "https://discord.com/invite/HNt5XQdyxy",
        name: "Discord",
        description: "Bli med i vår Discord-server og ta en prat med oss.",
        icon: DiscordIcon,
        pattern: {
            y: -6,
            squares: [
              [-1, 2],
              [1, 3],
            ],
        },
    },
    {
        href: "https://www.linkedin.com/company/tihlde/posts/",
        name: "LinkedIn",
        description: "Connect med oss på LinkedIn og følg med på hva vi gjør.",
        icon: LinkedInIcon,
        pattern: {
            y: -16,
            squares: [
              [-1, 2],
              [1, 3],
            ],
        },
    }
];


function ContactIcon({ icon: Icon }: { icon: Contact['icon'] }) {
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-sky-300/10 dark:group-hover:ring-sky-400">
          <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-sky-300/10 dark:group-hover:stroke-sky-400" />
        </div>
      )
};


function Contact({ contact }: { contact: Contact }) {
    return (
        <div
            className="relative rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5 border"
        >
            <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
                <GridPattern
                    width={72}
                    height={56}
                    x="50%"
                    className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
                    {...contact.pattern}
                />
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
            <div className="relative rounded-2xl px-4 pb-4 pt-16">
                <ContactIcon icon={contact.icon} />
                <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
                    <Link href={contact.href}>
                        <span className="absolute inset-0 rounded-2xl" />
                        {contact.name}
                    </Link>
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {contact.description}
                </p>
            </div>
        </div>
    );
}

export function Contacts() {
    return (
        <div className="my-16 xl:max-w-none">
            <Heading level={2} id="contacts">
                Kontakt oss digitalt
            </Heading>
            <div className="not-prose mt-2 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
                {contacts.map((contact) => (
                    <Contact key={contact.href} contact={contact} />
                ))}
            </div>
        </div>
    );
};