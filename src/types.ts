
import type { Timestamp } from 'firebase/firestore';

export interface HtmlValidationError {
  lineNumber: number;
  lineContent: string;
  errorTag: string;
  message: string;
}

export interface Template {
    id: string;
    title: string;
    slug: string;
    fullDescription: string;
    seoMetaDescription: string;
    categories: string[];
    tags: string[];
    industry: string;
    compatibleESPs: string[];
    pricingType?: string;
    designer: string;
    desktopPreviewUrl: string;
    mobilePreviewUrl?: string;
    htmlFileUrl: string;
    createdAt: any;
    averageRating?: number;
    numberOfRatings?: number;
}

export interface VideoGuide {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    createdAt: any;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    author: string;
    content: string;
    seoMetaDescription: string;
    thumbnailUrl?: string;
    categories: string[];
    industry: string;
    tags: string[];
    helpfulCount: number;
    notHelpfulCount: number;
    createdAt: any;
}

export interface SocialLink {
    name: string;
    url: string;
}

export interface Expert {
    id: string;
    name: string;
    designation: string;
    description: string;
    profilePictureUrl: string;
    socials: SocialLink[];
    email: string;
    createdAt: any;
}

export interface AppSettings {
    announcement: {
        text: string;
        isEnabled: boolean;
    };
    buyMeACoffee: {
        url: string;
        isEnabled: boolean;
    };
    hireMeUrl: string;
    contact: {
        email: string;
        phone: string;
        isEnabled: boolean;
    };
    socials: SocialLink[];
}

export type ContactMessageStatus = 'read' | 'unread';

export interface ContactMessage {
    id?: string;
    fullName: string;
    email: string;
    subject: string;
    message: string;
    /** Whether an admin has opened the message. Defaults to 'unread' on creation. */
    status: ContactMessageStatus;
    /** Name of the admin who opened the message. Defaults to 'Unassigned' on creation. */
    openedBy: string;
    createdAt: Timestamp | any;
}

export interface MinifyOptions {
    keepHead: boolean;
    keepStyles: boolean;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    productType: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
    thumbnailUrl: string;
    galleryImageUrls: string[];
    demoVideoUrl: string;
    liveDemoUrl?: string;
    price: number;
    isFree: boolean;
    purchaseUrl: string;
    techStack: string[];
    documentationUrl?: string;
    version: string;
    categories: string[];
    tags: string[];
    seoTitle: string;
    seoMetaDescription: string;
    structuredData?: string;
    createdAt: any;
    lastUpdatedAt: any;
    faq?: FAQItem[];
    reviewCount?: number;
    averageRating?: number;
}
