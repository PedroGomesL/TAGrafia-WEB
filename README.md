# TAGrafia - Sistema de visualizacao dinamica

Versao web em p5.js do sistema criado originalmente em Processing. A interface foi portada para um canvas unico, mantendo a organizacao original: filtros a esquerda, visualizacao no centro, painel do produto a direita, menu de visualizacao, tema claro/escuro, linha do tempo e produtos salvos.

## Publicacao no GitHub Pages

Esta versao foi preparada para rodar diretamente no GitHub Pages como site estatico. Publique a raiz do repositorio contendo:

- `index.html`
- `styles.css`
- `sketch.js`
- `.nojekyll`
- `data/`

No GitHub:

1. Acesse `Settings > Pages`.
2. Em `Build and deployment`, selecione `Deploy from a branch`.
3. Escolha a branch `main`.
4. Escolha a pasta `/root`.
5. Salve e aguarde a URL do Pages.

## Estrutura web

- `index.html`: casca minima da pagina e carregamento do p5.js.
- `styles.css`: reset para o canvas ocupar a janela inteira.
- `sketch.js`: transcricao principal para p5.js.
- `data/image-manifest.json`: lista estatica das imagens usadas no navegador.
- `*.pde`: versao original em Processing mantida como referencia.

## Observacao sobre imagens

No Processing, o codigo consegue vasculhar a pasta `data/` em tempo de execucao. No GitHub Pages, o navegador nao consegue listar diretorios. Por isso existe `data/image-manifest.json`, que mapeia os IDs dos produtos para seus arquivos de imagem.
