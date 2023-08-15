/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

const moment = require("moment")
const nlib   = require("nunjucks/src/lib")

module.exports = (env) => {
    /*  add a "date" formatting filter  */
    env.addFilter("date", (date, format, ...args) => {
        let result
        const errs = []
        let obj
        try {
            obj = moment(date)
        }
        catch (err) {
            errs.push(err)
        }
        if (obj) {
            try {
                if (obj[format] && nlib.isFunction(obj[format]))
                    result = obj[format](obj, ...args.slice(2))
                else
                    result = obj.format(format)
            }
            catch (err) {
                errs.push(err)
            }
        }
        if (errs.length)
            return errs.join("\n")
        return result
    })
}

