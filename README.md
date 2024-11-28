# TIHLDE WIKI

TIHLDE WIKI is a site built upon a [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

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
