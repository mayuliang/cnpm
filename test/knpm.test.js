'use strict';

const assert = require('assert');
const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const coffee = require('coffee');
const knpm = path.join(__dirname, '..', 'bin', 'knpm');
const fixtures = path.join(__dirname, 'fixtures');
const cwd = path.join(fixtures, 'foo');

const RUN_ON_CI = process.env.CI;

function run(args, env, callback) {
  if (typeof env === 'function') {
    callback = env;
    env = {};
  }
  return spawn('node', args, {
    cwd,
    env: Object.assign({}, process.env, env),
  }).on('exit', callback);
}

describe('test/knpm.test.js', () => {
  after(() => {
    fse.removeSync(path.join(cwd, 'node_modules'));
  });

  it('should version', () => {
    return coffee.fork(knpm, [ '-v' ])
      .debug()
      .expect('stdout', /knpm@\d+\.\d+\.\d+ \(/)
      .expect('code', 0)
      .end();
  });

  it('should show all knpm config', function(done) {
    const args = [
      knpm,
      'config',
      'ls',
      '-l',
    ];
    const child = spawn('node', args).on('exit', function(code) {
      assert(code === 0);
      done();
    });
    child.stdout.pipe(process.stdout);
  });

  it('should user custom registry in userconf', function(done) {
    const args = [
      knpm,
      '--userconfig=' + path.join(fixtures, 'userconf'),
    ];
    let stdout = '';
    const child = spawn('node', args).on('exit', function(code) {
      assert(stdout.includes('npm command use --registry=http://127.0.0.1/registry'));
      assert(code === 0);
      done();
    });
    child.stdout.on('data', function(data) {
      stdout += data.toString();
    });
  });

  it('should --help user custom registry in userconf', function(done) {
    const args = [
      knpm,
      '--help',
      '--userconfig=' + path.join(fixtures, 'userconf'),
    ];
    let stdout = '';
    const child = run(args, function(code) {
      assert(stdout.includes('npm command use --registry=http://127.0.0.1/registry'));
      assert(code === 0);
      done();
    });
    child.stdout.on('data', function(data) {
      stdout += data.toString();
    });
  });

  it('should user default registry in userconf dont contain registry', function(done) {
    const args = [
      knpm,
      '--userconfig=' + path.join(fixtures, 'userconf-no-registry'),
    ];
    let stdout = '';
    const child = run(args, function(code) {
      assert(stdout.match(/npm command use --registry=https?:\/\/r.npm.taobao.org/));
      assert(code === 0);
      done();
    });
    child.stdout.on('data', function(data) {
      stdout += data.toString();
    });
  });

  it('should ingore custom user config', function(done) {
    const args = [
      knpm,
      'config',
      'get',
      'registry',
      '--ignore-custom-config',
    ];
    let stdout = '';
    const child = run(args, {
      HOME: path.join(fixtures, 'home'),
    }, function(code) {
      assert(stdout.match(/http?:\/\/10.68.8.100/));
      assert(code === 0);
      done();
    });
    child.stdout.on('data', function(data) {
      stdout += data.toString();
    });
    child.stderr.pipe(process.stderr);
  });

  it('should install pedding', function(done) {
    const args = [
      knpm,
      'install',
      'pedding',
    ];
    if (RUN_ON_CI) {
      args.push('--registry=https://registry.npmjs.org');
      args.push('--disturl=none');
      args.push('--userconfig=none');
    }
    run(args, function(code) {
      assert(code === 0);
      done();
    });
  });


  it('should install knpm', function(done) {
    const args = [
      knpm,
      'install',
      'knpm',
    ];
    if (RUN_ON_CI) {
      args.push('--registry=https://registry.npmjs.org');
      args.push('--disturl=none');
      args.push('--userconfig=none');
    }
    run(args, function(code) {
      assert(code === 0);
      done();
    });
  });

  it('should install npm', function(done) {
    const args = [
      knpm,
      'install',
      'npm',
    ];
    if (RUN_ON_CI) {
      args.push('--registry=https://registry.npmjs.org');
      args.push('--disturl=none');
      args.push('--userconfig=none');
    }
    run(args, function(code) {
      assert(code === 0);
      done();
    });
  });

  it('should show full versions', function(done) {
    const args = [
      knpm,
      '-v',
    ];
    if (RUN_ON_CI) {
      args.push('--registry=https://registry.npmjs.org');
      args.push('--disturl=none');
      args.push('--userconfig=none');
    }
    const child = run(args, function(code) {
      assert(code === 0);
      done();
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });

  it('should install and pre-build cpp module', function(done) {
    const args = [
      knpm,
      'install',
      'node-murmurhash',
    ];
    if (RUN_ON_CI) {
      args.push('--registry=https://registry.npmjs.org');
      args.push('--disturl=none');
      args.push('--userconfig=none');
    }
    const child = run(args, function(code) {
      assert(code === 0);
      done();
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });

  // WTF? TRAVIS download from taobao npm is too slow! skip this!
  if (!RUN_ON_CI) {
    it('should install node-sass from mirror', function(done) {
      const args = [
        knpm,
        'install',
        'node-sass',
      ];
      if (RUN_ON_CI) {
        args.push('--registry=https://registry.npmjs.org');
        args.push('--disturl=none');
        args.push('--userconfig=none');
      }
      const child = run(args, function(code) {
        assert(code === 0);
        fs.existsSync(path.join(cwd, 'node_modules/node-sass'));
        done();
      });
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    });
  }
});
