"use strict";
const gulp = require("gulp");
const esbuild = require("esbuild");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const through2 = require("through2");
const fs = require("fs-extra"); // fs-extra is an extended version of Node"s fs module
const path = require("path");
const concat = require("gulp-concat");

function removeSelfExecutingFunction() {
    return through2.obj(function (file, _, callback) {
        if (file.isBuffer()) {
            let content = file.contents.toString();
            var start = '"use strict";\n(() => {';
            var end = '})();';

            content = content.trimStart().trimEnd();
            content = content.substring(start.length, start.length + (content.length - (start.length - 1)));
            content = content.substring(0, content.length - end.length);

            file.contents = Buffer.from(content);
        }
        callback(null, file);
    });
}


gulp.task("build-jsx", function (done) {
    esbuild.build({
        entryPoints: ["src/jsx/gooee.jsx"],
        outfile: "../Gooee/Resources/temp_gooee.js", // Temp output file
        bundle: true,
        //minify: true,
        //jsxDev: false,
        platform: "browser",
        loader: {
            ".js": "jsx",
            ".jsx": "jsx"
        },
        // Define React and ReactDOM as external dependencies
/*      external: ["react", "react-dom", "react/jsx-runtime"],*/
    }).then(() => {
        gulp.src(["../Gooee/Resources/temp_gooee.js"])
           // .pipe(removeSelfExecutingFunction()) // Apply the transformation
            .pipe(gulp.dest("../Gooee/Resources"))
            .on("end", () => {
                done();
            });
    }).catch((error) => {
        console.error(error);
        done(new Error("Build failed"));
    });
});

gulp.task("build-js", function (done) {
    gulp.src(["src/js/gooee.core.js", "../Gooee/Resources/temp_gooee.js"])
        .pipe(concat("Gooee.Core.js"))
        .pipe(gulp.dest("../Gooee/Resources"))
        .on("end", () => {
            fs.removeSync("../Gooee/Resources/temp_gooee.js");

            const localLowPath = path.join(process.env.USERPROFILE, "AppData", "LocalLow");
            const gooeePath = path.join(localLowPath, "Colossal Order", "Cities Skylines II", "Mods", "Gooee");
            const jsPath = path.join(gooeePath, "Gooee.Core.js");
            const mjsPath = path.join(gooeePath, "Gooee.mjs");
            fs.copySync("../Gooee/Resources/Gooee.Core.js", jsPath, { overwrite: true });
            fs.copySync("../Gooee.Bridge/dist/Gooee.mjs", "../Gooee/Resources/Gooee.mjs", { overwrite: true });
            fs.copySync("../Gooee.Bridge/dist/Gooee.mjs", mjsPath, { overwrite: true });
            done();
        });
});

gulp.task("build-scss", function (done) {
    gulp.src("src/scss/gooee.scss")
        .pipe(sass().on("error", sass.logError)) // Compile SCSS to CSS
        .pipe(cleanCSS()) // Minify the CSS
        .pipe(rename("gooee.css")) // Rename the output file
        .pipe(gulp.dest("../Gooee/Resources")) // Output directory
        .on("end", () => {
            const localLowPath = path.join(process.env.USERPROFILE, "AppData", "LocalLow");
            const localLowDestPath = path.join(localLowPath, "Colossal Order", "Cities Skylines II", "Mods", "Gooee");
            
            const cssFile = path.join(localLowDestPath, "gooee.css");
            fs.copySync("../Gooee/Resources/gooee.css", cssFile, { overwrite: true });

            done();
        });
});

gulp.task("default", gulp.series("build-jsx", "build-js", "build-scss"));
