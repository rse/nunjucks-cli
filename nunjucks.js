#!/usr/bin/env node
/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

/*  own information  */
const my       = require("./package.json")

/*  internal requirements  */
const fs       = require("node:fs")
const path     = require("node:path")

/*  external requirements  */
const yargs    = require("yargs")
const chalk    = require("chalk")
const jsYAML   = require("js-yaml")
const nunjucks = require("nunjucks")

/*  parse command-line arguments  */
const argv = yargs
    .usage("Usage: nunjucks " +
        "[-h|--help] " +
        "[-V|--version] " +
        "[-c|--config <config-file>] " +
        "[-d|--defines <context-file>] " +
        "[-D|--define <key>=<value>] " +
        "[-e|--extension <module-name>] " +
        "[-o|--output <output-file>|-] " +
        "<input-file>|-")
    .version(false)
    .help("h").alias("h", "help").default("h", false).describe("h", "show usage help")
    .boolean("V").alias("V", "version").describe("V", "show program version information")
    .string("c").nargs("c", 1).alias("c", "config").describe("c", "load Nunjucks configuration YAML file")
    .string("d").nargs("d", 1).alias("d", "defines").describe("d", "load context definition YAML file")
    .string("D").nargs("D", 1).alias("D", "define").describe("D", "set context definition key/value")
    .array("e").nargs("e", 1).alias("e", "extension").describe("e", "load Nunjucks JavaScript extension module")
    .string("o").nargs("o", 1).alias("o", "output").default("o", "-").describe("o", "save output file")
    .strict()
    .showHelpOnFail(true)
    .demand(0)
    .parse(process.argv.slice(2))

/*  handle special version request  */
if (argv.version) {
    console.log(`${my.name} ${my.version} (Node.js ${process.versions.node}, Nunjucks: ${my.dependencies.nunjucks})`)
    console.log(`${my.description}`)
    console.log(`Copyright (c) 2019-2023 ${my.author.name} <${my.author.url}>`)
    console.log(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>`)
    process.exit(0)
}

/*  read input file  */
let input = ""
if (argv._.length !== 1) {
    console.error(chalk.red("nunjucks: ERROR: missing input file"))
    process.exit(1)
}
let inputFile = argv._[0]
if (inputFile === "-") {
    inputFile = "<stdin>"
    process.stdin.setEncoding("utf-8")
    const BUFSIZE = 256
    const buf = Buffer.alloc(BUFSIZE)
    while (true) {
        let bytesRead = 0
        try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE)
        }
        catch (ex) {
            if      (ex.code === "EAGAIN") continue
            else if (ex.code === "EOF")    break
            else                           throw ex
        }
        if (bytesRead === 0)
            break
        input += buf.toString("utf8", 0, bytesRead)
    }
}
else {
    if (!fs.existsSync(inputFile)) {
        console.error(chalk.red(`nunjucks: ERROR: failed to find input file: ${inputFile}`))
        process.exit(1)
    }
    input = fs.readFileSync(inputFile, { encoding: "utf8" })
}

/*  provide context variables for template  */
let context = {}
if (argv.defines) {
    try {
        context = jsYAML.load(fs.readFileSync(argv.defines, { encoding: "utf8" }))
    }
    catch (ex) {
        console.error(chalk.red(`nunjucks: ERROR: failed to load context YAML file: ${ex.toString()}`))
        process.exit(1)
    }
}

/*  expose environment variables to template  */
context.env = process.env

/*  add context defines  */
if (argv.define) {
    if (typeof argv.define === "string")
        argv.define = [ argv.define ]
    argv.define.forEach((define) => {
        let [ , key, val ] = define.match(/^([^=]+)(?:=(.*))?$/)
        if (val === undefined)
            val = true
        context[key] = val
    })
}

/*  determine Nunjucks options  */
let options = {}
if (argv.config) {
    try {
        options = jsYAML.load(fs.readFileSync(argv.config, { encoding: "utf8" }))
    }
    catch (ex) {
        console.error(chalk.red(`nunjucks: ERROR: failed to load options YAML file: ${ex.toString()}`))
        process.exit(1)
    }
}
options = Object.assign({}, {
    autoescape:       true,
    throwOnUndefined: false,
    trimBlocks:       true,
    lstripBlocks:     true,
    watch:            false,
    noCache:          true
}, options)

/*  configure environment  */
const env = nunjucks.configure(inputFile, options)

/*  load external extension files  */
if (typeof argv.extension === "object" && argv.extension instanceof Array) {
    for (let extension of argv.extension) {
        let modpath = path.resolve(extension)
        if (!fs.existsSync(modpath)) {
            try {
                modpath = require.resolve(extension)
            }
            catch (ex) {
                modpath = null
            }
        }
        if (modpath === null) {
            console.error(chalk.red(`nunjucks: ERROR: failed to find extension module: ${extension}`))
            process.exit(1)
        }
        const mod = require(modpath)
        if (!(mod !== null && typeof mod === "function")) {
            console.error(chalk.red(`nunjucks: ERROR: failed to call extension file: ${modpath}`))
            process.exit(1)
        }
        mod(env)
    }
}

/*  render Nunjucks template  */
let output
try {
    output = env.renderString(input, context)
}
catch (ex) {
    console.error(chalk.red(`nunjucks: ERROR: failed to render template: ${ex.toString()}`))
    process.exit(1)
}

/*  write output  */
if (argv.output === "-")
    process.stdout.write(output)
else
    fs.writeFileSync(argv.output, output, { encoding: "utf8" })

/*  die gracefully  */
process.exit(0)

