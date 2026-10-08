const { JSONPath } = require("jsonpath-plus");


const resolvePath = (data, path) => {

    if (!path) {
        return undefined;
    }

    try {

        return JSONPath({
            path,
            json: data,
            wrap: false
        });

    } catch (error) {

        throw new Error(
            `JSONPath resolution failed: ${error.message}`
        );
    }
};


const resolveTemplate = (template, data) => {

    if (
        typeof template !== "string"
    ) {
        return template;
    }


    const exactMatch =
        template.match(
            /^\{\{\s*(.*?)\s*\}\}$/
        );


    /*
     * If the entire value is a
     * variable, preserve its
     * original data type.
     *
     * Example:
     *
     * {{user.id}}
     *
     * returns:
     * 123
     *
     * instead of:
     * "123"
     */
    if (exactMatch) {

        const path =
            convertToJSONPath(
                exactMatch[1]
            );

        return resolvePath(
            data,
            path
        );
    }


    /*
     * Replace variables inside
     * normal strings.
     *
     * Example:
     *
     * "Hello {{user.name}}"
     *
     * becomes:
     *
     * "Hello Sruthi"
     */
    return template.replace(
        /\{\{\s*(.*?)\s*\}\}/g,
        (match, expression) => {

            const path =
                convertToJSONPath(
                    expression
                );

            const value =
                resolvePath(
                    data,
                    path
                );

            return value === undefined ||
                value === null
                ? ""
                : String(value);
        }
    );
};


const convertToJSONPath = (
    expression
) => {

    const cleanExpression =
        expression.trim();


    /*
     * Already JSONPath
     *
     * $.user.id
     */
    if (
        cleanExpression.startsWith("$")
    ) {
        return cleanExpression;
    }


    /*
     * Workflow syntax
     *
     * user.id
     *
     * becomes
     *
     * $.user.id
     */
    return `$.${cleanExpression}`;
};


module.exports = {
    resolvePath,
    resolveTemplate
};