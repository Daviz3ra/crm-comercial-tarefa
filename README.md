### Diário

# O que aconteceu com a IA:
- **O que a IA sugeriu:** O Lovable sugeriu criar uma estrutura completa dos cards na tela para listar os leads e fez o formulário de cadastro ligado ao banco de dados. No início, a IA também sugeriu criar um banco de dados fictício dentro do próprio Lovable para testar, e me guiou com os passos para realizar as conexões externas.
- **O que eu aceitei:** Aceitei o design visual que ela gerou para a listagem e para o formulário. Também aceitei fazer a conexão com o meu projeto do Supabase para puxar os dados que eu já tinha cadastrado.
- **O que eu recusei/alterei:** Recusei a sugestão inicial da IA de usar dados fictícios locais dela, e tive que insistir em conectar o meu banco externo do Supabase. Também tive que atualizar a página e refazer comandos porque o chat travou e os créditos gratuitos do lovable acabaram, me obrigando a reiniciar o processo em outra conta pra concluir todas as funcionalidades integradas.

### Respostas da Avaliação

**1. Onde este dado fica guardado?**
Os dados ficam guardados de forma permanente na nuvem, dentro das tabelas do meu projeto criado no Supabase, que utiliza como base o PostgreSQL. O Lovable funciona apenas como a vitrine visual que puxa e mostra esses dados (frontend).

**2. O que acontece se eu apagar esta linha no Supabase?**
Se eu deletar uma linha direto pelo painel do Supabase, o dado é excluído de maneira definitiva. Como a tela do meu sistema depende do banco de dados para saber o que mostrar, na próxima vez que a página for atualizada, esse lead vai sumir, porque o site não vai mais encontrar essa informação para carregar.
