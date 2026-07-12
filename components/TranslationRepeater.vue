<script setup lang="ts">
import { type Ref, computed, onMounted, ref } from 'vue'
import { languageService, type Language } from '../services/languageService'
import Select from '@admin/components/ui/Select.vue'
import Modal from '@admin/components/ui/Modal.vue'
import Icon from '@admin/components/ui/Icon.vue'
import Button from '@admin/components/ui/button/Button.vue'
import Card from '@admin/components/ui/Card.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import CardContent from '@admin/components/ui/CardContent.vue'

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

const canRemoveLanguage = computed(() => addedLanguages.value.length > 1)

const removeLanguage = (languageId: number): void => {
  if (!canRemoveLanguage.value) return

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
  <Card>
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>Fordítások</CardTitle>
      <Button type="button" @click="isModalOpen = true">
        <Icon name="plus" class="h-4 w-4" />
        Nyelv hozzáadása
      </Button>
    </CardHeader>

    <CardContent class="space-y-4">
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

      <Card v-for="language in addedLanguages" :key="language.id">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>{{ language.name }}</CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            :disabled="!canRemoveLanguage"
            @click="removeLanguage(language.id!)"
          >
            <Icon name="delete" class="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <slot :language="language" :translation="modelValue[language.id!]" />
        </CardContent>
      </Card>
    </CardContent>
  </Card>
</template>
