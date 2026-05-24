<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button, LoadingSpinner } from '@admin'
import LanguageSelector from './LanguageSelector.vue'
import { languageService, type Language } from '../services/languageService'

type TranslationRecord = Record<string, string>
type TranslationMap = Record<number, TranslationRecord>

const modelValue = defineModel<TranslationMap>({
  default: {},
})

const props = withDefaults(defineProps<{
  fields: string[]
}>(), {
  fields: () => [],
})

defineSlots<{
  default(props: {
    language: Language & { id: number }
    translation: TranslationRecord
    fields: string[]
  }): void
}>()

const availableLanguages = ref<Language[]>([])
const selectedLanguageId = ref<number | null>(null)
const isLoading = ref(true)
const hasInitializedTranslations = ref(false)

const cloneTranslations = (translations: TranslationMap): TranslationMap => {
  return Object.entries(translations).reduce<TranslationMap>((result, [languageId, translation]) => {
    result[Number(languageId)] = { ...translation }
    return result
  }, {})
}

const createEmptyTranslation = (): TranslationRecord => {
  return props.fields.reduce<TranslationRecord>((translation, field) => {
    translation[field] = ''
    return translation
  }, {})
}

const emitTranslations = (translations: TranslationMap): void => {
  modelValue.value = translations
}

const getCurrentTranslations = (): TranslationMap => {
  return modelValue.value ?? {}
}

const getTranslation = (languageId: number): TranslationRecord => {
  return {
    ...createEmptyTranslation(),
    ...(getCurrentTranslations()[languageId] ?? {}),
  }
}

const createTranslationProxy = (languageId: number): TranslationRecord => {
  const translation = getTranslation(languageId)

  return new Proxy(translation, {
    set(target, property, value) {
      target[String(property)] = value === null || value === undefined ? '' : String(value)

      emitTranslations({
        ...cloneTranslations(getCurrentTranslations()),
        [languageId]: {
          ...createEmptyTranslation(),
          ...target,
        },
      })

      return true
    },
  })
}

const selectedLanguages = computed(() => {
  const selectedLanguageIds = new Set(Object.keys(getCurrentTranslations()).map((languageId) => Number(languageId)))

  return availableLanguages.value.filter((language): language is Language & { id: number } => {
    return typeof language.id === 'number' && selectedLanguageIds.has(language.id)
  })
})

const remainingLanguages = computed(() => {
  const selectedLanguageIds = new Set(selectedLanguages.value.map((language) => language.id))

  return availableLanguages.value.filter((language): language is Language & { id: number } => {
    return typeof language.id === 'number' && !selectedLanguageIds.has(language.id)
  })
})

const loadLanguages = async (): Promise<void> => {
  try {
    isLoading.value = true
    const { data } = await languageService.getCreateData()
    availableLanguages.value = data.availableLanguages ?? []

    if (!hasInitializedTranslations.value && Object.keys(getCurrentTranslations()).length === 0 && availableLanguages.value.length > 0) {
      const initialTranslations = availableLanguages.value.reduce<TranslationMap>((translations, language) => {
        if (typeof language.id !== 'number') {
          return translations
        }

        translations[language.id] = createEmptyTranslation()
        return translations
      }, {})

      emitTranslations(initialTranslations)
    }

    hasInitializedTranslations.value = true
  } catch (error) {
    console.error('Hiba a nyelvek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const handleAddLanguage = (languageId: string | number | null): void => {
  const normalizedLanguageId = typeof languageId === 'number' ? languageId : Number(languageId)

  if (!Number.isFinite(normalizedLanguageId) || normalizedLanguageId <= 0) {
    return
  }

  if (selectedLanguages.value.some((language) => language.id === normalizedLanguageId)) {
    return
  }

  emitTranslations({
    ...cloneTranslations(getCurrentTranslations()),
    [normalizedLanguageId]: createEmptyTranslation(),
  })

  selectedLanguageId.value = null
}

const handleRemoveLanguage = (languageId: number): void => {
  const nextTranslations = cloneTranslations(getCurrentTranslations())

  delete nextTranslations[languageId]
  emitTranslations(nextTranslations)
}

onMounted(() => {
  void loadLanguages()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="py-8">
      <LoadingSpinner label="Betoltes..." />
    </div>

    <template v-else>
      <div v-if="remainingLanguages.length > 0" class="flex items-center gap-4 rounded-lg border border-dashed bg-slate-50/30 p-4">
        <div class="flex-1">
          <LanguageSelector
            :model-value="selectedLanguageId"
            :languages="remainingLanguages"
            placeholder="Válassz nyelvet a hozzáadáshoz..."
            @update:model-value="handleAddLanguage"
          />
        </div>
      </div>

      <div v-for="lang in selectedLanguages" :key="lang.id" class="group relative rounded-lg border bg-slate-50/50 p-4">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="rounded bg-slate-200 px-2 py-1 text-xs font-bold uppercase text-slate-700">
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
            @click="handleRemoveLanguage(lang.id)"
          >
            <span class="sr-only">Törlés</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </Button>
        </div>

        <div class="space-y-4">
          <slot
            :language="lang"
            :translation="createTranslationProxy(lang.id)"
            :fields="fields"
          />
        </div>
      </div>
    </template>
  </div>
</template>
