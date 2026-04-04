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
    static TURKISH_WEEK_DAYS = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];

    /**
     * Accept both createdAt (current model) and timestamp (legacy shape).
     * @param {MoodEntryData} entry
     * @returns {string}
     */
    static resolveTimestamp(entry) {
        return entry.createdAt || entry.timestamp;
    }

    /**
     * Normalizes timestamps in the mood data.
     * @param {MoodEntryData[]} entries - The raw mood entries from the database.
     * @returns {MoodEntryData[]}
     */
    static normalizeTimestamps(entries) {
        const normalized = [];

        for (const entry of entries) {
            const rawTimestamp = this.resolveTimestamp(entry);
            if (!rawTimestamp) continue;

            const parsedDate = rawTimestamp?.toDate instanceof Function
                ? rawTimestamp.toDate()
                : new Date(rawTimestamp);

            if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
                continue;
            }

            normalized.push({
                ...entry,
                timestamp: parsedDate.toISOString(),
            });
        }

        return normalized;
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
            period: entries.length > 0
                ? `${new Date(entries[entries.length - 1].timestamp).toLocaleDateString()} - ${new Date(entries[0].timestamp).toLocaleDateString()}`
                : 'N/A',
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

    static isValidTimeZone(timezone) {
        try {
            Intl.DateTimeFormat('tr-TR', { timeZone: timezone });
            return true;
        } catch (_error) {
            return false;
        }
    }

    static toDateKey(dateInput, timeZone = 'UTC') {
        const parsedDate = new Date(dateInput);
        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const parts = formatter.formatToParts(parsedDate);
        const year = parts.find((part) => part.type === 'year')?.value;
        const month = parts.find((part) => part.type === 'month')?.value;
        const day = parts.find((part) => part.type === 'day')?.value;

        if (!year || !month || !day) {
            return null;
        }

        return `${year}-${month}-${day}`;
    }

    static buildLast7DateKeys(timeZone = 'UTC') {
        const keys = [];
        const seen = new Set();
        let cursor = new Date();

        while (keys.length < 7) {
            const key = this.toDateKey(cursor, timeZone);
            if (key && !seen.has(key)) {
                keys.unshift(key);
                seen.add(key);
            }
            cursor = new Date(cursor.getTime() - 12 * 60 * 60 * 1000);
        }

        return keys;
    }

    static getTurkishDayName(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const weekdayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
        return this.TURKISH_WEEK_DAYS[weekdayIndex];
    }

    static formatWeeklyBreakdown(entries, timeZone = 'UTC') {
        const normalizedEntries = this.normalizeTimestamps(entries);
        const last7DateKeys = this.buildLast7DateKeys(timeZone);
        const keySet = new Set(last7DateKeys);
        const groupedByDay = Object.fromEntries(last7DateKeys.map((key) => [key, []]));

        for (const entry of normalizedEntries) {
            const dayKey = this.toDateKey(entry.timestamp, timeZone);
            if (dayKey && keySet.has(dayKey)) {
                groupedByDay[dayKey].push(entry);
            }
        }

        const days = last7DateKeys.map((dayKey) => {
            const dayEntries = groupedByDay[dayKey].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const moodCounts = dayEntries.reduce((acc, entry) => {
                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                return acc;
            }, {});

            return {
                date: dayKey,
                dayName: this.getTurkishDayName(dayKey),
                totalEntries: dayEntries.length,
                moodCounts,
            };
        });

        return {
            period: {
                startDate: last7DateKeys[0],
                endDate: last7DateKeys[last7DateKeys.length - 1],
                timezone: timeZone,
            },
            days,
        };
    }
}

export default HistoryFormatter;
