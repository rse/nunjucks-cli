#!/usr/bin/env node
/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2026 Dr. Ralf S. Engelschall <http://engelschall.com>
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
import dotenvx           from "@dotenvx/dotenvx"
import * as findup       from "find-up"
import * as v            from "valibot"

/*  internal requirements  */
import pkg               from "./package.json" with { type: "json" }

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
    path?:             string | string[]
}
type CLIOptions = {
    help:      boolean
    version:   boolean
    env:       string[]
    envs:      boolean
    config:    string
    option:    string[]
    defines:   string[]
    define:    string[]
    plugin:    string[]
    output:    string
    _:         string[]
}

/*  runtime schemas for YAML-loaded shapes  */
const PlainObject = v.custom<Record<string, unknown>>(
    (x) => typeof x === "object" && x !== null && !Array.isArray(x),
    "Expected YAML mapping"
)
const OptionsSchema = v.pipe(PlainObject, v.partial(v.strictObject({
    autoescape:       v.boolean(),
    throwOnUndefined: v.boolean(),
    trimBlocks:       v.boolean(),
    lstripBlocks:     v.boolean(),
    watch:            v.boolean(),
    noCache:          v.boolean(),
    path:             v.union([ v.string(), v.array(v.string()) ])
})))
const ContextSchema = v.pipe(PlainObject, v.record(v.string(), v.any()))

/*  establish asynchronous environment  */
;(async () => {
    /*  load my own information  */
    const my = pkg as PackageInfo

    /*  parse command-line arguments  */
    const program = new Command()
    const reduceArray = (v: string, l: string[]) => l.concat([ v ])
    program.name("nunjucks")
        .description("Nunjucks Template Rendering Command-Line Interface")
        .showHelpAfterError("hint: use option --help for usage information")
        .option("-h, --help",                    "show usage help",                                        false)
        .option("-V, --version",                 "show program version information",                       false)
        .option("-e, --env <env-file>",          "load environment key/value file",           reduceArray, [])
        .option("-E, --envs",                    "load all environment key/value files",                   false)
        .option("-c, --config <config-file>",    "load Nunjucks configuration YAML file",                  "")
        .option("-C, --option <key>=<value>",    "set Nunjucks configuration option",         reduceArray, [])
        .option("-d, --defines <context-file>",  "load context definition YAML file",         reduceArray, [])
        .option("-D, --define <key>=<value>",    "set context definition key/value",          reduceArray, [])
        .option("-p, --plugin <module-name>",    "load Nunjucks JavaScript plugin module",    reduceArray, [])
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
        console.log(`Copyright (c) 2019-2026 ${my.author.name} <${my.author.url}>`)
        console.log(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>`)
        process.exit(0)
    }

    /*  read input file  */
    let input = ""
    if (argv._.length > 1) {
        console.error(chalk.red("nunjucks: ERROR: invalid number of arguments (zero or one input file expected)"))
        process.exit(1)
    }
    let inputFile = argv._[0] ?? "-"
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
                if (ex.code === "EAGAIN") continue
                else                      throw ex
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
            const raw = jsYAML.load(fs.readFileSync(define, { encoding: "utf8" })) ?? {}
            const parsed = v.parse(ContextSchema, raw)
            context = deepmerge(context, parsed)
        }
        catch (ex: any) {
            const msg = ex instanceof v.ValiError ?
                `invalid context YAML file "${define}": ${ex.message}` :
                `failed to load context YAML file: ${ex.toString()}`
            console.error(chalk.red(`nunjucks: ERROR: ${msg}`))
            process.exit(1)
        }
    }

    /*  load environment variables from all default files  */
    if (argv.envs) {
        const files = findup.findUpMultipleSync(".env")
        if (files.length > 0)
            dotenvx.config({ path: files, quiet: true })
    }

    /*  load environment variables from environment files  */
    if (argv.env.length > 0) {
        for (const env of argv.env) {
            if (!fs.existsSync(env)) {
                console.error(chalk.red(`nunjucks: ERROR: environment file not found: "${env}"`))
                process.exit(1)
            }
        }
        dotenvx.config({ path: argv.env, quiet: true })
    }

    /*  expose environment variables to template  */
    context.env = { ...process.env, ...(context.env ?? {}) }

    /*  parse "key=value" pair with default "true"  */
    const parseKV = (s: string): [ string, string ] | null => {
        const m = s.match(/^([^=]+)(?:=(.*))?$/)
        if (!m)
            return null
        const key = m[1]
        if (!key)
            return null
        return [ key, m[2] ?? "true" ]
    }

    /*  coerce string scalar to native type  */
    const coerceScalar = (val: string): any => {
        if      (val === "true")  return true
        else if (val === "false") return false
        else if (val === "null")  return null
        else {
            const n = Number(val)
            if (val.trim() !== "" && Number.isFinite(n))
                return n
            return val
        }
    }

    /*  add context defines  */
    for (const define of argv.define) {
        const kv = parseKV(define)
        if (kv === null)
            continue
        const [ key, val ] = kv
        context[key] = coerceScalar(val)
    }

    /*  determine Nunjucks options  */
    let options: OptionsType = {}
    if (argv.config) {
        try {
            const raw = jsYAML.load(fs.readFileSync(argv.config, { encoding: "utf8" })) ?? {}
            options = raw as OptionsType
        }
        catch (ex: any) {
            console.error(chalk.red(`nunjucks: ERROR: failed to load options YAML file: ${ex.toString()}`))
            process.exit(1)
        }
    }
    for (const option of argv.option) {
        const kv = parseKV(option)
        if (kv === null)
            continue
        const [ key, val ] = kv
        const opts = options as Record<string, any>
        opts[key] = coerceScalar(val)
    }
    try {
        options = v.parse(OptionsSchema, options)
    }
    catch (ex: any) {
        const msg = ex instanceof v.ValiError ?
            `invalid options: ${ex.message}` :
            `failed to validate options: ${ex.toString()}`
        console.error(chalk.red(`nunjucks: ERROR: ${msg}`))
        process.exit(1)
    }
    options = {
        autoescape:       false,
        throwOnUndefined: false,
        trimBlocks:       true,
        lstripBlocks:     true,
        watch:            false,
        noCache:          true,
        ...options
    }

    /*  determine template search path:
        use explicit override via -C path=… if given,
        else the directory of the input file,
        else (for stdin) the current working directory  */
    const { path: pathOption, ...nunjucksOptions } = options
    let searchPath: string | string[]
    if (pathOption !== undefined)
        searchPath = typeof pathOption === "string" ? pathOption.split(path.delimiter) : pathOption
    else if (inputFile === "<stdin>")
        searchPath = "."
    else
        searchPath = path.dirname(inputFile)

    /*  configure environment  */
    const env = nunjucks.configure(searchPath, nunjucksOptions)

    /*  load external plugin modules  */
    const require = createRequire(import.meta.url)
    for (const plugin of argv.plugin) {
        let modpath: string | null
        if (/^(\.\.?\/|\/)/.test(plugin)) {
            modpath = path.resolve(plugin)
            if (!fs.existsSync(modpath))
                modpath = null
        }
        else {
            try {
                modpath = require.resolve(plugin)
            }
            catch (_ex) {
                modpath = null
            }
        }
        if (modpath === null) {
            console.error(chalk.red(`nunjucks: ERROR: failed to find plugin module: ${plugin}`))
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
            console.error(chalk.red(`nunjucks: ERROR: failed to load plugin module: ${ex.toString()}`))
            process.exit(1)
        }
        if (typeof mod !== "function") {
            console.error(chalk.red(`nunjucks: ERROR: failed to call plugin file: "${modpath}"`))
            process.exit(1)
        }
        mod(env)
    }

    /*  render Nunjucks template  */
    let output: string
    try {
        output = await new Promise<string>((resolve, reject) => {
            env.renderString(input, context, (err, res) => {
                if (err) reject(err)
                else     resolve(res ?? "")
            })
        })
    }
    catch (ex: any) {
        console.error(chalk.red(`nunjucks: ERROR: failed to render template: ${ex.toString()}`))
        process.exit(1)
    }

    /*  write output  */
    if (argv.output === "-") {
        if (!process.stdout.write(output))
            await new Promise<void>((resolve) => process.stdout.once("drain", resolve))
    }
    else
        fs.writeFileSync(argv.output, output, { encoding: "utf8" })

    /*  die gracefully  */
    process.exit(0)
})().catch((err: any) => {
    console.error(chalk.red(`nunjucks: ERROR: ${err.toString()}`))
    process.exit(1)
})

