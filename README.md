bench
=====

Benchmark code for frontend animation performance.

### Intro

Using [benchmark.js](https://github.com/bestiejs/benchmark.js) to do the bench.

### Dependencies

* [Node.js](https://nodejs.org)
* [Gulp](http://gulpjs.com/)
* [Mongodb](https://www.mongodb.org/)
* [Browserify](http://browserify.org/)

### Preparation

install javascript dependencies
```shell
# install mongodb, node.js
npm install -g gulp       # gulp
npm install               # other modules
```

### Usage

~~Run step 2 & 3 if you want to collect data.~~

1. `gulp` Open http://localhost:3000 in browser tab (via [browser-sync](http://browsersync.io/))

### TODO

- [X] Backend server to collect bench data
- [X] 2D Translation benchmark
- [ ] 3D Translation benchmark
- [X] 2D Rotate benchmark
- [ ] 3D Rotate benchmark

### Credits

Thanks to @jdalton and @mathiasbynens for this great benchmarking tool!

### License

MIT
