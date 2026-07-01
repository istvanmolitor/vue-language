<script setup lang="ts">
import { type Ref, onMounted, ref, watch } from 'vue'
import { languageService, type Language } from '../services/languageService'
import LanguageSelector from './LanguageSelector.vue'

type TranslationRecord = Record<string, string>
type TranslationMap = Record<number, TranslationRecord>

const modelValue = defineModel<TranslationMap>({ default: {} }) as Ref<TranslationMap>

const props = withDefaults(defineProps<{
  fields: string[]
}>(), {
  fields: () => [],
})

interface LanguageData {
  language: Language
  fields: Record<string, string>
}

defineSlots<{
  default(props: { item: LanguageData; update: (field: string, value: string) => void }): void
}>()

const allLanguages = ref<Language[]>([])
const fieldData = ref<LanguageData[]>([])
const selectedLanguageId = ref<number | null>(null)

const translations = (): TranslationMap => modelValue.value as TranslationMap

const updateFieldData = (item: LanguageData, field: string, value: string): void => {
  item.fields = { ...item.fields, [field]: value }

  const languageId = item.language.id!
  modelValue.value = {
    ...translations(),
    [languageId]: {
      ...(translations()[languageId] ?? {}),
      [field]: value,
    },
  } as TranslationMap
}

const hasLanguage = (language: Language): boolean =>
  fieldData.value.some((fd) => fd.language.id === language.id)

const addLanguageFromTranslations = (language: Language): void => {
  if (hasLanguage(language)) return

  const existing = translations()[language.id!] ?? {}
  const fields = Object.fromEntries(props.fields.map((f) => [f, existing[f] ?? '']))
  fieldData.value.push({ language, fields })
}

const addLanguage = (language: Language): void => {
  if (hasLanguage(language)) return

  const fields = Object.fromEntries(props.fields.map((f) => [f, '']))
  fieldData.value.push({ language, fields })
}

defineExpose({ addLanguage })

watch(selectedLanguageId, (id) => {
  if (id === null) return

  const language = allLanguages.value.find((lang) => lang.id === id)
  if (!language) return

  addLanguageFromTranslations(language)
  selectedLanguageId.value = null
})

onMounted(async () => {
  const { data } = await languageService.getOptions()
  allLanguages.value = data.data
})
</script>

<template>
  <div>
    <LanguageSelector v-model="selectedLanguageId" />

    <template v-for="item in fieldData" :key="item.language.id">
      <slot :item="item" :update="(field: string, value: string) => updateFieldData(item, field, value)" />
    </template>

    <pre>
      {{ fieldData }}
    </pre>

  </div>
</template>
