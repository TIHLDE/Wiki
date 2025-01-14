# TIHLDE WIKI

Denne dokumentasjonen inndeholder 2 deler:
1. Norsk beskrivelse av git-prosedyrer som commits, branches, issues etc. som må følges for å holde repositoriet organisert.
2. En engelsk generalisert quickstart guide for hvordan man faktisk kan begynne å endre på wikien.

## Git prosedyrer

Til den grad hensiktsmessig skal alt foregå på norsk. Dette er for å forbedre leseligheten av repositoriet for brukere som ønsker å utforske diverse endringer. Det er svært verdifullt å skille mellom når vedtekter, retningslinjer og diverse inforamsjon endres på wikien. Ikke-tekniske brukere vil også slite med å forstå endringen om de må begynne å tolke engelske beskrivelser opp mot norsk brødtekst.

### Branches
Brancher kan være 1 av 4 kategorier og må være etterfulgt med en beskrivelse av hva branchen endrer eller legger til:

**kode/**\
Alt som omhandler å primært endre noe av programmatisk betydning(eks. styling, komponenter, logikk, biblioteker etc.). I **kode**-brancher bør man minimere endringer av den faktiske brødteksten i wikien.
```
git branch kode/informasjonskort-for-undergrupper
```

**diverse/**\
Endring av all tekst og informasjon i wikien som *ikke* direkte omhandler vedtekter eller retningslinjer. Slike brancher kan også inkludere endring av sidestruktur og tillegg av mindre tekniske implementeringer som bilder og iframes. Endringene i slike brancher kan utføres vilkårlig av HS medlemmer.
```
git branch diverse/sanger-lambo
```

**retningslinjer/**\
Endring av all tekst og informasjon som direkte relaterer til "Retningslinjer" siden på wikien. Endringer i slike brancher *må* ha blitt vedtatt av HS og branchen må ha en underkategori som inndeholder saksnummer og årstall i formatet `saksnr-yy`. Ble en retningslinje vedtatt endret utenfor et HS møte eller som en eventuellsak, viser man dette med symbolet 'symbolet 'd' og datoen for vedtaket i formatet `'d'-dd-mm-yy`.
```
git branch retningslinjer/6-24/betalende-arrangementer

git branch retningslinjer/d-02-03-24/grafiske-retningslinjer
```

**vedtekter/**\
Endring av all tekst og informasjon som direkte relaterer til "Vedtekter" siden på wikien. Endringer i slike brancher *må* ha blitt vedtatt av Generalforsamlingen eller være en redaksjonell endring vedtatt av HS. Ved saksbaserte endringer av generalforsamlingen skal formatet være følgende `generalforsamling/saksnr-yy`. Ved redaksjonelle endringer skal det samme formatet som utnyttes ved retningslinjer brukes: `redaksjonell/saksnr-yy` eller `redaksjonell/'d'-dd-mm-yy`.
```
git branch vedtekter/generalforsamling/8-24/inaktive-medlemmer

git branch vedtekter/redaksjonell/18-24/oppdatering-av-studienavn

git branch vedtekter/redaksjonell/d-05-09-24/rettelse-skrivefeil
```

## Getting started
TIHLDE WIKI is a site built upon a [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).


To get started with this template, first install the npm dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Writing documentation
All the text from the site is written in markdown files. This is a simple way to write text and it is easy to learn. This is the same way that the old wiki was written (also events and news on the main TIHLDE site).

The project is structured with folders which represents the url path of the site. You set the url path by creating a folder with your desired name in the following directory:

```bash
src/app/<your-folder>

# Example
src/app/kontakt -> http://localhost:3000/kontakt
```

### page.mdx

Each folder contains one and only one `page.mdx` file. This file is the main content of the page. The content of this file will be displayed on the page. This is a markdown file, so you can write markdown in this file. The 'x' in `mdx` stands for TSX, which means that you can write TSX in this file as well. For normal use cases, you will only need to write markdown, but if you want some more fancy components you can import React components (TSX).

### Setting up a new page

To create a new page, create a new folder in the `src/app` directory. Inside this folder, create a `page.mdx` file as explained above. This file will contain the content of the page.

At last we must add the new page to the navigation. This is done in the `src/components/Navigation.tsx` file. Here you can add a new object to the `navigation` array at the end of the page. The object should contain the following properties:

```typescript
{
    title: 'Kontakt oss',
    href: '/kontakt',
    // This is optional if you want to add a dropdown menu
    links: []
}
```

### Metadata

Each `page.mdx` file contains a metadata object at the top of the file. This object contains information about the page, such as the title and description. This information is used to generate the page's metadata, such as the title tag and meta description tag. Metadata is used to improve SEO and accessibility.

```typescript
export const metadata = {
    title: 'Kontakt oss',
    description:
        'Har du spørsmål eller trenger hjelp? Kontakt oss her.'
};
```

## Publish changes

To make changes to the site, you must first create a pull request. When the pull request is approved, the changes will be deployed to the live site.

```bash
# Create a new branch
git checkout -b <branch-name>

# Make your changes

# Add and commit your changes
git add .
git commit -m "Your commit message"

# Push your changes to GitHub
# After the first time, you can use `git push` without the origin and branch name
git push origin <branch-name>

# Create a pull request on GitHub

# After the pull request is approved, you can merge the changes into the main branch, which will deploy the changes to the live site
```

## Something wrong, or want to improve the site?

If you find something wrong with the site, or if you want to improve the site, you can create an issue on GitHub. You can also create a pull request with your changes, and this will be approved if the changes are good.

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Markdown](https://www.markdownguide.org/getting-started/) - a guide to Markdown
- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [Framer Motion](https://www.framer.com/docs/) - the official Framer Motion documentation
- [MDX](https://mdxjs.com/) - the official MDX documentation
- [Algolia Autocomplete](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/) - the official Algolia Autocomplete documentation
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - the official FlexSearch documentation
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) - the official Zustand documentation
