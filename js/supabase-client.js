// Cliente simple de Supabase
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.restUrl = `${url}/rest/v1`;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.restUrl}/${endpoint}`, {
                ...options,
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Error ${response.status}: ${error}`);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('Supabase request error:', error);
            throw error;
        }
    }

    // SELECT
    async select(table, options = {}) {
        let endpoint = table;
        const params = new URLSearchParams();

        // Filtros eq (equals)
        if (options.eq) {
            Object.entries(options.eq).forEach(([key, value]) => {
                params.append(key, `eq.${value}`);
            });
        }

        // Ordenamiento
        if (options.order) {
            params.append('order', options.order);
        }

        // Límite
        if (options.limit) {
            params.append('limit', options.limit);
        }

        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }

        return this.request(endpoint);
    }

    // INSERT
    async insert(table, data) {
        const dataArray = Array.isArray(data) ? data : [data];
        return this.request(table, {
            method: 'POST',
            body: JSON.stringify(dataArray)
        });
    }

    // UPDATE
    async update(table, id, data, idField = 'id') {
        return this.request(`${table}?${idField}=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE
    async delete(table, id, idField = 'id') {
        return this.request(`${table}?${idField}=eq.${id}`, {
            method: 'DELETE'
        });
    }

    // Consulta personalizada con joins
    async query(table, select, filters = {}) {
        let endpoint = `${table}?select=${select}`;
        
        Object.entries(filters).forEach(([key, value]) => {
            endpoint += `&${key}=eq.${value}`;
        });

        return this.request(endpoint);
    }
}

// Instancia global del cliente
const supabase = new SupabaseClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);