// .eleventy.js
// 1. Load dotenv for local development environment variables
require('dotenv').config();

// 2. Import Contentful SDK
const contentful = require('contentful');

// 3. Configure the Contentful client
// It will automatically pick up environment variables set in .env (locally) or Netlify (production)
const contentfulClient = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    // Use CDA for production builds, CPA for local development/preview
    accessToken: process.env.NODE_ENV === 'production'
                 ? process.env.CONTENTFUL_CDA_TOKEN
                 : process.env.CONTENTFUL_CPA_TOKEN,
    // Use Contentful Delivery API host for production, Preview API host for local
    host: process.env.NODE_ENV === 'production' ? 'cdn.contentful.com' : 'preview.contentful.com'
});

module.exports = function(eleventyConfig) {

    // --- Eleventy Configuration ---

    // 1. Passthrough copies: Files/folders that should be copied directly to _site
    eleventyConfig.addPassthroughCopy("Favicon.png");
    eleventyConfig.addPassthroughCopy("admin"); // For Decap CMS
    eleventyConfig.addPassthroughCopy("static/uploads"); // For Decap CMS media uploads
    // If you have blog posts in a 'blog' folder that are NOT managed by Contentful (e.g., Markdown files)
    // and you want Eleventy to process them directly as individual files, add:
    // eleventyConfig.addPassthroughCopy("blog");

    // 2. Add a global data collection for Contentful blog posts
    // This makes the blog posts accessible in your templates via `collections.blogPostsFromContentful`
    eleventyConfig.addCollection("blogPostsFromContentful", async function(collection) {
        console.log("Fetching blog posts from Contentful...");
        try {
            const entries = await contentfulClient.getEntries({
                content_type: 'blogPage', // <<<< IMPORTANT: REPLACE 'blogPost' with your actual Contentful Blog Post Content Model ID
                order: '-fields.publishDate' // Order by publish date, newest first
            });

            if (!entries || !entries.items || entries.items.length === 0) {
                console.warn("No blog posts found in Contentful for 'blogPost' content type.");
                return [];
            }

            // Map Contentful entries to a format Eleventy can use, and add URL/permalink logic
            return entries.items.map(item => {
                // Ensure slug exists and is valid
                const slug = item.fields.slug || (item.fields.title ? item.fields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'no-slug');
                const publishYear = new Date(item.fields.publishDate).getFullYear();

                return {
                    title: item.fields.title,
                    author: item.fields.author,
                    publishDate: item.fields.publishDate,
                    summary: item.fields.summary,
                    body: item.fields.body, // The markdown/rich text content from Contentful
                    url: `/blog/${publishYear}/${slug}/`, // Example URL structure: /blog/2025/my-first-post/
                    // Include all fields you need from Contentful in the data object
                    data: { // Data accessible in the individual post's template
                        title: item.fields.title,
                        author: item.fields.author,
                        publishDate: item.fields.publishDate,
                        summary: item.fields.summary,
                        body: item.fields.body,
                        // Set the layout for individual blog post pages here
                        layout: 'layouts/blog-post.liquid' // Ensure this matches your blog post template file
                    }
                };
            });
        } catch (error) {
            console.error("Error fetching Contentful blog posts:", error);
            // In a production build, you might want to throw an error to fail the build
            // locally, you might return an empty array to allow the build to proceed.
            return [];
        }
    });


    // 3. Eleventy directory configuration
    return {
        dir: {
            input: "pages",        // Eleventy will process files from the 'pages' folder
            output: "_site",       // Eleventy will output the built site to '_site'
            includes: "_includes", // This tells Eleventy that the _includes folder is relative to the project root
            data: "_data"          // This also means _data is relative to the project root.
        },
        templateFormats: ["html", "md", "liquid"], // Process HTML, Markdown, and Liquid templates
        htmlTemplateEngine: "liquid",              // Default templating engine for HTML files
        markdownTemplateEngine: "liquid"           // Default templating engine for Markdown files
    };
};
