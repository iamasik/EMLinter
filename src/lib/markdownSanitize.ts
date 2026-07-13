import { defaultSchema } from 'rehype-sanitize';

/**
 * Permissive sanitize schema for Firestore-authored markdown/HTML rendered via
 * react-markdown + rehype-raw (blog posts, product overviews).
 *
 * Content is owner-authored today (writes are locked to the server-admin path),
 * so this is defense-in-depth: even if a bad row lands in Firestore, rehype-raw
 * can no longer emit <script>, on*= event handlers, or javascript: URIs.
 *
 * It stays intentionally lenient with formatting — keeping `style`/`class`,
 * tables, and common image/link attributes — so existing rich content renders
 * unchanged. rehype-sanitize already drops event-handler attributes and unsafe
 * URL protocols regardless of what we allow below.
 */
export const markdownSanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        '*': [
            ...(defaultSchema.attributes?.['*'] ?? []),
            'style',
            'className',
            'class',
            'id',
        ],
        a: [
            ...(defaultSchema.attributes?.a ?? []),
            'target',
            'rel',
        ],
        img: [
            ...(defaultSchema.attributes?.img ?? []),
            'width',
            'height',
            'loading',
            'style',
        ],
    },
} as const;
