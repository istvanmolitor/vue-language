<script setup lang="ts">
import { AdminLayout, EditButton, DeleteButton, CreateButton } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { languageService, type Language } from '../../services/languageService'

const router = useRouter()
const languages = ref<Language[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

const columns: Column<Language>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'code', label: 'Kód', sortable: true, width: '100px' },
  { key: 'name', label: 'Név', sortable: true },
  { key: 'enabled', label: 'Engedélyezve', sortable: true, width: '150px' },
]

const fetchLanguages = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true
    const response = await languageService.getAll(params)
    languages.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a nyelvek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteLanguage = async (id: number) => {
  try {
    await languageService.delete(id)
    await fetchLanguages({ page: pagination.value.current_page })
  } catch (error) {
    console.error('Hiba a nyelv törlésekor:', error)
  }
}

const editLanguage = (id: number) => {
  router.push(`/languages/${id}/edit`)
}

onMounted(() => {
  fetchLanguages({
    page: 1,
    sort: 'code',
    direction: 'asc'
  })
})
</script>

<template>
  <AdminLayout pageTitle="Nyelvek">
    <DataTable
      :columns="columns"
      :data="languages"
      :loading="isLoading"
      :pagination="pagination"
      search-placeholder="Keresés kód vagy név alapján..."
      default-sort="code"
      default-direction="asc"
      @fetch="fetchLanguages"
    >
      <template #actions>
        <CreateButton to="/languages/create">Új nyelv</CreateButton>
      </template>

      <template #cell-enabled="{ row }">
        <span v-if="row.enabled" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Aktív
        </span>
        <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
          Inaktív
        </span>
      </template>

      <template #row-actions="{ row }">
        <EditButton @click="editLanguage(row.id!)" />
        <DeleteButton @confirm="deleteLanguage(row.id!)" />
      </template>

      <template #empty>
        Nincs megjeleníthető nyelv.
      </template>
    </DataTable>
  </AdminLayout>
</template>
