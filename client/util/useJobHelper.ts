const getAgeString = (minutes) => {
    const ageObject = {
        value: minutes,
        timeKey: `minute${minutes > 1 ? "s" : ""}`,
    };
    if (ageObject.value >= 60) {
        ageObject.value = Math.floor(ageObject.value / 60);
        ageObject.timeKey = `hour${ageObject.value > 1 ? "s" : ""}`;
    }
    if (ageObject.value >= 24) {
        ageObject.value = Math.floor(ageObject.value / 24);
        ageObject.timeKey = `day${ageObject.value > 1 ? "s" : ""}`;
    }
    if (ageObject.value >= 7) {
        ageObject.value = Math.floor(ageObject.value / 7);
        ageObject.timeKey = `week${ageObject.value > 1 ? "s" : ""}`;
    }
    if (ageObject.value >= 52) {
        ageObject.value = Math.floor(ageObject.value / 52);
        ageObject.timeKey = `year${ageObject.value > 1 ? "s" : ""}`;
    }
    return `${ageObject.value} ${ageObject.timeKey} old`;
};

export { getAgeString };
