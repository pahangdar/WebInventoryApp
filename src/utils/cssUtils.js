// Helper function to convert CSS string to object
export const parseInlineCss = (cssString) => {
    return cssString.split(';').reduce((acc, style) => {
        if (style.trim()) {
            const [property, value] = style.split(':');
            acc[property.trim()] = value.trim();
        }
        return acc;
    }, {});
};


// Helper function to convert kebab-case CSS to camelCase
export const kebabToCamelCase = (str) => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};
  
// Helper function to convert CSS string to JS style object
export const parseInlineJsCss = (cssString) => {
    return cssString.split(';').reduce((acc, style) => {
        if (style.trim()) {
            const [property, value] = style.split(':');
            const camelCaseProperty = kebabToCamelCase(property.trim());
            acc[camelCaseProperty] = value.trim();
        }
        return acc;
    }, {});
};
