# Chiron site UI system

Homepage V2 is the reference for the current site. `shared/site-shell.js` renders one header, enquiry banner, and footer for the homepage and all interior pages. `shared/site-shell.css` defines their layout and interaction, plus the common hero scroll cue and button roles. Route-specific CSS controls page content and image placement.

## Reusable modules

| Module | Usage | Rule |
| --- | --- | --- |
| Header | All pages | One navigation source, blurred translucent background, outlined Contact action, shared mobile menu. |
| Interior hero | About, Products, Videos, Partners, Contact | Page-name eyebrow; subhead and 44 px outlined circular down arrow aligned at the lower edge. |
| Section label | Content sections | Green square and short module name, without section numbering. |
| Enquiry | Home and interior content pages | Dark outlined panel; fills light on hover/focus; mailto action. |
| Footer | All pages | Shared tagline, trademark copy, navigation, social links, full-width wordmark and legal line. |

## Button roles

| Role | Class | Usage |
| --- | --- | --- |
| Primary | `.ui-button--primary` | Main filled action, including the homepage hero and contact email action. |
| Secondary | `.ui-button--secondary` | Outlined action, including navigation Contact and enquiry. |
| Tertiary | `.ui-button--tertiary` | Unboxed text action, including product interest links. |

Circular scroll cues and video play controls are icon controls, not additional button styles. All interactive styles have visible focus states; motion and the four About capability-icon loops respect `prefers-reduced-motion`.

## Audit notes

- Consolidated six formerly duplicated headers and divergent interior footers into shared modules.
- Aligned hero arrow shape/size and lower placement across interior pages; removed numbered page/section labels where they served as breadcrumbs.
- Replaced About's training and lower technical imagery, removed the lower image caption, and kept both assets compressed for web delivery.
- Replaced old contact-form prompts in the affected content with email language; the enquiry action remains a `mailto:` placeholder until Chiron provides a recipient address.
- The Videos page uses one 16:9 inline player, site-owned titles and seven selectable thumbnails below (four desktop columns, two mobile columns). The separate hero photo and modal player are removed. Vimeo loads on play/selection; homepage `?video=` links select the matching film and show its poster without autoplay; playback begins on a user click. Thumbnail buttons align their images at the top regardless of title wrapping. Selected thumbnails use a green outline and label. The seven user-supplied screenshots live in `assets/video-thumbnails/`; gallery, player poster and homepage previews stay grayscale by default and reveal colour only on hover. Selection does not reveal colour. All seven titles and embeds use the user’s updated 30 September sources (see `research/vimeo-video-links-2026-09-30.md`). A direct Vimeo link remains available.
