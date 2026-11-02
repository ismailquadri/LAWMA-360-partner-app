export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · LAWMA 360 Partner` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · LAWMA 360 Partner` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
