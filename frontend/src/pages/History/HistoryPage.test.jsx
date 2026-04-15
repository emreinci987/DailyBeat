import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoryPage from './HistoryPage'

const historyMock = vi.fn()

vi.mock('../../services/api', () => ({
    moodAPI: {
        history: (...args) => historyMock(...args),
    },
}))

function renderPage() {
    return render(
        <MemoryRouter>
            <HistoryPage />
        </MemoryRouter>,
    )
}

describe('HistoryPage', () => {
    beforeEach(() => {
        historyMock.mockReset()
        vi.restoreAllMocks()
    })

    it('renders weekly day-by-day counts', async () => {
        historyMock.mockResolvedValue({
            data: {
                weeklyBreakdown: {
                    period: {
                        startDate: '2026-03-30',
                        endDate: '2026-04-05',
                        timezone: 'Europe/Istanbul',
                    },
                    days: [
                        { date: '2026-03-30', dayName: 'Pazartesi', moodCounts: { happy: 3, sad: 2 } },
                        { date: '2026-03-31', dayName: 'Sali', moodCounts: {} },
                        { date: '2026-04-01', dayName: 'Carsamba', moodCounts: {} },
                        { date: '2026-04-02', dayName: 'Persembe', moodCounts: {} },
                        { date: '2026-04-03', dayName: 'Cuma', moodCounts: {} },
                        { date: '2026-04-04', dayName: 'Cumartesi', moodCounts: {} },
                        { date: '2026-04-05', dayName: 'Pazar', moodCounts: {} },
                    ],
                },
            },
        })

        renderPage()

        expect(await screen.findByText('Pazartesi')).toBeInTheDocument()
        expect(screen.getByText('3 Mutlu, 2 Uzgün')).toBeInTheDocument()
    })

    it('shows empty state when no weekly data exists', async () => {
        historyMock.mockResolvedValue({
            data: {
                weeklyBreakdown: {
                    period: { startDate: '2026-03-30', endDate: '2026-04-05', timezone: 'UTC' },
                    days: [],
                },
            },
        })

        renderPage()

        expect(await screen.findByText('Bu hafta için duygu kaydi bulunamadi.')).toBeInTheDocument()
    })

    it('shows error state when request fails', async () => {
        historyMock.mockRejectedValue(new Error('Network error'))

        renderPage()

        expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
    })
})
