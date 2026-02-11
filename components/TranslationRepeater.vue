<script setup lang="ts">
import { computed } from 'vue'
import type { Language } from '../services/languageService'
import Button from '@admin/components/ui/Button.vue'

const props = defineProps<{
  languages: Language[]
  availableLanguages: Language[]
}>()

const emit = defineEmits<{
  (e: 'add', languageId: number): void
  (e: 'remove', languageId: number): void
}>()

const handleAddLanguage = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const id = parseInt(select.value)
  if (id) {
    emit('add', id)
    select.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-for="lang in languages" :key="lang.id" class="p-4 border rounded-lg bg-slate-50/50 relative group">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase px-2 py-1 bg-slate-200 rounded text-slate-700">
            {{ lang.code }}
          </span>
          <span class="text-sm font-medium text-slate-500">
            {{ lang.name || lang.code }}
          </span>
        </div>

        <Button
          variant="destructive"
          size="sm"
          type="button"
          class="h-8 w-8 p-0"
          @click="emit('remove', lang.id!)"
        >
          <span class="sr-only">Törlés</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </Button>
      </div>
      <div class="space-y-4">
        <slot :language="lang" />
      </div>
    </div>

    <div v-if="availableLanguages.length > 0" class="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-slate-50/30">
      <div class="flex-1">
        <select
          class="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          @change="handleAddLanguage"
        >
          <option value="">Válassz nyelvet a hozzáadáshoz...</option>
          <option v-for="lang in availableLanguages" :key="lang.id" :value="lang.id">
            {{ lang.name }} ({{ lang.code }})
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
