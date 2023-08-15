/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

module.exports = (env) => {
    const globals = {
        bool: (val) => {
            if      (typeof val === "undefined") return false
            else if (typeof val === "boolean")   return val
            else if (typeof val === "number")    return !isNaN(val) && val !== 0
            else if (typeof val === "string")    return val.match(/^(?:true|yes)$/i) !== null
            else                                 return !!val
        },
        int: (val) => {
            if      (typeof val === "undefined") return NaN
            else if (typeof val === "boolean")   return val ? 1 : 0
            else if (typeof val === "number")    return val
            else if (typeof val === "string")    return parseInt(val, 10)
            else                                 return 0
        },
        float: (val) => {
            if      (typeof val === "undefined") return NaN
            else if (typeof val === "boolean")   return val ? 1.0 : 0.0
            else if (typeof val === "number")    return val
            else if (typeof val === "string")    return parseFloat(val)
            else                                 return 0.0
        },
        string: (val) => {
            if      (typeof val === "undefined") return "undefined"
            else if (typeof val === "boolean")   return val.toString()
            else if (typeof val === "number")    return val.toString()
            else if (typeof val === "string")    return val
            else                                 return val.toString()
        },
        default: (val, def, type) => {
            if (val === undefined)
                val = def
            if      (type === "bool")   val = globals.bool(val)
            else if (type === "int")    val = globals.int(val)
            else if (type === "float")  val = globals.float(val)
            else if (type === "string") val = globals.string(val)
            else throw new Error(`invalid coercion type "${type}"`)
            return val
        }
    }
    Object.keys(globals).forEach((name) => {
        env.addGlobal(name, globals[name])
    })
}

