import { HeroSection } from "@/components/home/hero-section";
import { CategorySection } from "@/components/home/category-section";

const cliPlugins = [
  {
    slug: "sfdx-hard-hat",
    name: "SFDX Hard Hat",
    description:
      "Enhances metadata deployment with automatic dependency resolution and conflict checks.",
    iconEmoji: "⚡",
    installCommand: "npm i sfdx-hard-hat",
    avgRating: 4.8,
    reviewsCount: 128,
    category: "cli-plugins",
  },
  {
    slug: "code-analyzer-pro",
    name: "Code Analyzer Pro",
    description:
      "Advanced static analysis for Apex and LWC that integrates directly into your CI/CD pipeline.",
    iconEmoji: "🔍",
    installCommand: "npm i sfdx-scanner-pro",
    avgRating: 4.5,
    reviewsCount: 84,
    category: "cli-plugins",
  },
  {
    slug: "data-mover-x",
    name: "Data Mover X",
    description:
      "Extract, transform, and load record data between orgs while maintaining relationships.",
    iconEmoji: "💾",
    installCommand: "npm i sfdx-dmx",
    avgRating: 4.9,
    reviewsCount: 210,
    category: "cli-plugins",
  },
];

const lwcComponents = [
  {
    slug: "super-datatable",
    name: "Super Datatable",
    description:
      "A wrapper around lightning-datatable supporting inline edit, pagination, and mass actions.",
    iconEmoji: "📊",
    version: "1.0.4",
    avgRating: 4.7,
    reviewsCount: 96,
    category: "lwc-library",
  },
  {
    slug: "illustration-picker",
    name: "Illustration Picker",
    description:
      "Allow admins to select Salesforce SLDS illustrations dynamically in App Builder.",
    iconEmoji: "🎨",
    version: "2.1.0",
    avgRating: 4.3,
    reviewsCount: 52,
    category: "lwc-library",
  },
  {
    slug: "code-snippet-viewer",
    name: "Code Snippet Viewer",
    description:
      "PrismJS integration for displaying highlighted code blocks within Experience Cloud.",
    iconEmoji: "💻",
    version: "0.9.5",
    avgRating: 4.1,
    reviewsCount: 34,
    category: "lwc-library",
  },
];

const apexUtils = [
  {
    slug: "apex-trigger-framework",
    name: "Trigger Framework",
    description:
      "Lightweight, governor-friendly trigger framework with built-in recursion prevention.",
    iconEmoji: "🏗️",
    installCommand: "sfdx force:source:deploy -p force-app",
    avgRating: 4.9,
    reviewsCount: 312,
    category: "apex-utilities",
  },
  {
    slug: "apex-test-factory",
    name: "Test Data Factory",
    description:
      "Fluent API for creating test records with all required fields and relationship lookups.",
    iconEmoji: "🧪",
    installCommand: "sfdx force:source:deploy -p force-app",
    avgRating: 4.6,
    reviewsCount: 178,
    category: "apex-utilities",
  },
  {
    slug: "apex-collection-utils",
    name: "Collection Utils",
    description:
      "Functional programming helpers for Lists, Sets, and Maps — filter, map, group, and pluck.",
    iconEmoji: "🧰",
    installCommand: "sfdx force:source:deploy -p force-app",
    avgRating: 4.4,
    reviewsCount: 89,
    category: "apex-utilities",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <CategorySection
        title="CLI Power-Ups"
        subtitle="Extend your terminal capabilities."
        viewAllHref="/browse?category=cli-plugins"
        resources={cliPlugins}
      />

      <CategorySection
        title="LWC Blueprint"
        subtitle="Drop-in UI components for your org."
        viewAllHref="/browse?category=lwc-library"
        resources={lwcComponents}
      />

      <CategorySection
        title="Apex Utilities"
        subtitle="Battle-tested classes and frameworks."
        viewAllHref="/browse?category=apex-utilities"
        resources={apexUtils}
      />
    </>
  );
}
