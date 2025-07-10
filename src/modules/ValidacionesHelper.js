class ValidacionesHelper {
    getIntegerOrDefault = (value, defaultValue) => {
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) ? defaultValue : parsedValue;
    };
    getDateOrDefault = (value, defaultValue) => {
        const parsedDate = new Date(value);
        return isNaN(parsedDate.getTime()) ? defaultValue : parsedDate;
    };
    getStringOrDefault = (value, defaultValue) => {
        return value == null ? defaultValue : value;
    };
    getBooleanOrDefault = (value, defaultValue) => {
        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (lowerValue === 'true') return true;
            if (lowerValue === 'false') return false;
        }
        return defaultValue;
    };
    isEmail = (value) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return typeof value === 'string' && emailPattern.test(value);
    };
}
export default new ValidacionesHelper();
