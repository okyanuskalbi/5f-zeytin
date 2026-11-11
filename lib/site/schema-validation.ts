/** Local project contract, not a claim of search-engine rich-result eligibility. */
type Node = Record<string, unknown>;
const object = (value: unknown): value is Node => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const url = (value: unknown) => {
  if (!text(value)) return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
};
const date = (value: unknown) => text(value) && /^\d{4}-\d{2}-\d{2}(?:T.+)?$/.test(value) && !Number.isNaN(Date.parse(value));

export function validateJsonLd(source: string): string[] {
  let parsed: unknown;
  try { parsed = JSON.parse(source); } catch { return ["Invalid JSON"]; }
  const errors: string[] = [];
  function require(ok: unknown, location: string, field: string) { if (!ok) errors.push(`${location}: invalid or missing ${field}`); }
  function walk(value: unknown, location: string) {
    if (Array.isArray(value)) { value.forEach((item, index) => walk(item, `${location}[${index}]`)); return; }
    if (!object(value)) return;
    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    if (types.some(type => ["Product", "Offer", "AggregateOffer"].includes(String(type)))) errors.push(`${location}: commercial schema is prohibited`);
    Object.entries(value).forEach(([key, child]) => { if (object(child) || Array.isArray(child)) walk(child, `${location}.${key}`); });
  }
  walk(parsed, "$ ");
  const roots = Array.isArray(parsed) ? parsed : [parsed];
  for (const [rootIndex, root] of roots.entries()) {
    const location = `$[${rootIndex}]`;
    if (!object(root)) { errors.push(`${location}: expected an object`); continue; }
    require(root["@context"] === "https://schema.org", location, "@context");
    const nodes = Array.isArray(root["@graph"]) ? root["@graph"] : [root];
    require(nodes.length > 0, location, "graph nodes");
    for (const [index, value] of nodes.entries()) {
      const at = `${location}.${index}`;
      if (!object(value)) { errors.push(`${at}: expected a node`); continue; }
      const type = value["@type"];
      require(text(type), at, "@type");
      if (["Organization", "Place", "WebSite", "WebPage"].includes(String(type))) {
        require(text(value.name), at, "name"); require(url(value.url), at, "url");
        if (type === "Organization" && value.logo !== undefined) require(url(value.logo), at, "logo");
        if (type === "WebSite") require(object(value.publisher), at, "publisher");
        if (type === "Place") require(object(value.address) && text(value.address.addressLocality), at, "address");
      } else if (type === "BreadcrumbList") {
        const items = value.itemListElement;
        require(Array.isArray(items) && items.length >= 2, at, "itemListElement");
        if (Array.isArray(items)) items.forEach((item, i) => require(object(item) && item["@type"] === "ListItem" && item.position === i + 1 && text(item.name) && url(item.item), at, `itemListElement[${i}]`));
      } else if (type === "BlogPosting") {
        require(text(value.headline), at, "headline"); require(text(value.description), at, "description");
        require(date(value.datePublished), at, "datePublished"); require(date(value.dateModified), at, "dateModified");
        require(object(value.author) && ["Person", "Organization"].includes(String(value.author["@type"])) && text(value.author.name) && url(value.author.url), at, "author");
        require(object(value.publisher) && text(value.publisher.name), at, "publisher");
        require(url(value.image), at, "image"); require(url(value.mainEntityOfPage), at, "mainEntityOfPage");
      } else if (type === "FAQPage") {
        require(Array.isArray(value.mainEntity) && value.mainEntity.length > 0, at, "mainEntity");
        if (Array.isArray(value.mainEntity)) value.mainEntity.forEach((item, i) => require(object(item) && item["@type"] === "Question" && text(item.name) && object(item.acceptedAnswer) && item.acceptedAnswer["@type"] === "Answer" && text(item.acceptedAnswer.text), at, `mainEntity[${i}]`));
      } else errors.push(`${at}: unsupported schema type ${String(type)}`);
    }
  }
  if (!roots.length) errors.push("Empty schema array");
  return errors;
}

export function validateHtmlJsonLd(html: string): { count: number; errors: string[] } {
  const blocks = [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)];
  return { count: blocks.length, errors: blocks.flatMap((block, index) => validateJsonLd(block[1]).map(error => `script ${index + 1}: ${error}`)) };
}
