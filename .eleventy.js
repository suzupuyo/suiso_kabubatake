// {{ "/css/style.css" | url }} が正しく動くように
// require は一番上に書く
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");


module.exports = function (eleventyConfig) {
    // 11tyに使用プラグイン指示
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    const Image = require("@11ty/eleventy-img");

    // 画像処理の命令（ショートコード）
    eleventyConfig.addNunjucksAsyncShortcode("image", async function (src, alt, widths = [300, 600], sizes = "100vw") {
        let imageAttributes = {
            alt,
            sizes,
            loading: "lazy", // 自動で遅延読み込み
            decoding: "async",
        };

        return Image.generateHTML(metadata, imageAttributes);
    });

    // CSSフォルダを出力先(_site)にコピーする
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/chara_img");

    // diary377 フォルダ内の画像などもそのまま _site にコピーさせる設定
    eleventyConfig.addPassthroughCopy("src/diary377/**/*.jpg");
    eleventyConfig.addPassthroughCopy("src/diary377/**/*.png");
    eleventyConfig.addPassthroughCopy("src/diary377/**/*.gif");

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