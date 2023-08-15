
nunjucks-cli
============

**Nunjucks Template Rendering Command-Line Interface**

<p/>
<img src="https://nodei.co/npm/@rse/nunjucks-cli.png?downloads=true&stars=true" alt=""/>

Abstract
--------

This is a small command-line utility to render templates with the rich
and powerful templating language [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/).
This allows you to define your configuration in a YAML file and then render
an output file based on a template input file where your configuration can be expanded.

Installation
------------

```sh
$ npm install -g @rse/nunjucks-cli
```

Alternatively, instead of globally installing it, let it be automatically installed on-the-fly:

```sh
$ npx @rse/nunjucks-cli [...]
```

Usage
-----

```
$ nunjucks
  [-h|--help] [-V|--version]
  [-c|--config <config-file>]
  [-d|--defines <context-file>]
  [-D|--define <key>=<value>]
  [-e|--extension <module-name>]
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
- `-e`|`--extension` `default|date|eval|jsonpath|<module-name>`:<br/>
  load Nunjucks JavaScript extension module (built-in or NPM installed).
- `-o`|`--output` `<output-file>`|`-`:<br/>
  save output file (or stdout).
- `<input-file>`|`-`:<br/>
  load input file (or stdin).

Example
-------

```sh
$ echo "Hello, {{who}}!" | nunjucks -D who=world -
Hello, world!
```

License
-------

Copyright &copy; 2019-2023 Dr. Ralf S. Engelschall (http://engelschall.com/)

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

