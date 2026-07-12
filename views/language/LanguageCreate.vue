<script setup lang="ts">
import { AdminLayout, Button, Input, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, FormButtons, Label, toastService, LoadingSpinner } from '@admin'
import { useRouter } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import TranslationRepeater from '@language/components/TranslationRepeater.vue'
import { languageService, type Language, type LanguageFormData } from '@language/services/languageService'

const router = useRouter()
const isSaving = ref(false)
const isLoading = ref(true)
const availableLanguages = ref<Language[]>([])
const selectedLanguages = ref<Language[]>([])

const form = reactive<LanguageFormData>({
  code: '',
  enabled: true,
  native_name: '',
  translations: {}
})

const fetchAvailableLanguages = async () => {
  try {
    isLoading.value = true
    const { data } = await languageService.getCreateData()
    availableLanguages.value = data.availableLanguages
    selectedLanguages.value = [...availableLanguages.value]

    selectedLanguages.value.forEach((language) => {
      if (language.id) {
        form.translations[language.id] = { name: '' }
      }
    })
  } catch (error) {
    console.error('Hiba a nyelvek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const handleAddLanguage = (id: number) => {
  const lang = availableLanguages.value.find(l => l.id === id)
  if (lang && !selectedLanguages.value.find(l => l.id === id)) {
    selectedLanguages.value.push(lang)
    form.translations[id] = { name: '' }
  }
}

const handleRemoveLanguage = (id: number) => {
  selectedLanguages.value = selectedLanguages.value.filter(l => l.id !== id)
  delete form.translations[id]
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    const response: any = await languageService.create(form)
    toastService.success('Nyelv sikeresen létrehozva')

    const createdLanguageId = response?.data?.data?.id ?? response?.data?.id ?? response?.id

    if (createdLanguageId !== undefined && createdLanguageId !== null) {
      await router.push({
        name: 'language-edit',
        params: {
          id: String(createdLanguageId),
        },
      })

      return
    }

    router.push('/admin/language')
  } catch (error) {
    console.error('Hiba a nyelv létrehozásakor:', error)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/admin/language')
}

const getTranslation = (id: number) => {
  if (!form.translations[id]) {
    form.translations[id] = { name: '' }
  }
  return form.translations[id]
}

onMounted(() => {
  fetchAvailableLanguages()
})
</script>

<template>
  <AdminLayout pageTitle="Új nyelv">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <Button variant="outline" @click="goBack">Vissza</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Nyelv adatai</CardTitle>
        <CardDescription>Add meg az új nyelv adatait a létrehozáshoz.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="code">Kód (pl. hu, en)</Label>
            <Input id="code" v-model="form.code" placeholder="hu" />
          </div>
          <div class="space-y-2">
            <Label for="native_name">Név (saját nyelven)</Label>
            <Input id="native_name" v-model="form.native_name" placeholder="Magyar" />
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="enabled" v-model="form.enabled" />
          <Label for="enabled">Engedélyezve</Label>
        </div>

        <TranslationRepeater
          :languages="selectedLanguages"
          :available-languages="availableLanguages"
          @add="handleAddLanguage"
          @remove="handleRemoveLanguage"
        >
          <template #default="{ language }">
            <div class="space-y-2" v-if="language.id">
              <Label :for="'lang-' + language.id">Név</Label>
              <Input :id="'lang-' + language.id" v-model="getTranslation(language.id).name" :placeholder="language.name" />
            </div>
          </template>
        </TranslationRepeater>
      </CardContent>
      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="goBack"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
