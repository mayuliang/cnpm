knpm
=======

knpm: npm client for knpm

## Requirements

|        | Minimum | Recommended |
|--------|---------|-------------|
| NodeJS | 4.0.0   | stable      |

## Install

```bash
$ npm install knpm -g
```

If you're in Kedacom, maybe you should install it from our [Keda mirror](http://10.68.8.100):

```bash
$ npm install knpm -g --registry=http://10.68.8.100
```

## Usage

Support all commands just like `npm`.

### Sync packages from `npm`

```bash
$ knpm sync [moduleName]
```

### Open package document or git web url

```bash
$ knpm doc [name]
$ knpm doc -g [name] # open git web url directly
```

## Build your own private registry npm cli

```bash
$ npm install knpm -g

# then alias it
$ alias mynpm='knpm --registry=http://registry.npm.example.com \
  --registryweb=http://npm.example.com \
  --userconfig=$HOME/.mynpmrc'
```

## Install with original npm cli

knpm using [npminstall](https://github.com/cnpm/npminstall) by default.
If you don't like symlink mode for `node_modules`, you can change the installer to original npm.
But you will lose the fastest install speed.

```bash
$ knpm i --by=npm react-native
```

## License

[MIT](LICENSE.txt)
