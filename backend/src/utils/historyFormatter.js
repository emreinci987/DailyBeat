/**
 * @typedef {import('../models/MoodEntry.js').MoodEntryData} MoodEntryData
 */

/**
 * @typedef {object} ChartData
 * @property {string[]} labels
 * @property {object[]} datasets
 */

/**
 * @typedef {object} HistorySummary
 * @property {number} totalEntries
 * @property {string} period
 * @property {object} moodDistribution
 */

/**
 * Formats raw mood history data for client-side consumption, especially for charts.
 */
export class HistoryFormatter {
    /**
     * Normalizes timestamps in the mood data.
     * @param {MoodEntryData[]} entries - The raw mood entries from the database.
     * @returns {MoodEntryData[]}
     */
    static normalizeTimestamps(entries) {
        return entries.map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp).toISOString(),
        }));
    }

    /**
     * Calculates a summary of the mood history.
     * @param {MoodEntryData[]} entries - The mood entries.
     * @returns {HistorySummary}
     */
    static calculateSummary(entries) {
        const moodDistribution = entries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        return {
            totalEntries: entries.length,
            // Simple period calculation, can be enhanced
            period: entries.length > 0 ? `${new Date(entries[entries.length - 1].timestamp).toLocaleDateString()} - ${new Date(entries[0].timestamp).toLocaleDateString()}` : 'N/A',
            moodDistribution,
        };
    }

    /**
     * Converts mood history to a format compatible with Chart.js or Recharts.
     * @param {MoodEntryData[]} entries - The mood entries, preferably sorted by date.
     * @returns {ChartData}
     */
    static toChartJSFormat(entries) {
        const labels = entries.map(e => new Date(e.timestamp).toLocaleDateString());
        const data = entries.map(e => e.intensity);

        return {
            labels,
            datasets: [
                {
                    label: 'Mood Intensity Over Time',
                    data,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };
    }

    /**
     * Formats the complete mood history response.
     * @param {MoodEntryData[]} entries - The raw mood entries.
     * @returns {{summary: HistorySummary, chartData: ChartData, history: MoodEntryData[]}}
     */
    static formatMoodHistory(entries) {
        const normalizedEntries = this.normalizeTimestamps(entries);
        const sortedEntries = normalizedEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
            summary: this.calculateSummary(sortedEntries),
            chartData: this.toChartJSFormat(sortedEntries),
            history: sortedEntries,
        };
    }
}

export default HistoryFormatter;
