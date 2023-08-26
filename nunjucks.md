
# nunjucks(1) -- Template Rendering Engine

## SYNOPSIS

`nunjucks`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-c`|`--config` *config-file*\]
\[`-C`|`--option` *key*=*value*\]
\[`-d`|`--defines` *context-file*\]
\[`-D`|`--define` *key*=*value*\]
\[`-e`|`--extension` *module-name*\]
\[`-o`|`--output` *output-file*|`-`\]
\[*input-file*|`-`\]

## DESCRIPTION

`nunjucks`(1) is a small command-line utility to render templates with the rich
and powerful templating language [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/).
This allows you to define your configuration in a YAML file and then render
an output file based on a template input file where your configuration can be expanded.
It optionally can load Nunjucks addons like the ones from the companion
[Nunjucks Addons](https://github.com/rse/nunjucks-addons) package.

## OPTIONS

The following top-level options and arguments exist:

- \[`-h`|`--help`\]
  Show usage help.

- \[`-V`|`--version`\]
  show program version information.

- \[`-c`|`--config` *config-file*\]
  load Nunjucks configuration YAML file.

- \[`-C`|`--option` *key*=*value*\]
  set Nunjucks configuration option.

- \[`-d`|`--defines` *context-file*\]
  load context definition YAML file.

- \[`-D`|`--define` *key*=*value*\]
  set context definition key/value.

- \[`-e`|`--extension` *module-name*\]
  load Nunjucks JavaScript extension module (installed via NPM).

- \[`-o`|`--output` *output-file*|`-`\]
  save output file (or stdout).

- \[`<input-file>`|`-`\]
  load input file (or stdin).

## EXAMPLE

```
$ echo "Hello, {{who}}!" | nunjucks -D who=world -
Hello, world!
```

## HISTORY

The `nunjucks`(1) utility was developed in August 2023 for being
able to easily generate multiple configuration files for a complex
*Docker-Compose* based setup.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

