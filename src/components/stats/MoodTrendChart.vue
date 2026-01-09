<template>
  <div class="w-full h-64 relative">
    <Line v-if="entries.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="absolute inset-0 flex items-center justify-center text-aura-muted italic text-sm">
      {{ $t('no_data_yet') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import type { JournalEntry } from '@/db'
import { useI18n } from 'vue-i18n'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  entries: JournalEntry[]
}>()

const { t } = useI18n()

// Mood scoring mapping
const MOOD_SCORES: Record<string, number> = {
  // Primary Affects
  'enjoyment_joy': 10,
  'interest_excitement': 8,
  'surprise_startle': 6,
  'fear_terror': 3,
  'anger_rage': 2,
  'distress_anguish': 2,
  'shame_humiliation': 1,
  'disgust': 2,
  'dissmell': 2,
  // Legacy/Related
  'happiness': 10,
  'love': 10,
  'joy': 10,
  'gratitude': 9,
  'pride': 8,
  'relief': 7,
  'contentment': 8,
  'curiosity': 8,
  'fascination': 8,
  'enthusiasm': 9,
  'flow': 9,
  'sadness': 2,
  'grief': 1,
  'hopelessness': 1,
  'anxiety': 3,
  'panic': 2,
  'irritation': 4,
  'frustration': 4,
  'guilt': 3,
  'embarrassment': 4
}

const getEntryScore = (entry: JournalEntry): number => {
  if (!entry.moods || entry.moods.length === 0) return 5

  const scores = entry.moods.map(m => MOOD_SCORES[m] || 5)
  // Weighted average or just average
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

const chartData = computed(() => {
  // Sort entries by date (ascending) and take last 14
  const sortedEntries = [...props.entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)

  const labels = sortedEntries.map(e => {
    const d = new Date(e.date)
    return `${d.getDate()}/${d.getMonth() + 1}`
  })

  const data = sortedEntries.map(e => getEntryScore(e))

  return {
    labels,
    datasets: [
      {
        label: t('stats_averages_title'),
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderColor: '#7c3aed', // aura-accent
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#7c3aed',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        data
      }
    ]
  }
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context) => {
          return `Score: ${Number(context.raw).toFixed(1)}`
        }
      }
    }
  },
  scales: {
    y: {
      min: 0,
      max: 10,
      grid: {
        display: true,
        color: 'rgba(0,0,0,0.03)'
      },
      ticks: {
        stepSize: 2,
        font: {
          size: 10
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
}
</script>
