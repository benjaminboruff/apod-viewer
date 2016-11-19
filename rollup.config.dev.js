import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/js/main.js',
  format: 'iife',
  useStrict: false,
  plugins: [
    babel(),
    nodeResolve({browser: true}),
    commonjs()
  ],
  dest: 'src/bundle.js'
};