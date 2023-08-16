/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

module.exports = (env) => {
    /*  add a "pad" formatting filter  */
    env.addFilter("pad", (input, num, char = " ", toRight = false) => {
        if (typeof input !== "string") {
            if (typeof input.toString === "function")
                input = input.toString()
            else
                input = input + ''
        }
        let result = input
        if (result.length < num) {
            const pad = (new Array(num - result.length + 1)).join(char)
            result = toRight ? result + pad : pad + result
        }
        return result
    })
}

