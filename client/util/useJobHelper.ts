const getAgeObject = (minutes: number) => {
    const ageObject = {
        value: minutes,
        timeKey: `minute${minutes > 1 ? "s" : ""}`,
    };
    if (ageObject.value < 60) {
        return ageObject;
    }
    ageObject.value = Math.floor(ageObject.value / 60);
    ageObject.timeKey = `hour${ageObject.value > 1 ? "s" : ""}`;
    if (ageObject.value < 24) {
        return ageObject;
    }
    ageObject.value = Math.floor(ageObject.value / 24);
    ageObject.timeKey = `day${ageObject.value > 1 ? "s" : ""}`;
    if (ageObject.value < 7) {
        return ageObject;
    }
    ageObject.value = Math.floor(ageObject.value / 7);
    ageObject.timeKey = `week${ageObject.value > 1 ? "s" : ""}`;
    if (ageObject.value < 52) {
        return ageObject;
    }
    ageObject.value = Math.floor(ageObject.value / 52);
    ageObject.timeKey = `year${ageObject.value > 1 ? "s" : ""}`;
    return ageObject;
};

const getAgeString = (minutes: number) => {
    const ageObject = getAgeObject(minutes);
    return `${ageObject.value} ${ageObject.timeKey} old`;
};

export { getAgeString };
