export const convertToDateTimeStringForDB = (date: Date | string | null): string | null => {
    if (date === null) 
        return null;

    if (date instanceof Date){
        return date.toISOString().replace('T', ' ').substring(0, 19);
    }

    return convertToDateTimeStringForDB(new Date(date));
}

export const convertToDateTimeStringForApp = (date: Date | string | null): string | null => {
    if (date === null) 
        return null;

    if (date instanceof Date){
        return date.toISOString();
    }

    return new Date(date).toISOString();
}
