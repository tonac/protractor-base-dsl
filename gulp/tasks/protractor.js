import log from 'loglevel';
import gulp from 'gulp';
import {protractor, webdriver_update} from 'gulp-protractor';
import env from 'gulp-env';
import rimraf from 'rimraf';
import {argv} from 'yargs';
import paths from '../utils/paths';
import seleniumVersion from './selenium-versions.json';

gulp.task('webdriver-cleanup', (cb) => rimraf(`${paths.nodeModulesDir}/webdriver-manager/selenium`, cb));

gulp.task('webdriver-update', gulp.series('webdriver-cleanup', (done) => {
    webdriver_update({
        browsers: ['chrome', 'gecko'],
        webdriverManagerArgs: [
            '--versions.standalone',
            seleniumVersion.standalone,
            '--versions.gecko',
            seleniumVersion.gecko,
            '--versions.chrome',
            seleniumVersion.chrome
        ]
    }, done);
}));

gulp.task('webdriver-cleanup', (cb) => {
    rimraf(`${paths.nodeModulesDir}/webdriver-manager/selenium`, cb);
});

export const runProtractor = (cb, envs) => {
    let protractorArgs = [];
    if (argv.suite) {
        protractorArgs = protractorArgs.concat(['--suite', argv.suite]);
    }
    log.warn('starting protractor with arguments', protractorArgs);
    return gulp
        .src([`${paths.testDir}/e2e/*.js`])
        .pipe(envs)
        .pipe(protractor({
            args: protractorArgs,
            configFile: `${paths.testDir}/e2e/config/protractor.conf.js`
        }))
        .on('end', () => {
            cb();
            process.exit(0);
        })
        .on('error', (error) => {
            cb();
            throw error;
        });
};

gulp.task('protractor', (cb) => runProtractor(cb, env.set({})));
