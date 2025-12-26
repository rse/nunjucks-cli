#!/usr/bin/env node
/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2025 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

/*  built-in requirements  */
import fs                from "node:fs"
import path              from "node:path"
import { createRequire } from "node:module"

/*  external requirements  */
import { Command }       from "commander"
import chalk             from "chalk"
import jsYAML            from "js-yaml"
import nunjucks          from "nunjucks"
import deepmerge         from "deepmerge"

/*  type definitions  */
type PackageInfo = {
    name:         string
    version:      string
    description:  string
    author:       { name: string; email: string; url: string }
    license:      string
    dependencies: { nunjucks: string }
}
type ContextType = Record<string, any>
type OptionsType = {
    autoescape?:       boolean
    throwOnUndefined?: boolean
    trimBlocks?:       boolean
    lstripBlocks?:     boolean
    watch?:            boolean
    noCache?:          boolean
}
type CLIOptions = {
    help:      boolean
    version:   boolean
    config:    string
    option:    string[]
    defines:   string[]
    define:    string[]
    extension: string[]
    output:    string
    _:         string[]
}

/*  load my own information  */
const my: PackageInfo = JSON.parse(await fs.promises.readFile(new URL("./package.json", import.meta.url), "utf-8"))

/*  parse command-line arguments  */
const program = new Command()
const reduceArray = (v: string, l: string[]) => l.concat([ v ])
program.name("nunjucks")
    .description("Nunjucks Template Rendering Command-Line Interface")
    .showHelpAfterError("hint: use option --help for usage information")
    .option("-h, --help",                    "show usage help",                                        false)
    .option("-V, --version",                 "show program version information",                       false)
    .option("-c, --config <config-file>",    "load Nunjucks configuration YAML file",                  "")
    .option("-C, --option <key>=<value>",    "set Nunjucks configuration option",         reduceArray, [])
    .option("-d, --defines <context-file>",  "load context definition YAML file",         reduceArray, [])
    .option("-D, --define <key>=<value>",    "set context definition key/value",          reduceArray, [])
    .option("-e, --extension <module-name>", "load Nunjucks JavaScript extension module", reduceArray, [])
    .option("-o, --output <output-file>",    "save output file",                                       "-")
    .argument("[<input-file>]", "input file")
program.parse(process.argv)
const argv: CLIOptions = {
    ...program.opts(),
    _: program.args
} as CLIOptions

/*  handle special help request  */
if (argv.help) {
    console.log(program.helpInformation())
    console.log("Example:\n  $ echo \"Hello, {{ who }}!\" | nunjucks -Dwho=World -\n")
    process.exit(0)
}

/*  handle special version request  */
if (argv.version) {
    console.log(`${my.name} ${my.version} (Node.js ${process.versions.node}, Nunjucks: ${my.dependencies.nunjucks})`)
    console.log(`${my.description}`)
    console.log(`Copyright (c) 2019-2025 ${my.author.name} <${my.author.url}>`)
    console.log(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>`)
    process.exit(0)
}

/*  read input file  */
let input = ""
if (argv._.length > 1) {
    console.error(chalk.red("nunjucks: ERROR: invalid number of arguments (zero or one input file expected)"))
    process.exit(1)
}
let inputFile: string = argv._[0] ?? "-"
if (inputFile === "-") {
    inputFile = "<stdin>"
    process.stdin.setEncoding("utf-8")
    const BUFSIZE = 256
    const buf = Buffer.alloc(BUFSIZE)
    while (true) {
        let bytesRead = 0
        try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
        }
        catch (ex: any) {
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
        console.error(chalk.red(`nunjucks: ERROR: failed to find input file: "${inputFile}"`))
        process.exit(1)
    }
    input = fs.readFileSync(inputFile, { encoding: "utf8" })
}

/*  provide context variables for template  */
let context: ContextType = {}
for (const define of argv.defines) {
    try {
        context = deepmerge(context, jsYAML.load(fs.readFileSync(define, { encoding: "utf8" })) as ContextType)
    }
    catch (ex: any) {
        console.error(chalk.red(`nunjucks: ERROR: failed to load context YAML file: ${ex.toString()}`))
        process.exit(1)
    }
}

/*  expose environment variables to template  */
context.env = process.env

/*  add context defines  */
argv.define.forEach((define: string) => {
    const match = define.match(/^([^=]+)(?:=(.*))?$/)
    if (!match)
        return
    let [ , key, val ]: (string | undefined)[] = match
    if (!key)
        return
    if (val === undefined)
        val = "true"
    context[key] = val
})

/*  determine Nunjucks options  */
let options: OptionsType = {}
if (argv.config) {
    try {
        options = jsYAML.load(fs.readFileSync(argv.config, { encoding: "utf8" })) as OptionsType
    }
    catch (ex: any) {
        console.error(chalk.red(`nunjucks: ERROR: failed to load options YAML file: ${ex.toString()}`))
        process.exit(1)
    }
}
if (argv.option.length > 0)
    options = Object.assign(options, argv.option)
options = {
    autoescape:       false,
    throwOnUndefined: false,
    trimBlocks:       true,
    lstripBlocks:     true,
    watch:            false,
    noCache:          true,
    ...options
}

/*  configure environment  */
const env = nunjucks.configure(inputFile, options)

/*  load external extension files  */
for (const extension of argv.extension) {
    let modpath: string | null = path.resolve(extension)
    if (!fs.existsSync(modpath)) {
        try {
            const require = createRequire(import.meta.url)
            modpath = require.resolve(extension)
        }
        catch (_ex) {
            modpath = null
        }
    }
    if (modpath === null) {
        console.error(chalk.red(`nunjucks: ERROR: failed to find extension module: ${extension}`))
        process.exit(1)
    }

    /*  dynamically import the module  */
    let mod: any
    try {
        mod = await import(modpath)

        /*  handle both default and named exports  */
        mod = mod.default ?? mod
    }
    catch (ex: any) {
        console.error(chalk.red(`nunjucks: ERROR: failed to load extension module: ${ex.toString()}`))
        process.exit(1)
    }
    if (!(mod !== null && typeof mod === "function")) {
        console.error(chalk.red(`nunjucks: ERROR: failed to call extension file: "${modpath}"`))
        process.exit(1)
    }
    mod(env)
}

/*  render Nunjucks template  */
let output: string
try {
    output = env.renderString(input, context)
}
catch (ex: any) {
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

