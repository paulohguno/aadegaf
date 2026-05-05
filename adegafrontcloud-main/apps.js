
function carregarDados() {
    carregarClientes();
    carregarEstoque();
    carregarProdutos();
}

function forcarAtualizacaoBanco() {
    carregarDados();
    if (typeof toast === "function") {
        toast("Dados atualizados do banco.", "info");
    }
}


document.addEventListener("input", e => {
    if (e.target && e.target.id === "prod_preco") {
        atualizarPrevCusto();
    }
});

document.addEventListener("keydown", e => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        forcarAtualizacaoBanco();
    }
});
