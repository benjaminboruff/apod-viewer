import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';
import flow from 'rollup-plugin-flow';

export default {
  entry: 'src/js/main.js',
  format: 'iife',
  useStrict: false,
  plugins: [
    flow(),
    json(),
    babel(),
    nodeResolve({browser: true}),
    commonjs(),
    uglify()
  ],
  dest: 'build/bundle.min.js'
};