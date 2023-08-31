import _ from 'lodash';
import validator from 'validator';

const isPositiveInteger = (number) => {
    return validator.isInt(number + '', {
        min: 0,
    });
};

const isNonEmptyString = (str) => {
    if (_.isString(str)) {
        return !validator.isEmpty(str);
    }
    return false;
};

export { isPositiveInteger, isNonEmptyString };
