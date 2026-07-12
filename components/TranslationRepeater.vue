<script setup lang="ts">
import { type Ref, computed, onMounted, ref } from 'vue'
import { languageService, type Language } from '../services/languageService'
import Select from '@admin/components/ui/Select.vue'
import Modal from '@admin/components/ui/Modal.vue'
import Button from '@admin/components/ui/button/Button.vue'

type TranslationRecord = Record<string, string>
type TranslationMap = Record<number, TranslationRecord>

const modelValue = defineModel<TranslationMap>({ default: () => ({}) }) as Ref<TranslationMap>

const props = defineProps<{
  fields: string[]
}>()

defineSlots<{
  default(props: { language: Language; translation: TranslationRecord }): void
}>()

const allLanguages = ref<Language[]>([])
const isModalOpen = ref(false)

const addedLanguages = computed<Language[]>(() =>
  allLanguages.value.filter((language) => language.id !== undefined && language.id in modelValue.value)
)

const availableLanguages = computed<Language[]>(() =>
  allLanguages.value.filter((language) => language.id !== undefined && !(language.id in modelValue.value))
)

const availableLanguageOptions = computed(() => availableLanguages.value as unknown as Array<Record<string, unknown>>)

const createEmptyTranslation = (): TranslationRecord =>
  Object.fromEntries(props.fields.map((field) => [field, '']))

const addLanguage = (languageId: number | null): void => {
  if (languageId === null || languageId in modelValue.value) return

  modelValue.value[languageId] = createEmptyTranslation()
}

const handleSelectLanguage = (languageId: string | number | null): void => {
  addLanguage(languageId === null ? null : Number(languageId))
  isModalOpen.value = false
}

const removeLanguage = (languageId: number): void => {
  delete modelValue.value[languageId]
}

onMounted(async () => {
  const { data } = await languageService.getForSelect()
  allLanguages.value = data.data

  if (Object.keys(modelValue.value).length === 0) {
    const { data: defaultLanguage } = await languageService.getDefault()
    addLanguage(defaultLanguage.data.id ?? null)
  }
})
</script>

<template>
  <div class="space-y-4">
    <Button type="button" @click="isModalOpen = true">Nyelv hozzáadása</Button>

    <Modal :show="isModalOpen" title="Nyelv kiválasztása" @close="isModalOpen = false">
      <Select
        :model-value="null"
        :options="availableLanguageOptions"
        label-field="name"
        value-field="id"
        placeholder="Válassz nyelvet..."
        @update:model-value="handleSelectLanguage"
      />
    </Modal>

    <div v-for="language in addedLanguages" :key="language.id" class="space-y-2 border-t pt-4">
      <div class="flex items-center justify-between">
        <span class="font-medium">{{ language.name }}</span>
        <Button type="button" variant="ghost" size="sm" @click="removeLanguage(language.id!)">Eltávolítás</Button>
      </div>

      <slot :language="language" :translation="modelValue[language.id!]" />
    </div>
  </div>
</template>
