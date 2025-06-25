document.addEventListener('DOMContentLoaded', () => {
    const codigoInput = document.getElementById('codigo');
    const palletsInput = document.getElementById('pallets');
    const boxesInput = document.getElementById('boxes');
    const unitsInput = document.getElementById('units');
    const addItemButton = document.getElementById('addItem');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const exportCsvButton = document.getElementById('exportCsv');
    const clearAllButton = document.getElementById('clearAll');

    // Elementos para o scanner de código de barras
    const scannerVideo = document.getElementById('scannerVideo');
    const startScannerButton = document.getElementById('startScanner');
    const stopScannerButton = document.getElementById('stopScanner');
    const scannerMessage = document.getElementById('scannerMessage');

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    let codeReader = null; // Instância do leitor de código de barras

    // Função auxiliar para obter valor numérico, tratando vazio como 0
    function getNumericValue(inputElement) {
        const value = parseInt(inputElement.value);
        // Retorna 0 se for NaN, negativo ou vazio, caso contrário retorna o valor
        return isNaN(value) || value < 0 || inputElement.value.trim() === '' ? 0 : value;
    }

    // Função para renderizar a tabela
    function renderInventory() {
        inventoryTableBody.innerHTML = ''; // Limpa a tabela antes de renderizar
        inventory.forEach((item, index) => {
            const row = inventoryTableBody.insertRow();
            row.insertCell(0).textContent = item.codigo;
            row.insertCell(1).textContent = item.pallets;
            row.insertCell(2).textContent = item.boxesPerPallet;
            row.insertCell(3).textContent = item.unitsPerBox;

            const actionsCell = row.insertCell(4); // Ajuste do índice
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
        const codigo = codigoInput.value.trim();
        const pallets = getNumericValue(palletsInput);
        const boxes = getNumericValue(boxesInput);
        const units = getNumericValue(unitsInput);

        if (!codigo) { // Código é o único campo obrigatório agora
            alert('Por favor, preencha o Código do Item.');
            return;
        }

        const newItem = {
            codigo: codigo,
            pallets: pallets,
            boxesPerPallet: boxes,
            unitsPerBox: units
        };

        inventory.push(newItem);
        renderInventory(); // Renderiza a tabela com o novo item
        
        // Limpa os campos após adicionar e foca no código para nova entrada
        codigoInput.value = '';
        palletsInput.value = ''; // Limpa para vazio
        boxesInput.value = '';   // Limpa para vazio
        unitsInput.value = '';   // Limpa para vazio
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

        // Cabeçalho CSV sem "Descrição" e "Total Unidades"
        let csvContent = "Código,Paletes,Caixas/Palete,Unidades/Caixa\n";
        inventory.forEach(item => {
            csvContent += `${item.codigo || ''},${item.pallets},${item.boxesPerPallet},${item.unitsPerBox}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'contagem_estoque.csv'); // Nome do arquivo CSV
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
        palletsInput,
        boxesInput,
        unitsInput
    ];

    inputFields.forEach((field, index) => {
        field.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (index < inputFields.length - 1) {
                    inputFields[index + 1].focus();
                } else {
                    addItemButton.click();
                }
            }
        });
    });

    // --- Lógica para Leitor de Código de Barras (ZXing-JS) ---
    startScannerButton.addEventListener('click', () => {
        scannerVideo.style.display = 'block';
        startScannerButton.style.display = 'none';
        stopScannerButton.style.display = 'block';
        scannerMessage.textContent = 'Aguardando leitura...';

        if (!codeReader) {
            codeReader = new ZXing.BrowserMultiFormatReader();
        }

        codeReader.decodeFromVideoDevice(null, scannerVideo, (result, err) => {
            if (result) {
                codigoInput.value = result.text;
                scannerMessage.textContent = `Código lido: ${result.text}`;
                stopScannerButton.click(); // Parar o scanner após a leitura
                palletsInput.focus(); // Focar no campo de paletes
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error(err);
                scannerMessage.textContent = 'Erro na leitura: ' + err.message;
            }
        });
    });

    stopScannerButton.addEventListener('click', () => {
        if (codeReader) {
            codeReader.reset();
            scannerVideo.style.display = 'none';
            startScannerButton.style.display = 'block';
            stopScannerButton.style.display = 'none';
            scannerMessage.textContent = '';
        }
    });

    // Renderiza o inventário inicial ao carregar a página
    renderInventory();
    // Foca no campo de código ao carregar a página
    codigoInput.focus();
});