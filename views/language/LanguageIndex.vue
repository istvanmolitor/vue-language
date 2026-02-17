<script setup lang="ts">
import AdminLayout from '@admin/components/layout/DashboardLayout.vue'
import Button from '@admin/components/ui/button/Button.vue'
import Icon from '@admin/components/ui/Icon.vue'
import RowActions from '@admin/components/ui/RowActions.vue'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/DataTable.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
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
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold tracking-tight">Nyelvek</h2>
    </div>

    <DataTable
      :columns="columns"
      :data="languages"
      :loading="isLoading"
      :pagination="pagination"
      :searchable="true"
      search-placeholder="Keresés kód vagy név alapján..."
      default-sort="code"
      default-direction="asc"
      @fetch="fetchLanguages"
    >
      <template #actions>
        <Button @click="router.push('/languages/create')">
          <Icon name="plus" :size="16" class="mr-2" />
          Új nyelv
        </Button>
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
        <RowActions
          @edit="editLanguage(row.id!)"
          @delete="deleteLanguage(row.id!)"
        />
      </template>

      <template #empty>
        Nincs megjeleníthető nyelv.
      </template>
    </DataTable>
  </AdminLayout>
</template>
