const parseBool = (params) => {
    return !(
        params === false ||
        params === 'False' ||
        params === 'false' ||
        params === '0' ||
        params === '' ||
        params === undefined ||
        params === null
    );
};

export { parseBool };
