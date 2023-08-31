import _ from 'lodash';

/*
Convert an object or array's fields into camelcase, recursively.
Used as a convenience to transform between the SQL snake_case convention
and the JS camelCase convention for object fields.
From https://stackoverflow.com/a/59771233
*/
const toCamelCase = (obj) =>
    _.transform(obj, (acc, value, key, target) => {
        const camelKey = _.isArray(target) ? key : _.camelCase(key);

        acc[camelKey] = _.isObject(value) ? toCamelCase(value) : value;
    });

export default toCamelCase;
