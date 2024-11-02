![BANNER](https://i.ibb.co/VJSdkHn/golembrar.png)

<p align="center">
<a href="https://app.golembrar.com" target="_blank">App</a>
・
<a href="https://golembrar.com" target="_blank">Homepage</a>
・
<a href="https://github.com/goLembrar" target="_blank">GitHub</a>
・
<a href="https://www.linkedin.com/company/golembrar" target="_blank">LinkedIn</a>
</p>

---

## 💭 Sobre o projeto

**goLembrar** é uma plataforma inovadora que facilita a organização e o envio de lembretes de forma automatizada. Ele gerencia desde as integrações de mensagem com diversas plataformas até o controle completo sobre agendamentos ou lembretes, oferecendo uma infraestrutura robusta para manter os usuários sempre atualizados e no controle de seus compromissos.

> 📜 Explore a [Documentação do goLembrar](https://api.golembrar.com) para acessar detalhes sobre os endpoints da API.

### Principais funcionalidades

- **Integrações com mensageria**: Notificações via WhatsApp, E-mail, Telegram e Discord, com agendamentos personalizados para máxima flexibilidade.

- **Agendamento personalizado**: Controle completo sobre o envio de cada mensagem ou lembrete, com ajustes precisos de data, hora e destinatários. Garanta que cada notificação seja entregue no momento ideal, de forma totalmente alinhada às suas necessidades.

- **Escalabilidade com containers**: O backend está configurado para rodar em containers, garantindo uma infraestrutura escalável e de fácil manutenção.

## 🔥 Como rodar localmente

> [!WARNING]
> Para executar o backend do goLembrar, siga as instruções abaixo:

### Pré-requisitos

- **Docker**: Certifique-se de que o [docker](https://www.docker.com/get-started) está instalado em sua máquina.

- **Variáveis de Ambiente**: Crie o arquivo `.env.dev` a partir do `.env.example` com as variáveis necessárias para conexão aos serviços, como banco de dados, cache e mensageria. Utilize o nome dos containers no lugar de "localhost" para que o Docker resolva automaticamente o IP correto de cada serviço.

### Passos para iniciar os serviços

1. **Subindo os serviços com docker compose**:

   - Use o comando a seguir para iniciar todos os serviços descritos no `compose.yml`. Estes incluem: banco de dados, cache e mensageria, todos em containers docker, criando um ambiente isolado e consistente.

   ```sh
   docker compose up -d
   ```

   <br>

2. **Aplicando as migrations**

   - Execute o comando abaixo para aplicar as migrations e preparar o banco de dados com as tabelas necessárias para o funcionamento da Api:

   ```sh
   npm run prisma migrate dev
   ```

   Isso garantirá que o banco de dados esteja configurado corretamente para o uso.

   <br>

3. **Em execução**:

   - Com todos os containers em execução, a Api estará disponível para requisições em [http://localhost:3000](http://localhost:3000).

   <br>

## 🚀 Estrutura de serviços no docker compose

O `compose.yml` inclui os seguintes serviços:

- **API**: Serviço principal que processa requisições e gerencia o fluxo de dados dos lembretes.

- **PostgreSQL**: Banco de dados relacional utilizado para armazenar os dados dos lembretes, usuários e configurações.

- **KeyDB**: Cache de alta performance para otimizar o acesso a dados frequentes e melhorar a performance geral da aplicação.

- **RabbitMQ**: Sistema de mensageria que coordena o envio assíncrono de notificações entre a Api e os canais de mensagens.
