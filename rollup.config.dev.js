import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import flow from 'rollup-plugin-flow';

export default {
  entry: 'src/js/main.js',
  format: 'iife',
  useStrict: false,
  plugins: [
    flow(),
    json(),
    babel({
      "babelrc": false,
      "exclude": 'node_modules/**',
      "presets": [
        ["es2015", {
          "modules": false
        }]
      ],
      "plugins": ["external-helpers"]
    }),
    nodeResolve({
      browser: true
    }),
    commonjs()
  ],
  dest: 'src/bundle.js'
};
