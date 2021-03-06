var spawn = require('child_process').spawn;
var archiver = require('archiver');
var fs = require('fs');
var pathResolve = require('path').resolve;
var _ = require('underscore');

function buildApp(appPath, meteorBinary, buildLocation, callback) {
  buildMeteorApp(appPath, meteorBinary, buildLocation, function(code) {
    if(code == 0) {
      archiveIt(buildLocation, callback);
    } else {
      console.log("\n=> Build Error. Check the logs printed above.");
      callback(new Error("build-error"));
    }
  });
}

function buildMeteorApp(appPath, meteorBinary, buildLocation, callback) {
  var executable = meteorBinary;
  var args = [
    "build",
    "--directory", buildLocation,
    "--architecture", "os.linux.x86_64",
    "--server", process.env.ROOT_URL,
    "--server-only"
  ];

  var isWin = /^win/.test(process.platform);
  if(isWin) {
    // Sometimes cmd.exe not available in the path
    // See: http://goo.gl/ADmzoD
    executable = process.env.comspec || "cmd.exe";
    args = ["/c", "meteor"].concat(args);
  }

  var options = {cwd: appPath};
  var meteor = spawn(executable, args, options);
  var stdout = "";
  var stderr = "";

  meteor.stdout.pipe(process.stdout, {end: false});
  meteor.stderr.pipe(process.stderr, {end: false});

  meteor.on('close', callback);
}

function archiveIt(buildLocation, callback) {
  callback = _.once(callback);
  var bundlePath = pathResolve(buildLocation, 'bundle.tar.gz');
  var sourceDir = pathResolve(buildLocation, 'bundle');

  var output = fs.createWriteStream(bundlePath);
  var archive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 6
    }
  });

  archive.pipe(output);
  output.once('close', callback);

  archive.once('error', function(err) {
    console.log("=> Archiving failed:", err.message);
    callback(err);
  });

  archive.directory(sourceDir, 'bundle').finalize();
}

module.exports = buildApp;
