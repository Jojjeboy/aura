<template>
  <div
    class="min-h-screen bg-aura-bg dark:bg-aura-bg-dark p-6 pb-24 transition-colors duration-300"
  >
    <h1 class="text-2xl font-bold text-aura-text dark:text-aura-text-dark mb-6">
      {{ $t('nav_history') }}
    </h1>

    <!-- Lock State -->
    <div
      v-if="settingsStore.pinHash && !authStore.isHistoryUnlocked"
      class="flex flex-col items-center justify-center py-10"
    >
      <PinPad mode="unlock" :error="error" @submit="handleUnlock" @forgot="handleForgot" />
    </div>

    <div v-else>
      <!-- Tab Switcher -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'log'"
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all"
          :class="
            activeTab === 'log'
              ? 'bg-aura-accent text-white shadow-md'
              : 'bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark hover:bg-slate-50 dark:hover:bg-slate-700'
          "
        >
          {{ $t('log_tab') }}
        </button>
        <button
          @click="activeTab = 'calendar'"
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all"
          :class="
            activeTab === 'calendar'
              ? 'bg-aura-accent text-white shadow-md'
              : 'bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark hover:bg-slate-50 dark:hover:bg-slate-700'
          "
        >
          {{ $t('calendar_tab') }}
        </button>
        <button
          @click="activeTab = 'stats'"
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all"
          :class="
            activeTab === 'stats'
              ? 'bg-aura-accent text-white shadow-md'
              : 'bg-white dark:bg-aura-card-dark text-aura-text dark:text-aura-text-dark hover:bg-slate-50 dark:hover:bg-slate-700'
          "
        >
          {{ $t('stats_tab') }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-10 text-aura-muted">{{ $t('loading') }}</div>

      <!-- Log Tab -->
      <div v-else-if="activeTab === 'log'" class="space-y-4">
        <!-- Search Bar -->
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-4 w-4 text-aura-muted group-focus-within:text-aura-accent transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('search_placeholder')"
            class="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-aura-card-dark border border-transparent focus:border-aura-accent/30 rounded-xl text-sm placeholder-aura-muted text-aura-text dark:text-aura-text-dark shadow-soft focus:ring-0 transition-all"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-aura-muted hover:text-aura-accent transition-colors"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="entry in filteredEntries"
            :key="entry.id"
            class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft border border-transparent hover:border-aura-accent/20 transition-all duration-300 overflow-hidden"
          >
            <!-- Header: Date and Moods (Always Visible, Clickable to Toggle) -->
            <div
              @click="entry.id && toggleEntry(entry.id)"
              class="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-aura-accent/5 transition-colors"
            >
              <!-- Chevron Indicator -->
              <div
                class="mt-1 transition-transform duration-300"
                :class="{ 'rotate-180': entry.id && expandedEntries.has(entry.id) }"
              >
                <svg
                  class="w-4 h-4 text-aura-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <div class="flex flex-col flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-2">
                  <span class="text-sm font-bold text-aura-text dark:text-aura-text-dark">
                    {{ formatDate(entry.date) }}
                  </span>
                  <span class="text-[0.65rem] uppercase tracking-wider text-aura-muted font-bold">
                    {{ new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long' }) }}
                  </span>
                </div>

                <!-- Mood Pills -->
                <div class="flex flex-wrap gap-1 justify-start">
                  <span
                    v-for="(mood, idx) in entry.moods"
                    :key="idx"
                    class="px-2.5 py-1 text-[0.65rem] font-bold rounded-full whitespace-nowrap border"
                    :class="[
                      isCustomMood(mood)
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-800/60'
                        : idx === 0
                          ? 'bg-aura-accent text-white border-aura-accent'
                          : 'bg-aura-accent/10 text-aura-accent border-aura-accent/20',
                    ]"
                  >
                    {{ getMoodLabel(mood) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Content: Gratitude, Health & Actions (Collapsible) -->
            <div
              v-if="entry.id && expandedEntries.has(entry.id)"
              class="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-slate-800/30"
              >
                  <!-- Gratitude Section -->
                  <div class="space-y-1.5">
                    <h4
                      class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1 flex items-center gap-1"
                    >
                      <span>✨</span>
                      <span>{{ $t('grateful_prompt') }}</span>
                    </h4>
                    <div class="space-y-1">
                      <p
                        v-for="(g, i) in entry.gratitude.filter((item) => item.trim() !== '')"
                        :key="i"
                        class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed break-words"
                      >
                        <span class="text-aura-accent opacity-50">•</span> {{ g }}
                      </p>
                    </div>
                  </div>

                  <!-- Well Done Section -->
                  <div v-if="entry.wellDone?.some(item => item.trim() !== '')" class="space-y-1.5">
                    <h4
                      class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1 flex items-center gap-1"
                    >
                      <span>✅</span>
                      <span>{{ $t('journal_well_done_label') }}</span>
                    </h4>
                    <div class="space-y-1">
                      <p
                        v-for="(g, i) in entry.wellDone.filter((item) => item.trim() !== '')"
                        :key="i"
                        class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed break-words"
                      >
                        <span class="text-aura-accent opacity-50">•</span> {{ g }}
                      </p>
                    </div>
                  </div>

                  <!-- Improvement Section -->
                  <div v-if="entry.improvement?.some(item => item.trim() !== '')" class="space-y-1.5">
                    <h4
                      class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1 flex items-center gap-1"
                    >
                      <span>🚀</span>
                      <span>{{ $t('journal_improvement_label') }}</span>
                    </h4>
                    <div class="space-y-1">
                      <p
                        v-for="(g, i) in entry.improvement.filter((item) => item.trim() !== '')"
                        :key="i"
                        class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed break-words"
                      >
                        <span class="text-aura-accent opacity-50">•</span> {{ g }}
                      </p>
                    </div>
                  </div>

                <!-- Health Metrics Section -->
                <div class="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 space-y-3">
                  <h4
                    class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-1"
                  >
                    {{ $t('scales.health') }}
                  </h4>

                  <div class="flex items-center justify-between group">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        >🌙</span
                      >
                      <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{
                        $t('scales.sleep')
                      }}</span>
                    </div>
                    <div class="flex gap-0.5">
                      <div
                        v-for="i in 5"
                        :key="i"
                        class="w-1.5 h-1.5 rounded-full"
                        :class="
                          i > (entry.health?.sleep || 0) ? 'bg-slate-200 dark:bg-slate-700' : ''
                        "
                        :style="i <= (entry.health?.sleep || 0) ? getMetricStyle('sleep', i) : {}"
                      ></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between group">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        >🍏</span
                      >
                      <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{
                        $t('scales.food')
                      }}</span>
                    </div>
                    <div class="flex gap-0.5">
                      <div
                        v-for="i in 5"
                        :key="i"
                        class="w-1.5 h-1.5 rounded-full"
                        :class="
                          i > (entry.health?.food || 0) ? 'bg-slate-200 dark:bg-slate-700' : ''
                        "
                        :style="i <= (entry.health?.food || 0) ? getMetricStyle('food', i) : {}"
                      ></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between group">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        >🏃</span
                      >
                      <span class="text-xs font-semibold text-aura-text dark:text-aura-text-dark">{{
                        $t('scales.movement')
                      }}</span>
                    </div>
                    <div class="flex gap-0.5">
                      <div
                        v-for="i in 5"
                        :key="i"
                        class="w-1.5 h-1.5 rounded-full"
                        :class="
                          i > (entry.health?.movement || 0) ? 'bg-slate-200 dark:bg-slate-700' : ''
                        "
                        :style="
                          i <= (entry.health?.movement || 0) ? getMetricStyle('movement', i) : {}
                        "
                      ></div>
                    </div>
                  </div>
                </div>
                <!-- Thoughts Section -->
                <div
                  v-if="entry.thoughts"
                  class="sm:col-span-2 mt-2 pt-4 border-t border-slate-50 dark:border-slate-800/30"
                >
                  <h4
                    class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-black mb-2 flex items-center gap-1"
                  >
                    <span>💭</span>
                    <span>{{ $t('thoughts_label') }}</span>
                  </h4>
                  <p
                    class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed whitespace-pre-wrap"
                  >
                    {{ entry.thoughts }}
                  </p>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="flex justify-end mt-4 gap-1">
                <button
                  @click="confirmDelete(entry)"
                  class="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/5 rounded-full transition-all"
                  :title="$t('delete_entry')"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                    />
                  </svg>
                </button>
                <button
                  @click="handleEdit(entry)"
                  class="w-8 h-8 flex items-center justify-center text-aura-accent hover:bg-aura-accent/5 rounded-full transition-all"
                  :title="$t('edit_entry')"
                >
                  <svg
                    class="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m14.3 4.8 2.9 2.9M7 7H4a1 1 0 0 0-1 1v10c0 .6.4 1 1 1h11c.6 0 1-.4 1-1v-4.5m2.4-10a2 2 0 0 1 0 3l-6.8 6.8L8 14l.7-3.6 6.9-6.8a2 2 0 0 1 2.8 0Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Tab -->
      <div v-else-if="activeTab === 'calendar'">
        <!-- Month Navigation -->
        <div
          class="flex items-center justify-between mb-4 bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-4"
        >
          <button
            @click="prevMonth"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-aura-muted"
            :title="$t('prev_month')"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m15 19-7-7 7-7"
              />
            </svg>
          </button>
          <h2
            class="text-sm font-bold text-aura-text dark:text-aura-text-dark min-w-[120px] text-center capitalize"
          >
            {{ currentMonthName }}
          </h2>
          <button
            @click="nextMonth"
            :disabled="isCurrentMonth"
            class="p-2 rounded-full transition-colors text-aura-muted disabled:opacity-30 disabled:cursor-not-allowed"
            :class="{ 'hover:bg-slate-100 dark:hover:bg-slate-800': !isCurrentMonth }"
            :title="$t('next_month')"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m9 5 7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-4">
          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            <div
              v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
              :key="day"
              class="text-center text-xs font-bold text-aura-muted"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="(dayObj, index) in calendarDays"
              :key="index"
              @click="handleDateClick(dayObj)"
              :disabled="dayObj.isFuture || !dayObj.day"
              class="aspect-square flex items-center justify-center rounded-lg relative transition-all"
              :class="[
                dayObj.day
                  ? dayObj.isFuture
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 text-aura-muted/40 cursor-not-allowed'
                    : dayObj.isToday
                      ? 'bg-aura-accent text-white shadow-md transform scale-110 z-20 font-black'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-aura-text dark:text-aura-text-dark hover:bg-aura-accent/10 dark:hover:bg-aura-accent/20 cursor-pointer'
                  : 'cursor-default',
              ]"
            >
              <span v-if="dayObj.day" class="text-sm z-10">{{ dayObj.day }}</span>
              <div
                v-if="dayObj.hasEntry"
                class="absolute inset-0 rounded-lg border-2 pointer-events-none"
                :class="dayObj.isToday ? 'border-white/40' : 'border-aura-accent'"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Tab -->
      <div
        v-else-if="activeTab === 'stats'"
        class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <!-- Locked State / Motivation -->
        <div
          v-if="entries.length < 10"
          class="bg-white dark:bg-aura-card-dark rounded-card p-10 shadow-soft text-center space-y-6 border-2 border-dashed border-aura-accent/20"
        >
          <div
            class="w-20 h-20 bg-aura-accent/10 rounded-full flex items-center justify-center mx-auto text-aura-accent animate-pulse"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-black text-aura-text dark:text-aura-text-dark">
              {{ $t('stats_locked_title') }}
            </h3>
            <p class="text-sm text-aura-muted max-w-xs mx-auto leading-relaxed">
              {{ $t('stats_locked_desc', { count: 10 - entries.length }) }}
            </p>
          </div>
          <div class="flex justify-center gap-2">
            <div
              v-for="i in 10"
              :key="i"
              class="w-2 h-2 rounded-full transition-colors duration-500"
              :class="i <= entries.length ? 'bg-aura-accent' : 'bg-slate-100 dark:bg-white/5'"
            ></div>
          </div>
        </div>

        <!-- Records Counter -->
        <template v-else>
          <div
            class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft flex items-center justify-between border-l-4 border-aura-accent"
          >
            <div>
              <p class="text-[0.6rem] uppercase tracking-wider text-aura-muted font-bold mb-1">
                {{ $t('consistency') || 'Consistency' }}
              </p>
              <h3 class="text-2xl font-black text-aura-text dark:text-aura-text-dark">
                {{ entries.length }}
                <span class="text-xs font-medium text-aura-muted uppercase">{{
                  $t('stats_entries_recorded')
                }}</span>
              </h3>
            </div>
            <div
              class="w-12 h-12 rounded-full bg-aura-accent/10 flex items-center justify-center text-aura-accent"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Top Feelings -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>🎭</span> {{ $t('stats_feelings_title') }}
              </h4>
              <div class="space-y-3">
                <div v-for="stat in feelingStats" :key="stat.name" class="space-y-1">
                  <div class="flex justify-between text-xs font-bold">
                    <span class="text-aura-text dark:text-aura-text-dark">{{
                      getMoodLabel(stat.name)
                    }}</span>
                    <span class="text-aura-muted">{{ stat.count }}</span>
                  </div>
                  <div
                    class="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      :class="
                        isCustomMood(stat.name)
                          ? 'bg-yellow-400 dark:bg-yellow-500/80'
                          : 'bg-aura-accent'
                      "
                      :style="{ width: `${stat.percentage}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Wins -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>✅</span> {{ $t('journal_well_done_label') }}
              </h4>
              <div class="space-y-3">
                <div v-if="wellDoneCount === 0" class="text-xs text-aura-muted py-4 text-center italic">
                  {{ $t('no_data_yet') || 'No wins recorded yet' }}
                </div>
                <div v-else class="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span class="text-3xl font-black text-aura-accent">{{ wellDoneCount }}</span>
                  <span class="text-[10px] uppercase font-bold text-aura-muted mt-1">{{ $t('stats_total_wins') || 'Total Wins' }}</span>
                </div>
              </div>
            </div>

            <!-- Top Improvements -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>🚀</span> {{ $t('journal_improvement_label') }}
              </h4>
              <div class="space-y-3">
                <div v-if="improvementCount === 0" class="text-xs text-aura-muted py-4 text-center italic">
                  {{ $t('no_data_yet') || 'No improvements recorded yet' }}
                </div>
                <div v-else class="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span class="text-3xl font-black text-aura-accent">{{ improvementCount }}</span>
                  <span class="text-[10px] uppercase font-bold text-aura-muted mt-1">{{ $t('stats_total_improvements') || 'Total Improvements' }}</span>
                </div>
              </div>
            </div>

            <!-- Average Scores -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>📈</span> {{ $t('stats_averages_title') }}
              </h4>
              <div class="space-y-6 pt-2">
                <div
                  v-for="metric in ['sleep', 'food', 'movement'] as const"
                  :key="metric"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{
                      metric === 'sleep' ? '🌙' : metric === 'food' ? '🍏' : '🏃'
                    }}</span>
                    <span class="text-xs font-bold text-aura-muted uppercase tracking-wider">{{
                      $t(`scales.${metric}`)
                    }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex gap-0.5">
                      <div
                        v-for="i in 5"
                        :key="i"
                        class="w-2 h-2 rounded-full"
                        :class="
                          i > Math.round(averageHealth[metric])
                            ? 'bg-slate-100 dark:bg-white/5'
                            : ''
                        "
                        :style="
                          i <= Math.round(averageHealth[metric]) ? getMetricStyle(metric, i) : {}
                        "
                      ></div>
                    </div>
                    <span
                      class="text-lg font-black text-aura-text dark:text-aura-text-dark min-w-[1.5rem] text-right"
                    >
                      {{ averageHealth[metric].toFixed(1) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Statistics: Daily Patterns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Emotion Patterns -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>🗓️</span> {{ $t('stats_common_days_title') }}
              </h4>
              <div class="space-y-4">
                <div
                  v-for="pattern in emotionDayPatterns"
                  :key="pattern.mood"
                  class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl"
                >
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-aura-text dark:text-aura-text-dark">{{
                      getMoodLabel(pattern.mood)
                    }}</span>
                    <span class="text-[10px] text-aura-muted capitalize">
                      {{ $t('stats_most_common_on', { day: getDayName(pattern.bestDay) }) }}
                    </span>
                  </div>
                  <div class="text-aura-accent">
                    <span class="text-lg font-black">{{ pattern.count }}</span>
                    <span class="text-[8px] uppercase font-bold ml-1 opacity-60">times</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Peak Performance Days -->
            <div class="bg-white dark:bg-aura-card-dark rounded-card p-6 shadow-soft space-y-4">
              <h4
                class="text-sm font-bold text-aura-text dark:text-aura-text-dark flex items-center gap-2"
              >
                <span>🏆</span> {{ $t('stats_peak_performance') }}
              </h4>
              <div class="space-y-4">
                <div
                  v-for="metric in ['sleep', 'food', 'movement'] as const"
                  :key="metric"
                  class="flex items-center gap-4"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-xl"
                  >
                    {{ metric === 'sleep' ? '🌙' : metric === 'food' ? '🍏' : '🏃' }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-aura-text dark:text-aura-text-dark">{{
                      $t(`scales.${metric}`)
                    }}</span>
                    <span class="text-[10px] text-aura-accent font-bold capitalize">
                      {{ $t('stats_best_day_is', { day: getDayName(bestHealthDays[metric]) }) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Entry Modal -->
    <div
      v-if="selectedDate"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      @click.self="selectedDate = null"
    >
      <div
        class="bg-white dark:bg-aura-card-dark rounded-card shadow-soft p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-aura-text dark:text-aura-text-dark">
            {{ formatDate(selectedDate) }}
          </h3>
          <button
            @click="selectedDate = null"
            class="text-aura-muted hover:text-aura-text dark:hover:text-aura-text-dark transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- If entry exists -->
        <div v-if="selectedEntry">
          <div class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('mood_prompt') }}</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(mood, idx) in selectedEntry.moods"
                :key="idx"
                class="px-2 py-0.5 text-xs rounded-full border"
                :class="[
                  isCustomMood(mood)
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-800/60'
                    : idx === 0
                      ? 'bg-aura-accent/10 text-aura-accent border-aura-accent/20'
                      : 'bg-aura-accent/5 text-aura-accent/70 border-aura-accent/10',
                ]"
              >
                {{ getMoodLabel(mood) }}
              </span>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('grateful_prompt') }}</h4>
            <div class="space-y-1">
              <p
                v-for="(g, i) in selectedEntry.gratitude.filter((item) => item.trim() !== '')"
                :key="i"
                class="text-sm text-aura-text dark:text-aura-text-dark"
              >
                • {{ g }}
              </p>
            </div>
          </div>
          <div v-if="selectedEntry.wellDone?.some(item => item.trim() !== '')" class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('journal_well_done_label') }}</h4>
            <div class="space-y-1">
              <p
                v-for="(g, i) in selectedEntry.wellDone.filter((item) => item.trim() !== '')"
                :key="i"
                class="text-sm text-aura-text dark:text-aura-text-dark"
              >
                • {{ g }}
              </p>
            </div>
          </div>
          <div v-if="selectedEntry.improvement?.some(item => item.trim() !== '')" class="mb-4">
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('journal_improvement_label') }}</h4>
            <div class="space-y-1">
              <p
                v-for="(g, i) in selectedEntry.improvement.filter((item) => item.trim() !== '')"
                :key="i"
                class="text-sm text-aura-text dark:text-aura-text-dark"
              >
                • {{ g }}
              </p>
            </div>
          </div>
          <div
            v-if="selectedEntry.thoughts"
            class="mb-4 pt-4 border-t border-slate-50 dark:border-slate-800/30"
          >
            <h4 class="text-xs font-bold text-aura-muted mb-2">{{ $t('thoughts_label') }}</h4>
            <p
              class="text-sm text-aura-text dark:text-aura-text-dark leading-relaxed whitespace-pre-wrap"
            >
              {{ selectedEntry.thoughts }}
            </p>
          </div>
          <button
            @click="handleEditFromModal(selectedEntry)"
            class="w-full py-2.5 px-4 bg-aura-accent text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {{ $t('edit_entry') }}
          </button>
          <button
            @click="confirmDelete(selectedEntry)"
            class="w-full mt-3 py-2 text-sm font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            {{ $t('delete_entry') }}
          </button>
        </div>

        <!-- If no entry exists -->
        <div v-else class="text-center py-6">
          <p class="text-aura-muted mb-4">{{ $t('no_entry_for_date') }}</p>
          <button
            @click="handleCreateEntry()"
            class="w-full py-2.5 px-4 bg-aura-accent text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {{ $t('add_entry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AppModal
      :show="showDeleteModal"
      :title="$t('delete_entry')"
      :message="$t('delete_confirm')"
      :confirm-text="$t('delete_entry')"
      :cancel-text="$t('cancel')"
      type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <AppModal
      :show="showResetModal"
      :title="$t('change_pin')"
      :message="$t('reset_pin_confirm_msg') || 'Authenticate with Google to reset your PIN?'"
      :confirm-text="$t('authenticate') || 'Authenticate'"
      :cancel-text="$t('cancel')"
      @confirm="handleForgotConfirm"
      @cancel="showResetModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '@/stores/journal'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import PinPad from '@/components/ui/PinPad.vue'
import { useRouter } from 'vue-router'
import type { JournalEntry } from '@/db'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import AppModal from '@/components/ui/AppModal.vue'
import { AFFECTS } from '@/constants/affects'

const store = useJournalStore()
const router = useRouter()
const { entries, loading } = storeToRefs(store)
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const { t, te } = useI18n()

const formatDate = (dateInput: string | Date): string => {
  const d = new Date(dateInput)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dayBeforeYesterday = new Date()
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

  const dateStr = d.toLocaleDateString()
  const todayStr = today.toLocaleDateString()
  const yesterdayStr = yesterday.toLocaleDateString()
  const dayBeforeYesterdayStr = dayBeforeYesterday.toLocaleDateString()

  if (dateStr === todayStr) return t('page_titles.today')
  if (dateStr === yesterdayStr) return t('page_titles.yesterday')
  if (dateStr === dayBeforeYesterdayStr) return t('page_titles.day_before_yesterday')

  return dateStr
}

const isCustomMood = (moodId: string) => {
  return settingsStore.customMoods.some((m) => m.mood === moodId)
}

// Helper function to translate mood/emotion labels
const getMoodLabel = (moodId: string): string => {
  // Check if it's a primary affect
  const affect = AFFECTS.find((a) => a.id === moodId)
  if (affect) {
    // It's a primary affect, return just the short name
    const name = t(`affects.${moodId}.name`)
    return ((name || '').split('–')[0] || '').trim()
  }

  // It's a related emotion, find which affect it belongs to
  const parentAffect = AFFECTS.find((a) => a.related.includes(moodId))
  if (parentAffect) {
    return t(`affects.${parentAffect.id}.related.${moodId}`)
  }

  // Fallback to legacy translations
  if (te(`emotions.${moodId}`)) {
    return t(`emotions.${moodId}`)
  }

  // Fallback to the mood ID itself
  return moodId
}

const error = ref('')
const activeTab = ref<'log' | 'calendar' | 'stats'>('log')
const selectedDate = ref<Date | null>(null)

// Statistics Calculations
const feelingStats = computed(() => {
  if (entries.value.length === 0) return []

  const counts: Record<string, number> = {}
  entries.value.forEach((entry) => {
    entry.moods.forEach((mood) => {
      counts[mood] = (counts[mood] || 0) + 1
    })
  })

  const total = entries.value.length
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
})

const wellDoneCount = computed(() => {
  return entries.value.reduce((acc, entry) => {
    return acc + (entry.wellDone?.filter(item => item && item.trim().length > 0).length || 0)
  }, 0)
})

const improvementCount = computed(() => {
  return entries.value.reduce((acc, entry) => {
    return acc + (entry.improvement?.filter(item => item && item.trim().length > 0).length || 0)
  }, 0)
})

const filteredEntries = computed(() => {
  if (!searchQuery.value.trim()) return entries.value

  const query = searchQuery.value.toLowerCase()
  return entries.value.filter((entry) => {
    // Check gratitude
    const hasGratitude = entry.gratitude.some((g) => g.toLowerCase().includes(query))
    if (hasGratitude) return true

    // Check well done
    const hasWellDone = entry.wellDone?.some((g) => g.toLowerCase().includes(query))
    if (hasWellDone) return true

    // Check improvements
    const hasImprovement = entry.improvement?.some((g) => g.toLowerCase().includes(query))
    if (hasImprovement) return true

    // Check moods
    const hasMood = entry.moods.some((m) => getMoodLabel(m).toLowerCase().includes(query))
    if (hasMood) return true

    // Check date
    const dateStr = new Date(entry.date).toLocaleDateString().toLowerCase()
    const weekdayStr = new Date(entry.date)
      .toLocaleDateString(undefined, { weekday: 'long' })
      .toLowerCase()
    if (dateStr.includes(query) || weekdayStr.includes(query)) return true

    return false
  })
})

const averageHealth = computed(() => {
  const totals = { sleep: 0, food: 0, movement: 0 }
  if (entries.value.length === 0) return totals

  entries.value.forEach((entry) => {
    totals.sleep += entry.health?.sleep || 0
    totals.food += entry.health?.food || 0
    totals.movement += entry.health?.movement || 0
  })

  const count = entries.value.length
  return {
    sleep: totals.sleep / count,
    food: totals.food / count,
    movement: totals.movement / count,
  }
})

const emotionDayPatterns = computed(() => {
  if (entries.value.length === 0) return []

  // Map of mood -> Map of weekday index -> count
  const moodWeekdayCounts: Record<string, Record<number, number>> = {}

  entries.value.forEach((entry) => {
    const date = new Date(entry.date)
    const day = date.getDay() // 0=Sun, 1=Mon... 6=Sat
    entry.moods.forEach((mood) => {
      if (!moodWeekdayCounts[mood]) moodWeekdayCounts[mood] = {}
      moodWeekdayCounts[mood][day] = (moodWeekdayCounts[mood][day] || 0) + 1
    })
  })

  return Object.entries(moodWeekdayCounts)
    .map(([mood, counts]) => {
      let maxCount = 0
      let bestDay = -1
      Object.entries(counts).forEach(([day, count]) => {
        if (count > maxCount) {
          maxCount = count
          bestDay = Number.parseInt(day)
        }
      })
      return { mood, bestDay, count: maxCount }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3) // Top 3 mood patterns
})

const bestHealthDays = computed(() => {
  if (entries.value.length === 0) return { sleep: -1, food: -1, movement: -1 }

  const metrics = ['sleep', 'food', 'movement'] as const
  // metric -> day -> { sum: number, count: number }
  const dailyAverages: Record<string, Record<number, { sum: number; count: number }>> = {
    sleep: {},
    food: {},
    movement: {},
  }

  entries.value.forEach((entry) => {
    const day = new Date(entry.date).getDay()
    metrics.forEach((m) => {
      const metricMap = dailyAverages[m]
      if (!metricMap) return

      if (!metricMap[day]) metricMap[day] = { sum: 0, count: 0 }
      metricMap[day].sum += entry.health?.[m] || 0
      metricMap[day].count++
    })
  })

  const results: Record<string, number> = {}
  metrics.forEach((m) => {
    let bestDay = -1
    let maxAvg = -1
    const metricMap = dailyAverages[m]
    if (metricMap) {
      Object.entries(metricMap).forEach(([day, data]) => {
        const avg = data.sum / data.count
        if (avg > maxAvg) {
          maxAvg = avg
          bestDay = Number.parseInt(day)
        }
      })
    }
    results[m] = bestDay
  })

  return results as Record<'sleep' | 'food' | 'movement', number>
})

const getDayName = (dayIndex: number) => {
  if (dayIndex === -1) return ''
  // Use a dummy date to get localized day name
  const date = new Date(2024, 0, dayIndex + 7) // Starts from Sunday if dayIndex is 0
  // Adjusting because 2024-01-07 is Sunday
  return date.toLocaleDateString(undefined, { weekday: 'long' })
}
const selectedEntry = ref<JournalEntry | null>(null)
const showDeleteModal = ref(false)
const showResetModal = ref(false)
const entryToDelete = ref<JournalEntry | null>(null)
const searchQuery = ref('')

// Expansion State
const expandedEntries = ref(new Set<string>())
const toggleEntry = (id: string) => {
  if (expandedEntries.value.has(id)) {
    expandedEntries.value.delete(id)
  } else {
    expandedEntries.value.add(id)
  }
}

// Calendar Logic
const currentDate = ref(new Date())

const isCurrentMonth = computed(() => {
  const now = new Date()
  return (
    currentDate.value.getMonth() === now.getMonth() &&
    currentDate.value.getFullYear() === now.getFullYear()
  )
})

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('default', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = []

  // Fill in empty days before the first day of the month
  const startDay = firstDay.getDay()
  // Adjust key to start week on Monday (0 = Sunday in JS, but 1 = Monday is standard here)
  // Standard JS: 0=Sun, 1=Mon... 6=Sat
  // We want to shift so Mon is first.
  // If Sun(0), padding is 6. If Mon(1), padding is 0.
  const padding = startDay === 0 ? 6 : startDay - 1

  for (let i = 0; i < padding; i++) {
    days.push({ day: null, date: null, hasEntry: false, isFuture: false, isToday: false })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toDateString()
    const hasEntry = entries.value.some((e) => new Date(e.date).toDateString() === dateStr)
    const isFuture = date > today
    const isToday = date.toDateString() === today.toDateString()
    days.push({ day: i, date, hasEntry, isFuture, isToday })
  }

  return days
})

const handleDateClick = (dayObj: {
  day: number | null
  date: Date | null
  hasEntry: boolean
  isFuture: boolean
}) => {
  if (!dayObj.day || dayObj.isFuture || !dayObj.date) return

  selectedDate.value = dayObj.date
  const dateStr = dayObj.date.toDateString()
  selectedEntry.value =
    entries.value.find((e) => new Date(e.date).toDateString() === dateStr) || null
}

const handleEditFromModal = (entry: JournalEntry) => {
  selectedDate.value = null
  selectedEntry.value = null
  handleEdit(entry)
}

const handleCreateEntry = () => {
  if (selectedDate.value) {
    const dateStr = selectedDate.value.toISOString()
    selectedDate.value = null
    selectedEntry.value = null
    // Navigate to journal view to create entry for that date
    router.push({ path: '/', query: { date: dateStr } })
  } else {
    router.push('/')
  }
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleUnlock = async (pin: string) => {
  const isValid = await settingsStore.verifyPin(pin)
  if (isValid) {
    authStore.isHistoryUnlocked = true
    error.value = ''
  } else {
    // Shake effect managed by error prop existing generally or we can just show text
    error.value = t('wrong_pin')
    setTimeout(() => (error.value = ''), 2000)
  }
}

const handleForgot = () => {
  showResetModal.value = true
}

const handleForgotConfirm = async () => {
  showResetModal.value = false
  const isSuccess = await authStore.reauthenticate()
  if (isSuccess) {
    await settingsStore.removePin()
    success('App Lock removed!')
    authStore.isHistoryUnlocked = true
  } else {
    toastError('Authentication failed.')
  }
}

const handleEdit = (entry: JournalEntry) => {
  store.editEntry(entry)
  router.push('/')
}

const confirmDelete = (entry: JournalEntry) => {
  entryToDelete.value = entry
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!entryToDelete.value?.id) return
  const deletedId = entryToDelete.value.id
  await store.deleteEntry(deletedId)
  success(t('entry_deleted'))
  showDeleteModal.value = false

  // If we're viewing the same entry in the calendar modal, close it
  if (selectedEntry.value?.id === deletedId) {
    selectedDate.value = null
    selectedEntry.value = null
  }

  entryToDelete.value = null
}

const getMetricStyle = (type: 'sleep' | 'food' | 'movement', val: number) => {
  // Config for colors
  const config = {
    sleep: { h: 199, s: 89, l: 48 }, // Sky-400
    food: { h: 142, s: 69, l: 58 }, // Green-400
    movement: { h: 25, s: 95, l: 53 }, // Orange-400
  }

  const { h, s, l } = config[type]
  // L reduction: 5% per step, total 20% at val 5
  // S increase: 15% more at val 5
  const lightness = l - (val - 1) * ((l * 0.2) / 4)
  const saturation = Math.min(100, s + (val - 1) * (15 / 4))

  return {
    backgroundColor: `hsl(${h}, ${saturation}%, ${lightness}%)`,
    shadowColor: `hsla(${h}, ${saturation}%, ${lightness}%, 0.5)`,
    boxShadow: `0 0 5px hsla(${h}, ${saturation}%, ${lightness}%, 0.5)`,
  }
}

onMounted(() => {
  store.loadEntries()
})
</script>
