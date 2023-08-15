/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

const jsonpath = require("jsonpath")

module.exports = (env) => {
    /*  add a "jsonpath" filter  */
    env.addFilter("jsonpath", (obj, path, count) => {
        let result
        const errs = []
        try {
            result = jsonpath.query(obj, path, count)
        }
        catch (err) {
            errs.push(err)
        }
        if (errs.length)
            return errs.join("\n")
        return result
    })
}

