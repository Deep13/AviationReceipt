var userId = null;
var domain_url = null;

export const setUser = (userData) => {
    userId = userData;
};

export const getUser = () => {
    return userId;
};

export const setDomain = (url) => {
    domain_url = url;
};
export const getDomain = () => {
    return domain_url;
};