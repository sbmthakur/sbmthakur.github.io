const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(config) {
  config.addPassthroughCopy("./src/style.css")

  config.addPlugin(eleventyNavigationPlugin);
  config.addPlugin(syntaxHighlight);
//  config.setBrowserSyncConfig({
//    files: ['dist/**/*'],
//  })
//
  return {
    //templateFormats: ['md', 'njk', 'jpg', 'png', 'gif'],
    dir: {
      input: 'src',
      output: 'public'
    }
  }
}
