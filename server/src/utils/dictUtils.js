// Get a dictionary key, or a default value.
function getOrDefault(object, key, defaultValue = null) {
    if (!object) {
        return defaultValue;
    }
    if (Object.hasOwnProperty.call(object, key)) {
        return object[key];
    }
    return defaultValue;
}

export { getOrDefault };
