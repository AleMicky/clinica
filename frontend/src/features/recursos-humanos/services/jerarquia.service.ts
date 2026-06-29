import { api } from '../../../shared/api/axios'
import type { ApiResponse } from '../../../shared/types/api-response.types'
import { unwrap } from '../../../shared/utils/helper'
import type { JerarquiaOrganizacional, JerarquiaQuery } from '../types/jerarquia.types'

const ROOT = '/api/recursos-humanos/jerarquia'

export class JerarquiaService {
    async get(query: JerarquiaQuery = {}) {
        const { data } = await api.get<ApiResponse<JerarquiaOrganizacional>>(ROOT, {
            params: query,
        })
        return unwrap(data)
    }
}

export const jerarquiaService = new JerarquiaService()
