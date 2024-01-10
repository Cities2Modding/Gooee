const gulp = require('gulp');
const esbuild = require('esbuild');
const fs = require('fs-extra'); // fs-extra is an extended version of Node's fs module
const path = require("path");
gulp.task('build-jsx', function (done) {
    esbuild.build({
        entryPoints: ['src/jsx/ui.jsx'],
        outdir: '../Gooee.Example/Resources',
        bundle: true,
        platform: 'browser',
        loader: {
            '.js': 'jsx',
            '.jsx': 'jsx'
        }
        // Add other esbuild options as needed
    }).then(() => {
        const localLowPath = path.join(process.env.USERPROFILE, "AppData", "LocalLow");
        const localLowDestPath = path.join(localLowPath, "Colossal Order", "Cities Skylines II", "Mods", "Gooee", "Plugins");
        const jsFile = path.join(localLowDestPath, "Example.js");
        fs.copySync("../Gooee.Example/Resources/ui.js", jsFile, { overwrite: true });
        done();
    }).catch((error) => {
        console.error(error);
        done(new Error('Build failed'));
    });
});

gulp.task('default', gulp.series('build-jsx'));
