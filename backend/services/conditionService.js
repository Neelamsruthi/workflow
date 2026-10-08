const evaluateCondition = (
    config,
    input
) => {

    const {
        field,
        operator,
        value
    } = config || {};

    if (!field) {
        throw new Error(
            "Condition field is required"
        );
    }

    const actualValue =
        field
            .split(".")
            .reduce(
                (current, key) =>
                    current?.[key],
                input
            );

    switch (operator) {

        case "equals":
            return String(actualValue) ===
                String(value);

        case "not_equals":
            return String(actualValue) !==
                String(value);

        case "contains":
            return String(actualValue)
                .includes(String(value));

        case "greater_than":
            return Number(actualValue) >
                Number(value);

        case "less_than":
            return Number(actualValue) <
                Number(value);

        default:
            throw new Error(
                `Unsupported condition operator: ${operator}`
            );
    }
};


module.exports = {
    evaluateCondition
};