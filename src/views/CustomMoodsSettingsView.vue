<template>
  <div class="pb-24 space-y-8">
    <div class="px-6 space-y-6 pt-6">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="p-2 -ml-2 text-aura-muted hover:text-aura-accent transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark">
          {{ $t('settings_custom_moods') }}
        </h1>
      </div>

      <p class="text-sm text-aura-muted px-2">
        {{ $t('mood_custom_moods_desc') }}
      </p>

      <!-- Custom Moods List -->
      <section class="space-y-4">
        <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-1">
          <div
            v-if="settingsStore.customMoods.length === 0"
            class="p-6 text-center text-sm text-aura-muted italic"
          >
            {{ $t('no_items') }}
          </div>
          <div v-else class="divide-y divide-slate-50 dark:divide-slate-800">
            <div v-for="group in groupedCustomMoods" :key="group.affectId" class="p-4">
              <h3 class="text-[10px] font-bold text-aura-muted uppercase tracking-widest mb-3">
                {{ formatAffectName(group.affectId) }}
              </h3>
              <div class="space-y-2">
                <div
                  v-for="moodItem in group.moods"
                  :key="moodItem.mood"
                  class="flex items-center justify-between group/item"
                >
                  <div class="flex-1 min-w-0 pr-4">
                    <template
                      v-if="editingMood === moodItem.mood && editingAffectId === moodItem.affectId"
                    >
                      <input
                        v-model="moodEditText"
                        @blur="saveMoodEdit"
                        @keydown.enter="saveMoodEdit"
                        @keydown.esc="cancelMoodEdit"
                        ref="moodEditInput"
                        class="w-full bg-slate-50 dark:bg-slate-800/50 border border-aura-accent rounded-lg px-3 py-1 text-sm outline-none"
                      />
                    </template>
                    <span
                      v-else
                      class="text-aura-text dark:text-aura-text-dark font-medium truncate block py-1"
                    >
                      {{ moodItem.mood }}
                    </span>
                  </div>

                  <div
                    class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <button
                      @click="startMoodEdit(moodItem.mood, moodItem.affectId)"
                      class="p-1.5 text-aura-muted hover:text-aura-accent transition-colors"
                      :title="$t('edit')"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="handleRemoveCustomMood(moodItem.mood, moodItem.affectId)"
                      class="p-1.5 text-aura-muted hover:text-red-500 transition-colors"
                      :title="$t('delete')"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7h-12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    <AppModal
      :show="showDeleteModal"
      :title="$t('delete')"
      :message="$t('delete_custom_mood_confirm', { mood: moodToDelete?.mood })"
      :confirm-text="$t('delete')"
      :cancel-text="$t('cancel')"
      type="danger"
      @confirm="confirmRemoveMood"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'
import AppModal from '@/components/ui/AppModal.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const formatAffectName = (id: string) => {
  const name = t(`affects.${id}.name`)
  return ((name || '').split('–')[0] || '').trim()
}

// Custom Mood Management
const editingMood = ref<string | null>(null)
const editingAffectId = ref<string | null>(null)
const moodEditText = ref('')
const moodEditInput = ref<HTMLInputElement | null>(null)

const groupedCustomMoods = computed(() => {
  const groups: Record<string, { mood: string; affectId: string }[]> = {}
  settingsStore.customMoods.forEach((m) => {
    if (!groups[m.affectId]) groups[m.affectId] = []
    groups[m.affectId]!.push(m)
  })
  return Object.entries(groups).map(([affectId, moods]) => ({
    affectId,
    moods,
  }))
})

const startMoodEdit = (mood: string, affectId: string) => {
  editingMood.value = mood
  editingAffectId.value = affectId
  moodEditText.value = mood
  setTimeout(() => {
    moodEditInput.value?.focus()
  }, 0)
}

const saveMoodEdit = async () => {
  if (!editingMood.value || !editingAffectId.value) return
  const newText = moodEditText.value.trim()
  if (newText && newText !== editingMood.value) {
    await settingsStore.updateCustomMood(editingMood.value, newText, editingAffectId.value)
  }
  editingMood.value = null
  editingAffectId.value = null
}

const cancelMoodEdit = () => {
  editingMood.value = null
  editingAffectId.value = null
}

const showDeleteModal = ref(false)
const moodToDelete = ref<{ mood: string; affectId: string } | null>(null)

const handleRemoveCustomMood = (mood: string, affectId: string) => {
  moodToDelete.value = { mood, affectId }
  showDeleteModal.value = true
}

const confirmRemoveMood = async () => {
  if (!moodToDelete.value) return
  await settingsStore.removeCustomMood(moodToDelete.value.mood, moodToDelete.value.affectId)
  showDeleteModal.value = false
  moodToDelete.value = null
}
</script>
