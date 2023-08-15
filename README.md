
nunjucks-cli
============

**Nunjucks Template Rendering Command-Line Interface**

<p/>
<img src="https://nodei.co/npm/nunjucks-cli.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/nunjucks-cli.png" alt=""/>

Abstract
--------

This is a small command-line utility to render templates with the rich
and powerful templating language [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/).

Installation
------------

```
$ npm install -g nunjucks-cli
```

Usage
-----

```
$ nunjucks
  [-h|--help] [-V|--version]
  [-c|--config <config-file>]
  [-d|--defines <context-file>]
  [-D|--define <key>=<value>]
  [-e|--extension <extension-file>]
  [-o|--output <output-file>|-]
  <input-file>|-
```

- `-h`|`--help`:<br/>
  show usage help.
- `-V`|`--version`:<br/>
  show program version information.
- `-c`|`--config` `<config-file>`:<br/>
  load Nunjucks configuration YAML file
- `-d`|`--defines` `<context-file>`:<br/>
  load context definition YAML file.
- `-D`|`--define` `<key>=<value>`:<br/>
  set context definition key/value.
- `-e`|`--extension` `<extension-file>`:<br/>
  load Nunjucks JavaScript extension file.
- `-o`|`--output` `<output-file>`|`-`:<br/>
  save output file (or stdout).
- `<input-file>`|`-`:
  load input file (or stdin).

Example
-------

```sh
$ echo "Hello, {{who}}!" | nunjucks -D who=world -
```

License
-------

Copyright (c) 2019-2023 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

