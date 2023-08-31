// Wrapper to catch async JS errors, which are not handled by default in Express.
// For an explanation of the nuances of this, see:
// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
// TLDR: If you want to catch an async error during a request, wrap your request
// in this function.
// Otherwise, the async error may occur _after_ the request has completed.

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
