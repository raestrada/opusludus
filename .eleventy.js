module.exports = function (eleventyConfig) {
  // Passthrough copy — static assets go straight to output
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy({
    "src/assets/js/bundle.js": "assets/js/bundle.js",
    "src/assets/js/bundle.js.map": "assets/js/bundle.js.map",
  });

  // Watch the webpack output bundle for live reload
  eleventyConfig.setServerOptions({
    watch: ["src/assets/js/bundle.js"],
  });

  // i18n filter — picks the right language from an object with _en/_es suffixes
  // or keys "en"/"es"
  eleventyConfig.addFilter("t", function (obj, locale) {
    if (typeof obj === "object" && obj !== null) {
      return obj[locale] ?? obj["en"] ?? Object.values(obj)[0] ?? "";
    }
    return obj;
  });

  // i18n filter for arrays of objects
  eleventyConfig.addFilter("tList", function (arr, locale, field) {
    if (!Array.isArray(arr)) return arr;
    return arr.map((item) => {
      if (field && typeof item[field] === "object") {
        item[field] = item[field][locale] ?? item[field]["en"] ?? "";
      }
      return item;
    });
  });

  // range filter for Nunjucks loops
  eleventyConfig.addFilter("range", function (start, end) {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  });


  // Determine path prefix dynamically
  const isProduction = process.env.NODE_ENV === "production";
  const prefix = isProduction ? "/opusludus" : "";
  eleventyConfig.addGlobalData("pathPrefix", prefix);

  // Shortcode for the game bundle script tag
  eleventyConfig.addShortcode("gameBundle", function () {
    return `<script src="${prefix}/assets/js/bundle.js"></script>`;
  });

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    pathPrefix: isProduction ? "/opusludus/" : "/",
  };
};
