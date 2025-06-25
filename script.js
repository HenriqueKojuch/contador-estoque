document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo'); // Novo elemento
    const itemDescriptionInput = document.getElementById('itemDescription');
    const palletsInput = document.getElementById('pallets');
    const boxesInput = document.getElementById('boxes');
    const unitsInput = document.getElementById('units');
    const addItemButton = document.getElementById('addItem');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const exportCsvButton = document.getElementById('exportCsv');
    const clearAllButton = document.getElementById('clearAll');

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Função auxiliar para obter valor numérico, tratando vazio como 0
    function getNumericValue(inputElement) {
        const value = parseInt(inputElement.value);
        return isNaN(value) || value < 0 ? 0 : value;
    }

    // Função para renderizar a tabela
    function renderInventory() {
        inventoryTableBody.innerHTML = ''; // Limpa a tabela antes de renderizar
        inventory.forEach((item, index) => {
            const row = inventoryTableBody.insertRow();
            row.insertCell(0).textContent = item.codigo; // Novo campo
            row.insertCell(1).textContent = item.description;
            row.insertCell(2).textContent = item.pallets;
            row.insertCell(3).textContent = item.boxesPerPallet;
            row.insertCell(4).textContent = item.unitsPerBox;
            row.insertCell(5).textContent = item.totalUnits;

            const actionsCell = row.insertCell(6); // Ajuste do índice
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Remover';
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = () => removeItem(index);
            actionsCell.appendChild(deleteButton);
        });
        saveInventory(); // Salva no localStorage após renderizar
    }

    // Função para adicionar um item
    addItemButton.addEventListener('click', () => {
        const codigo = codigoInput.value.trim(); // Pega o código
        const description = itemDescriptionInput.value.trim();
        const pallets = getNumericValue(palletsInput);
        const boxes = getNumericValue(boxesInput);
        const units = getNumericValue(unitsInput);

        if (!codigo && !description) { // Ao menos código ou descrição deve existir
            alert('Por favor, preencha o Código ou a Descrição do Item.');
            return;
        }

        const totalUnits = pallets * boxes * units;

        const newItem = {
            codigo: codigo, // Adiciona o código ao objeto
            description: description,
            pallets: pallets,
            boxesPerPallet: boxes,
            unitsPerBox: units,
            totalUnits: totalUnits
        };

        inventory.push(newItem);
        renderInventory(); // Renderiza a tabela com o novo item
        
        // Limpa os campos após adicionar e foca no código para nova entrada
        codigoInput.value = '';
        itemDescriptionInput.value = '';
        palletsInput.value = '0';
        boxesInput.value = '0';
        unitsInput.value = '0';
        codigoInput.focus();
    });

    // Função para remover um item
    function removeItem(index) {
        inventory.splice(index, 1);
        renderInventory();
    }

    // Função para salvar o inventário no localStorage
    function saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    // Função para exportar para CSV
    exportCsvButton.addEventListener('click', () => {
        if (inventory.length === 0) {
            alert('Não há itens para exportar.');
            return;
        }

        // Adiciona a coluna de Código ao cabeçalho CSV
        let csvContent = "Código,Descrição,Paletes,Caixas/Palete,Unidades/Caixa,Total Unidades\n";
        inventory.forEach(item => {
            // Garante que o código seja incluído
            csvContent += `${item.codigo || ''},${item.description},${item.pallets},${item.boxesPerPallet},${item.unitsPerBox},${item.totalUnits}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'contagem_estoque.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Seu navegador não suporta download automático de arquivos. Por favor, copie o conteúdo e cole em um arquivo de texto.');
        }
    });

    // Função para limpar todos os itens
    clearAllButton.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todos os itens do inventário?')) {
            inventory = [];
            renderInventory();
        }
    });

    // --- Lógica para navegação com a tecla Enter ---
    const inputFields = [
        codigoInput,
        itemDescriptionInput,
        palletsInput,
        boxesInput,
        unitsInput
    ];

    inputFields.forEach((field, index) => {
        field.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Impede o comportamento padrão do Enter (ex: envio de formulário)
                if (index < inputFields.length - 1) {
                    inputFields[index + 1].focus(); // Move para o próximo campo
                } else {
                    addItemButton.click(); // Se for o último campo, simula o clique no botão Adicionar
                }
            }
        });
    });

    // Renderiza o inventário inicial ao carregar a página
    renderInventory();
    // Foca no campo de código ao carregar a página
    codigoInput.focus();
});