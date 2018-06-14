# gulp-onesky-post
> Gulp plugin to upload translation files directly to OneSky using their Platform API


## Install

```
$ npm install --save-dev gulp-onesky-post
```


## Usage

```js
var gulp = require('gulp');
var post = require('gulp-onesky-post');

gulp.task('post', () => (
	gulp.src('en_US.json')
		.pipe(post
			({
			locale: 'en_US',
		  secretKey: '12345',
		  publicKey: '67890',
		  projectId: '54321',
		  fileName: 'en_US.json',
		  format: 'HIERARCHICAL_JSON',
			allowSameAsOriginal: true, // optional (Default: True)
		  keepStrings: false         // optional (Default: False)
		}))
		.pipe(gulp.dest(''))
));
