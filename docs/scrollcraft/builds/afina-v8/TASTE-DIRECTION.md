# Task 160 — AFİNA taste draw and client fit

Source: project-local design-taste-frontend 2.1.5, upstream pin 12af471f627f866411b4bd785b19646d3672784c.
Draw seed: 1601101. Direction: page-is-the-object. Direction redraws: 0. Content-driven section-slot replacements: 2.
State: project cache only. No browser, CDP helper, media generation or runtime edit.

## Inventory from current PRODUCT.md and docs/DESIGN.md

1. Official brand: AFİNA ZEYTİN; original logo preserved.
2. Official slogan: “Kökü toprakta. Yeri sofrada.”
3. Location: Ellek / Düziçi / Osmaniye.
4. Existing factory photograph has an approved blurred licence plate.
5. The business is an AFİNA Şirketler Topluluğu brand.
6. Four real product families, six existing packaging variants.
7. Packaging: green/white body, botanical details, white logo oval and gold product ribbon.
8. Existing approved product packshots/scenes are representative media, not documentary photographs.
9. One approved grove-to-branch Flow clip and poster exist; other requested clips are not treated as produced.
10. Fraunces/Figtree, olive/paper/champagne tokens are existing brand choices.
11. Corporate production/provenance emphasis is 65 percent; retail commerce remains 35 percent.
12. No approved testimonials, press endorsements, certificates or production-capacity figures exist.

## Three dealt directions

- page-is-the-object: strongest link to an existing AFİNA-specific physical artefact, the approved packaging label.
- split-stage: readable but returns to the half-screen visual language the user rejected.
- specimen-catalogue: fits the real packshots but gives retail catalogue geometry priority over the 65/35 producer brief.

## Selected idea

On this page, AFİNA’s actual packaging label becomes the bridge between the grove and the table.

The nearest-competitor test depends on the real AFİNA packshot, its actual label geometry, original slogan and Ellek factory proof. Generic olive branches or a generic tin would not pass.

One live thing: choose an existing packaging size in the real product-detail flow, then add the actual variant to the existing cart. Preserve server price/stock authority and every existing route.

## Honest ordered argument

1. hero: AFİNA makes olives and olive oil in Osmaniye → official slogan, existing film/poster and one approved real branded packshot.
2. intro: this is an Ellek producer serving homes and businesses → sourced region, business identity and existing retail/wholesale routes.
3. proof: there is a real production address → the one approved factory photograph and sourced location; no customer-logo strip or fabricated guest list.
4. showcase: the same producer offers the existing four families/six packaging variants → approved packshots, current product names/sizes and functional product details.
5. how-it-works: provenance connects land, facility and presentation → three short sourced stages; do not claim documentary harvest/production footage exists.
6. cta: businesses can describe product, quantity and packaging needs → existing corporate enquiry UI and its honest configured/unconfigured state.
7. faq: answer the five existing sourced questions → preserve current answer facts and keyboard behaviour.
8. contact/footer: make the real place and support paths easy to find → sourced address/map and existing order/help/account links. Show phone/email only when configured.

## Concrete composition for parent integration

- Keep the full-width accepted grove film; preserve actual poster, one-pass playback, pause/replay and reduced-motion/saveData fallbacks.
- Use the original slogan in one face/colour over two authored lines. State “Osmaniye’den zeytin ve zeytinyağı” in the support sentence; original official wording can remain in the appropriate supporting brand copy.
- Let the real approved packshot carry the “table” end of the idea. Reveal it with transform/opacity in natural scroll at the film-to-paper handover. It is the product itself, not a newly invented card, altered label or fake print ornament.
- Reuse the label’s existing olive/paper colour logic, strong plain shapes and actual logo in the rest of the page. Do not reproduce illegible label small print as site copy.
- Move the real factory proof ahead of the retail catalogue. Keep one olive B2B field; other major surfaces stay paper and imagery. Adjacent sections should have different geometry.
- Mobile: one focal product at a time; no six-object mosaic over the film. Keep both real DOM actions, at least 44px controls, natural vertical reading and full product access.

## Exact content-driven replacements and source evidence

The three-direction draw is preserved in options.md. The official final generated sheet is direction.json and direction-sheet.md. Both keep the chosen direction, brand type and brand palette. No direction/tone redraw occurred; the project-local history contains one direction entry.

1. Proof: proof-printed-guest-list → intro-heading-captions-panorama, borrowed from intro through the supported command below. The six proof-specific alternatives all require names, press, awards or marks that AFİNA has not supplied. A single actual factory photograph is the proof, so the panorama geometry is the honest content fit. Use “Üretim yerimiz Ellek”, sourced locality and one photograph; do not invent opening date, capacity or customer names. Keep the plate blurred, let photo/text height follow actual content on short screens, and do not reduce caption size below 13px.
2. Showcase: showcase-output-slips-along-the-edge → features-specimens-on-colour-tiles, borrowed from features through the supported command below. AFİNA sells six existing packaging variants, not six pieces of printed text. This blueprint explicitly accommodates five or six real objects, names/facts outside the images and a two-column mobile composition. Populate the fact with the actual packaging size; do not invent dates, ratings, inventory or prices. Preserve approved image canvas and label geometry; multiply blending is optional and must not alter white packaging or brand colour. Keep the product-detail/cart semantics.
3. Hero: invitation-card-cropped → source-library selection view-with-two-cards-in-the-corner. This is a documented manual source selection, not a successful named hero CLI redraw. --alternatives hero exits 2 with “No blueprints for role hero”; the implementation only supports random --redraw hero. hero-selection.json includes the full unmodified library entry, source pin, reason and AFİNA adaptation. The literal invitation cannot represent the brand artefact or latest cinematic request. The selected source explicitly supports a muted full-bleed film, left two-line claim and lower-right photographed objects. Use one real product packshot as the focal physical artefact, rather than inventing two news/edition cards. Keep the original opaque navigation outside the film. No new transparent cutout is presumed.

Commands used with TASTE_SKILL_HISTORY=/Users/emre/PROJELER/5F-ZEYTIN/.cache/task-160/taste-history.json:

    node .agents/skills/design-taste-frontend/scripts/draw.mjs --out .cache/task-160/taste-direction --alternatives proof
    node .agents/skills/design-taste-frontend/scripts/draw.mjs --out .cache/task-160/taste-direction --alternatives showcase
    node .agents/skills/design-taste-frontend/scripts/draw.mjs --out .cache/task-160/taste-direction --alternatives hero
    node .agents/skills/design-taste-frontend/scripts/draw.mjs --out .cache/task-160/taste-direction --redraw section:proof=intro-heading-captions-panorama
    node .agents/skills/design-taste-frontend/scripts/draw.mjs --out .cache/task-160/taste-direction --redraw section:showcase=features-specimens-on-colour-tiles

The first two alternative command outputs and the unsupported hero output are preserved verbatim in alternatives-proof.txt, alternatives-showcase.txt and alternatives-hero.txt. Hero source comes from the installed pinned library/heroes.json; section sources from library/sections.json. copy-deck.md maps every chosen section to the actual product/FAQ/contact source. The copy is a reviewable draft, not a runtime change or customer visual approval.

## Explicit limitations of the raw sheet

The original draw included “Invitation card, cropped”, “printed guest list”, “output slips”, a six-to-nine-picture drag row and a curtain footer. The supported proof/showcase slots are now replaced as above; the original hero remains in the native sheet and its explicit source override is in hero-selection.json. AFİNA has no wedding invitation, guest list, printed output, six distinct production photographs, opening hours or booking service. Those literal fields cannot be supplied honestly. For the unreplaced how-it-works slot, use only the three real narrative stages with their existing grove/factory/product assets; do not create a fictional six-to-nine-stage production history. CTA/contact/footer take the filled-paper alignment principle without rotating/cropping real form fields, fabricating opening hours/booking, adding stamp art, or hiding support links. Curtain-footer motion is secondary and optional; the protected signature is the approved packshot emerging from the grove with Motion/react.

The user’s latest request for a cinematic full-width Flow opening and Motion/react, existing packaging geometry, media approvals and real commerce take priority over these unrelated sample blueprints. Preserve the artefact idea through AFİNA’s actual packaging rather than literal scallops, tilted stationery, cropped forms or a persistent split layout. No new source photos are downloaded, even though the generated sheet lists stock examples. No GSAP/Lenis engine, forced loop, global history or paid media is introduced.

This document records the pre-implementation draw and adaptation. Current native inspector/scenes results, safe helper provenance and final browser acceptance are recorded in VERIFICATION.md and the Task160 QA receipt; this draw is not acceptance evidence.
