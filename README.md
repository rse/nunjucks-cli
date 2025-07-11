
nunjucks-cli
============

**Nunjucks Template Rendering Command-Line Interface**

[![github (author stars)](https://img.shields.io/github/stars/rse?logo=github&label=author%20stars&color=%233377aa)](https://github.com/rse)
[![github (author followers)](https://img.shields.io/github/followers/rse?label=author%20followers&logo=github&color=%234477aa)](https://github.com/rse)
[![github (project stdver)](https://img.shields.io/github/package-json/stdver/rse/nunjucks-cli?logo=github&label=project%20stdver&color=%234477aa&cacheSeconds=900)](https://github.com/rse/nunjucks-cli)
<br/>
[![npm (project license)](https://img.shields.io/npm/l/%40rse%2Fnunjucks-cli?logo=npm&label=npm%20license&color=%23cc3333)](https://npmjs.com/@rse/nunjucks-cli)
[![npm (project release)](https://img.shields.io/npm/v/%40rse/nunjucks-cli?logo=npm&label=npm%20release&color=%23cc3333)](https://npmjs.com/@rse/nunjucks-cli)
[![npm (project downloads)](https://img.shields.io/npm/dm/%40rse/nunjucks-cli?logo=npm&label=npm%20downloads&color=%23cc3333)](https://npmjs.com/@rse/nunjucks-cli)

Abstract
--------

This is a small command-line utility to render templates with the rich
and powerful templating language [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/).
This allows you to define your configuration in a YAML file and then render
an output file based on a template input file where your configuration can be expanded.
It optionally can load Nunjucks addons like the ones from the companion
[Nunjucks Addons](https://github.com/rse/nunjucks-addons) package.

Installation & Usage
--------------------

For the installation via Node Package Manager (NPM) use:

```sh
# plain functionality
$ npm install -g @rse/nunjucks-cli
$ nunjucks [...]

# with addon functionality
$ npm install -g @rse/nunjucks-cli @rse/nunjucks-addons
$ nunjucks -e @rse/nunjucks-addons [...]
```

Alternatively, instead of globally installing it, you can also use it on-the-fly with NPM's npx(1) utility:

```sh
# plain functionality
$ npx --yes @rse/nunjucks-cli [...]

# with addon functionality
$ npx --yes --package @rse/nunjucks-cli --package @rse/nunjucks-addons -- \
  nunjucks -e @rse/nunjucks-addons [...]
```

Command-Line Interface (CLI)
----------------------------

Short excerpt of the CLI options and arguments from the companion [Unix manpage](nunjucks.md):

```
$ nunjucks
  [-h|--help]
  [-V|--version]
  [-c|--config <config-file>]
  [-C|--option <key>=<value>]
  [-d|--defines <context-file>]
  [-D|--define <key>=<value>]
  [-e|--extension <module-name>]
  [-o|--output <output-file>|-]
  <input-file>|-
```

- `-h`|`--help`:<br/>
  Show usage help.
- `-V`|`--version`:<br/>
  Show program version information.
- `-c`|`--config` `<config-file>`:<br/>
  Load Nunjucks configuration YAML file.
- `-C`|`--option` `<key>=<value>`:<br/>
  Set Nunjucks configuration option.
- `-d`|`--defines` `<context-file>`:<br/>
  Load context definition YAML file.
  Can occur multiple times.
- `-D`|`--define` `<key>=<value>`:<br/>
  Set context definition key/value.
  Can occur multiple times.
- `-e`|`--extension` `<module-name>`:<br/>
  Load Nunjucks JavaScript extension module (installed via NPM).
- `-o`|`--output` `<output-file>`|`-`:<br/>
  Save output file (or stdout).
- `<input-file>`|`-`:<br/>
  Load input file (or stdin).

Example
-------

```sh
$ echo "Hello, {{who}}!" | nunjucks -D who=world -
Hello, world!
```

License
-------

Copyright &copy; 2019-2025 Dr. Ralf S. Engelschall (http://engelschall.com/)

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

