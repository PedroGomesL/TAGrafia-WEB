# TAGrafia WEB

TAGrafia WEB e uma visualizacao interativa de um acervo de produtos brasileiros e internacionais, criada originalmente em Processing e portada para p5.js para rodar diretamente no navegador pelo GitHub Pages.

A interface foi mantida como um canvas unico, seguindo a organizacao do prototipo original: filtros na lateral esquerda, area de visualizacao no centro, painel de produto na lateral direita, linha do tempo na base, alternancia entre modos de visualizacao e tema claro/escuro.

Site publicado:

https://pedrogomesl.github.io/TAGrafia-WEB/

## Sobre o projeto

O projeto organiza um conjunto de objetos de design, arquitetura, comunicacao grafica, mobiliario, utensilios e outras categorias de produto para permitir leitura visual por periodo, origem, material, tecnica, caracteristicas esteticas e tipo de produto.

A proposta da visualizacao e transformar o acervo em uma interface exploratoria: em vez de consultar uma tabela linha por linha, o usuario cruza tags, anos, origem e detalhes dos produtos para perceber concentracoes, relacoes, recorrencias formais e conexoes entre obras.

## Acervo

O acervo publicado nesta versao contem:

- 245 produtos no total
- 30 produtos brasileiros
- 215 produtos internacionais
- imagens organizadas por origem nacional e internacional
- dados de escolas, movimentos e eventos de contexto
- mapa GeoJSON para a visualizacao geografica

Os dados principais ficam em arquivos TSV dentro da pasta `data/`:

- `data/Produtos brasileiros.tsv`: produtos do recorte brasileiro.
- `data/Produtos internacionais.tsv`: produtos do recorte internacional.
- `data/Escolas.tsv`: escolas, movimentos e referencias associadas.
- `data/Eventos_contexto.tsv`: eventos historicos e contextuais usados na linha do tempo.
- `data/custom.geo.json`: base geografica usada no mapa.
- `data/image-manifest.json`: manifesto estatico que permite ao navegador encontrar as imagens no GitHub Pages.

As imagens estao separadas em:

- `data/Banco de imagens nacional/`
- `data/Banco de imagens internacional/`

Tambem existem pastas de apoio:

- `data/Icones/`: icones usados na interface.
- `data/Fontes/`: fontes usadas no canvas.

## Organizacao dos filtros

Os filtros foram organizados em quatro dimensoes principais:

- `Material`: filtra produtos por materiais e familias materiais.
- `Tecnica`: filtra processos, construcao, composicao e funcionalidades.
- `Estetico`: filtra atributos formais, visuais e conceituais.
- `Tipo de produto`: filtra categorias como assento, mobiliario, arquitetura, utensilio, iluminacao e outras.

Na lateral esquerda, o usuario escolhe uma dimensao e visualiza as tags disponiveis. Ao clicar em uma tag, ela passa a fazer parte das tags ativas. A busca permite localizar rapidamente termos dentro da dimensao atual.

O filtro tambem trabalha junto com a linha do tempo. Os marcadores inferiores ajustam o intervalo de anos exibido, restringindo as obras visiveis ao periodo selecionado.

## Como a interface funciona

A area central possui diferentes modos de visualizacao:

- `Circular`: mostra produtos ao redor de um anel e liga cada produto as tags relacionadas.
- `Bolhas`: agrupa produtos por proximidade tematica.
- `Linha do tempo`: distribui produtos por ano para leitura cronologica.
- `Mapa`: posiciona produtos e escolas/movimentos em uma leitura geografica.

O botao no canto superior direito alterna entre esses modos. Os outros botoes do mesmo bloco controlam legenda, informacoes e exportacao.

Na lateral direita, o painel do produto mostra:

- imagem principal do produto
- nome, ano e autoria
- tags materiais, tecnicas e esteticas
- descricao e caracteristicas extraidas do acervo
- lista de produtos salvos

## Como executar

A forma recomendada de acessar o projeto e pelo GitHub Pages:

https://pedrogomesl.github.io/TAGrafia-WEB/

Nao e necessario instalar dependencias nem executar servidor local para usar a versao publicada.

Para desenvolvimento local, abra a pasta do projeto com um servidor estatico simples, porque navegadores normalmente bloqueiam carregamento de TSV, JSON, fontes e imagens quando o arquivo e aberto diretamente por `file://`.

Exemplo:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000/
```

## Estrutura do repositorio

- `index.html`: pagina base do projeto.
- `styles.css`: estilos minimos para o canvas ocupar a janela.
- `sketch.js`: versao p5.js da aplicacao.
- `vendor/p5.min.js`: biblioteca p5.js usada localmente pelo Pages.
- `.nojekyll`: evita processamento do GitHub Pages e preserva os arquivos estaticos.
- `data/`: acervo, imagens, fontes, icones e arquivos auxiliares.
- `*.pde`: arquivos originais em Processing, mantidos como referencia historica do projeto.

## Observacao tecnica

No Processing, o programa podia listar pastas de imagens em tempo de execucao. No GitHub Pages, o navegador nao tem permissao para listar diretorios. Por isso esta versao usa `data/image-manifest.json`, um indice gerado previamente que informa quais imagens pertencem a cada produto.

Esse ajuste permite que a aplicacao continue sendo totalmente estatica e funcione direto no GitHub Pages.
