(() => {
    const API_BASE = `${window.location.origin}/api`;

    const STORE_ROUTES = {
        clientes: "clientes",
        estoque: "estoque",
        produtos: "produtos",
        vendas: "vendas"
    };

    async function apiRequest(method, route, payload) {
        const res = await fetch(`${API_BASE}/${route}`, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: payload !== undefined ? JSON.stringify(payload) : undefined
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Falha API ${method} ${route}`);
        }

        if (res.status === 204) return null;
        return res.json();
    }

    class ApiTransaction {
        constructor(storeNames) {
            this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
            this._pending = 0;
            this._completed = false;
            this.oncomplete = null;
            this.onerror = null;
        }

        _track(promise, request) {
            this._pending += 1;

            promise
                .then((result) => {
                    if (typeof request.onsuccess === "function") {
                        request.onsuccess({ target: { result } });
                    }
                })
                .catch((error) => {
                    if (typeof request.onerror === "function") {
                        request.onerror(error);
                    }
                    if (typeof this.onerror === "function") {
                        this.onerror(error);
                    }
                    console.error(error);
                })
                .finally(() => {
                    this._pending -= 1;
                    this._tryComplete();
                });
        }

        _tryComplete() {
            if (this._pending !== 0 || this._completed) return;

            setTimeout(() => {
                if (this._pending !== 0 || this._completed) return;
                this._completed = true;
                if (typeof this.oncomplete === "function") {
                    this.oncomplete();
                }
            }, 0);
        }

        objectStore(storeName) {
            const route = STORE_ROUTES[storeName];

            if (!route) {
                throw new Error(`Store nao suportado: ${storeName}`);
            }

            return {
                getAll: () => {
                    const request = { onsuccess: null, onerror: null };
                    this._track(apiRequest("GET", route), request);
                    return request;
                },
                get: (id) => {
                    const request = { onsuccess: null, onerror: null };
                    this._track(apiRequest("GET", `${route}/${id}`), request);
                    return request;
                },
                add: (payload) => {
                    const request = { onsuccess: null, onerror: null };
                    this._track(
                        apiRequest("POST", "local/salvar", {
                            entidade: storeName,
                            acao: "criar",
                            dados: payload
                        }),
                        request
                    );
                    return request;
                },
                put: (payload) => {
                    const request = { onsuccess: null, onerror: null };
                    const id = payload && payload.id;
                    if (!id) {
                        this._track(Promise.reject(new Error("ID obrigatorio para put")), request);
                        return request;
                    }
                    this._track(
                        apiRequest("POST", "local/salvar", {
                            entidade: storeName,
                            acao: "atualizar",
                            id,
                            dados: payload
                        }),
                        request
                    );
                    return request;
                },
                delete: (id) => {
                    const request = { onsuccess: null, onerror: null };
                    this._track(
                        apiRequest("POST", "local/salvar", {
                            entidade: storeName,
                            acao: "remover",
                            id
                        }),
                        request
                    );
                    return request;
                }
            };
        }
    }

    window.db = {
        transaction(storeNames) {
            return new ApiTransaction(storeNames);
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        if (typeof carregarDados === "function") {
            carregarDados();
        }
    });
})();