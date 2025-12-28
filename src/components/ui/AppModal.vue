<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('cancel')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-slate-500/75 dark:bg-slate-900/80 transition-opacity backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-card bg-white dark:bg-aura-card-dark text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800">
              <div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div :class="['mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10', type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-aura-accent/10 dark:bg-aura-accent/20']">
                    <slot name="icon">
                      <svg v-if="type === 'danger'" class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <svg v-else class="h-6 w-6 text-aura-accent" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </slot>
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-aura-text dark:text-aura-text-dark">{{ title }}</DialogTitle>
                    <div class="mt-2 text-sm text-aura-muted">
                      {{ message }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                <button type="button" :class="['inline-flex w-full justify-center rounded-[2rem] px-6 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all', type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-aura-accent hover:opacity-90']" @click="$emit('confirm')">{{ confirmText }}</button>
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-[2rem] bg-white dark:bg-aura-card-dark px-6 py-2 text-sm font-semibold text-aura-text dark:text-aura-text-dark shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 sm:mt-0 sm:w-auto transition-all" @click="$emit('cancel')">{{ cancelText }}</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type?: 'info' | 'danger'
}>()

defineEmits(['confirm', 'cancel'])
</script>
