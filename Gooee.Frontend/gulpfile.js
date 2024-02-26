"use strict";
const gulp = require("gulp");
const esbuild = require("esbuild");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const fs = require("fs-extra"); // fs-extra is an extended version of Node"s fs module
const path = require("path");
const concat = require("gulp-concat");

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
        }
        // Add other esbuild options as needed
    }).then(() => {
        // Concatenate Vue.js and the JSX build output
        gulp.src(["src/js/gooee.core.js", "../Gooee/Resources/temp_gooee.js"])
            .pipe(concat("gooee.js"))
            .pipe(gulp.dest("../Gooee/Resources"))
            .on("end", () => {
                // Clean up the temporary file
                fs.removeSync("../Gooee/Resources/temp_gooee.js");

                // Copy the file to the LocalLow target directory
                const localLowPath = path.join(process.env.USERPROFILE, "AppData", "LocalLow");
                const localLowDestPath = path.join(localLowPath, "Colossal Order", "Cities Skylines II", "Mods", "Gooee", "gooee.js");
                fs.copySync("../Gooee/Resources/gooee.js", localLowDestPath, { overwrite: true });

                done();
            });
    }).catch((error) => {
        console.error(error);
        done(new Error("Build failed"));
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

gulp.task("default", gulp.series("build-jsx", "build-scss"));
