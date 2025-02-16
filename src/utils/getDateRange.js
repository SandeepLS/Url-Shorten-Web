const getDateRange = (days = 7) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }
    return dates.reverse(); // Return in ascending order
};

module.exports = getDateRange;
