
# nunjucks(1) -- Template Rendering Engine

## SYNOPSIS

`nunjucks`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-e`|`--env` *env-file*\]
\[`-c`|`--config` *config-file*\]
\[`-C`|`--option` *key*=*value*\]
\[`-d`|`--defines` *context-file*\]
\[`-D`|`--define` *key*=*value*\]
\[`-p`|`--plugin` *module-name*\]
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

- \[`-h`|`--help`\]:
  Show usage help.

- \[`-V`|`--version`\]:
  Show program version information.

- \[`-e`|`--env` *env-file*\]:
  Load environment file with key/value definitions.
  These can later be accessed with the global `env` variable.

- \[`-c`|`--config` *config-file*\]:
  Load Nunjucks configuration YAML file.

- \[`-C`|`--option` *key*=*value*\]:
  Set Nunjucks configuration option.

- \[`-d`|`--defines` *context-file*\]:
  Load context definition YAML file.
  Can occur multiple times.

- \[`-D`|`--define` *key*=*value*\]:
  Set context definition key/value.
  Can occur multiple times.

- \[`-p`|`--plugin` *module-name*\]:
  Load Nunjucks JavaScript plugin module (installed via NPM).

- \[`-o`|`--output` *output-file*|`-`\]:
  Save output file (or stdout).

- \[`<input-file>`|`-`\]:
  Load input file (or stdin).

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

