var path = require('path');
const execFile = require('child_process').execFile;

var exePath = path.resolve(__dirname, 'host.py');

var child = require('child_process').exec('python', [exePath]);

// process = execFile('python', [exePath]);
console.log(child);

process.stdout.write('hello');

child.stdout.on('data', function (data) {
  let activeTab = data.toString().trim();

  console.log('activeTab ', activeTab);
});

child.stderr.on('data', function (data) {
  if (data) console.log('STDERR: ', data);
});

child.on('error', function (err) {
  if (err) return console.error(err);
});

child.on('exit', function () {
  process.exit();
});
