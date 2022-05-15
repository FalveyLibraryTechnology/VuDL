export const extractFirstMetadataValue = (metadata: Record<string, Array<string>>, field: string, defaultValue: string): string => {
    const values = typeof metadata[field] === "undefined" ? [] : metadata[field];
    return values.length > 0 ? values[0] : defaultValue;
};
