module.exports = function(config) {
  config.set({
    singleRun: true,
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    reporters: ['spec'],
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-spec-reporter'],
    files: [
      'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
      'scripts/**/*.js',
      'test/**/*.spec.js'
    ]
  });
};
