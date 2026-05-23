<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@admin'
import LanguageSelector from './LanguageSelector.vue'

interface TranslationLanguage {
  id?: number
  code: string
  name?: string
}

const props = defineProps<{
  languages: TranslationLanguage[]
  availableLanguages: TranslationLanguage[]
}>()

const remainingLanguages = computed(() => {
  const selectedLanguageIds = new Set(props.languages.map((language) => language.id).filter((id): id is number => id !== undefined))

  return props.availableLanguages.filter((language) => !selectedLanguageIds.has(language.id ?? -1))
})

const selectedLanguageId = ref<number | null>(null)

const emit = defineEmits<{
  (e: 'add', languageId: number): void
  (e: 'remove', languageId: number): void
}>()

const handleAddLanguage = (languageId: string | number | null) => {
  const normalizedLanguageId = typeof languageId === 'number' ? languageId : Number(languageId)

  if (!Number.isFinite(normalizedLanguageId) || normalizedLanguageId <= 0) {
    return
  }

  emit('add', normalizedLanguageId)
  selectedLanguageId.value = null
}
</script>

<template>
  <div class="space-y-6">

    <div v-if="remainingLanguages.length > 0" class="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-slate-50/30">
      <div class="flex-1">
        <LanguageSelector
          :model-value="selectedLanguageId"
          :languages="remainingLanguages"
          placeholder="Válassz nyelvet a hozzáadáshoz..."
          @update:model-value="handleAddLanguage"
        />
      </div>
    </div>

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
  </div>
</template>
