<script setup lang="ts">
import { AdminLayout, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CheckboxField, FormButtons, InputField, toastService, LoadingSpinner } from '@admin'
import TranslationRepeater from '../../components/TranslationRepeater.vue'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, onMounted } from 'vue'
import { languageService, type LanguageFormData } from '../../services/languageService'

const router = useRouter()
const route = useRoute()
const isSaving = ref(false)
const isLoading = ref(true)

const form = reactive<LanguageFormData>({
  code: '',
  enabled: true,
  translations: {}
})

const fetchData = async () => {
  try {
    isLoading.value = true
    const id = route.params.id as string
    const { data } = await languageService.getEditData(id)
    form.code = data.data.code
    form.enabled = data.data.enabled
    form.translations = data.data.translations ?? {}
  } catch (error) {
    console.error('Hiba az adatok betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    const id = route.params.id as string
    await languageService.update(id, form)
    toastService.success('Nyelv sikeresen frissítve')
    router.push('/admin/language')
  } catch (error) {
    console.error('Hiba a nyelv frissítésekor:', error)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/admin/language')
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <AdminLayout pageTitle="Nyelv szerkesztése">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <Button variant="outline" @click="goBack">Vissza</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Nyelv adatai</CardTitle>
        <CardDescription>Módosítsd a nyelv adatait.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <InputField id="code" label="Kód (pl. hu, en)" v-model="form.code" placeholder="hu" />
        <CheckboxField id="enabled" label="Engedélyezve" v-model="form.enabled" />

        <TranslationRepeater v-model="form.translations" :fields="['name']">
          <template #default="{ language, translation }">
            <InputField
              :id="`lang-${language.id}-name`"
              :label="`Név (${language.code})`"
              v-model="translation.name"
            />
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
