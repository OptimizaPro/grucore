/**
 * Inline delete UX — reemplaza el checkbox de eliminación por un ícono trash
 * con confirmación modal antes de marcar la fila para eliminación.
 */
(function () {
    const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;

    // ── Modal de confirmación ─────────────────────────────────────────────────

    function createModal() {
        const overlay = document.createElement('div');
        overlay.id = 'inline-delete-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:9999',
            'display:flex', 'align-items:center', 'justify-content:center',
            'background:rgba(0,0,0,0.6)', 'backdrop-filter:blur(2px)',
            'opacity:0', 'transition:opacity 0.15s',
        ].join(';');

        const box = document.createElement('div');
        box.style.cssText = [
            'background:#1e293b',
            'border:1px solid #334155',
            'border-radius:0.75rem',
            'padding:1.5rem',
            'width:360px',
            'max-width:90vw',
            'box-shadow:0 20px 60px rgba(0,0,0,0.5)',
            'transform:scale(0.95)',
            'transition:transform 0.15s',
        ].join(';');

        box.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
                <span style="display:flex;align-items:center;justify-content:center;
                    width:36px;height:36px;border-radius:50%;
                    background:rgba(239,68,68,0.15);color:#ef4444;flex-shrink:0;">
                    ${TRASH_SVG}
                </span>
                <div>
                    <p style="margin:0;font-size:0.9375rem;font-weight:600;color:#f1f5f9;">
                        ¿Eliminar registro?
                    </p>
                    <p id="inline-delete-label" style="margin:0.2rem 0 0;font-size:0.8125rem;color:#94a3b8;"></p>
                </div>
            </div>
            <p style="margin:0 0 1.25rem;font-size:0.8125rem;color:#64748b;line-height:1.5;">
                Esta acción se aplicará al guardar el formulario.
            </p>
            <div style="display:flex;gap:0.625rem;justify-content:flex-end;">
                <button id="inline-delete-cancel" type="button" style="
                    background:transparent;border:1px solid #334155;color:#94a3b8;
                    border-radius:0.375rem;padding:0.4rem 1rem;font-size:0.8125rem;
                    cursor:pointer;transition:border-color 0.15s,color 0.15s;">
                    Cancelar
                </button>
                <button id="inline-delete-confirm" type="button" style="
                    background:#ef4444;border:none;color:#fff;
                    border-radius:0.375rem;padding:0.4rem 1rem;font-size:0.8125rem;
                    font-weight:600;cursor:pointer;transition:background 0.15s;">
                    Eliminar
                </button>
            </div>`;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Animación de entrada
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            box.style.transform = 'scale(1)';
        });

        return { overlay, box };
    }

    function showConfirm(label, onConfirm) {
        const { overlay } = createModal();
        document.getElementById('inline-delete-label').textContent = label;

        function close() {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 150);
        }

        document.getElementById('inline-delete-cancel').addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        document.getElementById('inline-delete-confirm').addEventListener('click', () => {
            onConfirm();
            close();
        });

        // ESC para cerrar
        function onKey(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
        }
        document.addEventListener('keydown', onKey);
    }

    // ── Upgrade de celdas de eliminación ─────────────────────────────────────

    function getRowLabel(row) {
        // Toma el texto del primer input de la fila como identificador
        const input = row.querySelector('td:first-child input, td input[type="text"]');
        return input && input.value ? input.value : 'este registro';
    }

    function upgradeDeleteCells() {
        document.querySelectorAll('[id$="-group"] table tbody tr').forEach(row => {
            const lastTd = row.querySelector('td:last-child');
            if (!lastTd) return;

            const checkbox = lastTd.querySelector('input[type="checkbox"]');
            if (!checkbox || lastTd.dataset.trashUpgraded) return;

            checkbox.style.display = 'none';
            lastTd.dataset.trashUpgraded = '1';
            lastTd.style.cssText += ';text-align:center;vertical-align:middle;';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = TRASH_SVG;
            btn.title = 'Eliminar al guardar';
            btn.style.cssText = [
                'background:rgb(15 23 42)',
                'border:1px solid rgb(51 65 85)',
                'border-radius:0.375rem',
                'cursor:pointer',
                'color:#64748b',
                'padding:0.35rem 0.5rem',
                'display:inline-flex',
                'align-items:center',
                'justify-content:center',
                'transition:color 0.15s, border-color 0.15s',
            ].join(';');

            if (checkbox.checked) applyDeletedStyle(row, btn);

            btn.addEventListener('mouseenter', () => {
                if (!checkbox.checked) {
                    btn.style.color = '#ef4444';
                    btn.style.borderColor = '#ef4444';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (!checkbox.checked) {
                    btn.style.color = '#64748b';
                    btn.style.borderColor = 'rgb(51 65 85)';
                }
            });

            btn.addEventListener('click', () => {
                if (checkbox.checked) {
                    // Desmarcar no necesita confirmación
                    checkbox.checked = false;
                    removeDeletedStyle(row, btn);
                } else {
                    showConfirm(getRowLabel(row), () => {
                        checkbox.checked = true;
                        applyDeletedStyle(row, btn);
                    });
                }
            });

            lastTd.appendChild(btn);
        });
    }

    function applyDeletedStyle(row, btn) {
        row.style.opacity = '0.4';
        row.style.textDecoration = 'line-through';
        btn.style.color = '#ef4444';
        btn.style.borderColor = '#ef4444';
        btn.title = 'Cancelar eliminación';
    }

    function removeDeletedStyle(row, btn) {
        row.style.opacity = '';
        row.style.textDecoration = '';
        btn.style.color = '#64748b';
        btn.style.borderColor = 'rgb(51 65 85)';
        btn.title = 'Eliminar al guardar';
    }

    document.addEventListener('DOMContentLoaded', upgradeDeleteCells);

    document.addEventListener('click', e => {
        if (e.target.closest('a[id$="-add"]') || e.target.closest('[data-inline-formset]')) {
            setTimeout(upgradeDeleteCells, 100);
        }
    });

    const observer = new MutationObserver(() => upgradeDeleteCells());
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[id$="-group"]').forEach(group => {
            observer.observe(group, { childList: true, subtree: true });
        });
    });
})();
