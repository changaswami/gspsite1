module.exports = function(eleventyConfig) {
    // Copy static assets like Favicon.png
    eleventyConfig.addPassthroughCopy("Favicon.png");
    // Copy the admin folder for Decap CMS
    eleventyConfig.addPassthroughCopy("admin");
    // Copy the entire blog folder (for blog posts and _posts)
    eleventyConfig.addPassthroughCopy("blog");
    // Copy the static/uploads folder for Decap CMS images
    eleventyConfig.addPassthroughCopy("static/uploads");

    return {
        dir: {
            input: "pages", // Process files from the current directory
            output: "_site", // Output to a folder named _site
            includes: "../_includes", // Look for layout files in _includes
            data: "../_data" // Look for global data in _data
        },
        templateFormats: ["html", "md", "liquid"], // Process HTML, Markdown, and Liquid templates
        htmlTemplateEngine: "liquid", // Default templating engine for HTML
        markdownTemplateEngine: "liquid" // Default templating engine for Markdown
    };
};