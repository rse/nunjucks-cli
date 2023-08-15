/*
**  nunjucks -- Nunjucks Template Rendering Command-Line Interface
**  Copyright (c) 2019-2023 Dr. Ralf S. Engelschall <http://engelschall.com>
**  Licensed under MIT <http://spdx.org/licenses/MIT.html>
*/

module.exports = (env) => {
    /*  add a "set"-like "eval" extension  */
    class EvalExtension {
        constructor () {
            this.tags = [ "eval" ]
        }
        parse (parser, nodes, lexer) {
            const tok = parser.nextToken()
            const args = parser.parseSignature(null, true)
            parser.advanceAfterBlockEnd(tok.value)
            return new nodes.CallExtension(this, "run", args)
        }
        run (context, args) {
            for (const arg in args) {
                if (arg !== "__keywords")
                    /* eslint no-eval: off */
                    context.ctx[arg] = eval(args[arg])
            }
        }
    }
    env.addExtension("EvalExtension", new EvalExtension())
}

