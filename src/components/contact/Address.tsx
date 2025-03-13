import { Button } from "../Button";
import { Heading } from "../Heading";


export function Address() {
    return (
        <div className="w-full my-16">
            <Heading level={2} id="address">
                Vår adresse
            </Heading>
            <div
                className="not-prose mt-2 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 dark:border-white/5"
            >
                <div className="relative space-y-4 rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5 border px-6 py-4">
                    <h1 className="text-lg">
                        A-blokka, Realfagbygget
                    </h1>
                    <div>
                        <p>
                            Høgskoleringen 5
                        </p>
                        <p>
                            NTNU Gløshaugen
                        </p>
                    </div>
                    <Button
                        className="absolute bottom-4 right-2"
                        href="http://bit.ly/2Rf5AR5"
                        arrow="right"
                    >
                        Finn veien
                    </Button>
                </div>

                <div className="relative space-y-4 rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5 border px-6 py-4">
                    <h1 className="text-lg">
                        Post- og faktureringsadresse
                    </h1>
                    <div>
                        <p>
                            TIHLDE
                        </p>
                        <p>
                            3. etasje, Holtermannsveien 2
                        </p>
                        <p>
                            7030 Trondheim
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}