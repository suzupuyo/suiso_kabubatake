module.exports = function (eleventyConfig) {
    // {{ "/css/style.css" | url }} が正しく動くように
    eleventyConfig.addPlugin(require("@11ty/eleventy").EleventyHtmlBasePlugin);


    // CSSフォルダをそのまま出力先(_site)にコピーする設定
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/chara_img");

    // フォルダ化を無効にし、ファイル名を維持する
    eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem }}.html");

    eleventyConfig.addCollection("novels", function (collectionApi) {
        // src/novel フォルダ内のファイルをファイル名順（001, 002...）に並べる
        return collectionApi.getFilteredByGlob("./src/novel/*.html").sort((a, b) => {
            return a.inputPath.localeCompare(b.inputPath);
        });

    });

    return {
        pathPrefix: "/suiso_kabubatake/", // 自分のリポジトリ名に合わせて変更
        // テンプレートとして扱う拡張子を限定する
        templateFormats: ["html", "md", "njk"],
        dir: {
            input: "src",    // 入力ディレクトリ
            output: "_site",  // 出力ディレクトリ
            // 念のためincludesの場所を明示
            includes: "_includes"
        }
    };

};