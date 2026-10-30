'use strict';

(function () {
  const TYPE_CLASSES = ['text','richtext','json','url','number','boolean','image','image_asset'];

  function applyType(row, value) {
    // Borde izquierdo en la fila
    TYPE_CLASSES.forEach(t => row.classList.remove('type-' + t));
    if (value) row.classList.add('type-' + value);

    // Badge de color en el select
    const select = row.querySelector('select[name$="-block_type"]');
    if (select) {
      TYPE_CLASSES.forEach(t => select.classList.remove('btype-' + t));
      if (value) select.classList.add('btype-' + value);
    }

    // Mostrar/ocultar columna image_asset
    if (value === 'image_asset') {
      row.classList.add('show-asset');
    } else {
      row.classList.remove('show-asset');
    }

    // Actualizar cabecera
    const table = row.closest('table');
    if (table) {
      const header = table.querySelector('thead tr');
      if (header) {
        const anyAsset = table.querySelectorAll('tr.show-asset').length > 0;
        header.classList.toggle('show-asset-header', anyAsset);
      }
    }
  }

  function initRow(row) {
    const select = row.querySelector('select[name$="-block_type"]');
    if (!select) return;
    applyType(row, select.value);
    select.addEventListener('change', () => applyType(row, select.value));
  }

  function initAll() {
    document.querySelectorAll('#blocks-group tbody tr.dynamic-blocks').forEach(initRow);
  }

  document.addEventListener('DOMContentLoaded', initAll);

  // Filas añadidas dinámicamente
  document.addEventListener('formset:added', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('dynamic-blocks')) {
      initRow(e.target);
    }
  });
})();
