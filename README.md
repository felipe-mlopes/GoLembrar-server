![BANNER](https://i.ibb.co/Hr6GrvF/golembrar.png)

## 💭 Sobre o Projeto

O **goLembrar** é uma plataforma inovadora que facilita a organização e o envio de lembretes de forma automatizada. Ele gerencia desde as integrações de mensagem com diversas plataformas até o controle completo sobre agendamentos ou lembretes, oferecendo uma infraestrutura robusta para manter os usuários sempre atualizados e no controle de seus compromissos.

> [App](https://app.golembrar.com) ・ [Homepage](https://golembrar.com) ・ [GitHub](https://github.com/goLembrar/) ・ [LinkedIn](https://www.linkedin.com/company/golembrar)

### Principais funcionalidades

- **Integrações com mensageria**: Notificações via WhatsApp, E-mail, Telegram e Discord, com agendamentos personalizados para máxima flexibilidade.

- **Agendamento personalizado**: Controle completo sobre o envio de cada mensagem ou lembrete, com ajustes precisos de data, hora e destinatários. Garanta que cada notificação seja entregue no momento ideal, de forma totalmente alinhada às suas necessidades.

- **Escalabilidade com containers**: O backend está configurado para rodar em containers, garantindo uma infraestrutura escalável e de fácil manutenção.

> 📜 Explore a [Documentação do goLembrar](https://api.golembrar.com) para acessar detalhes sobre os endpoints da api.

---

## 🔥 Como Rodar localmente

Para executar o backend do goLembrar, siga as instruções abaixo:

### Pré-requisitos

- **Docker**: Certifique-se de que o [docker](https://www.docker.com/get-started) está instalado em sua máquina.

- **Variáveis de ambiente**: Configure o arquivo `.env` com as variáveis necessárias para conectar aos serviços, como banco de dados, cache e mensageria.

### Passos para iniciar os serviços

1. **Subindo os serviços com docker compose**:

   - Use o comando a seguir para iniciar todos os serviços descritos no `compose.yml`. Estes incluem: banco de dados, cache e mensageria, todos em containers docker, criando um ambiente isolado e consistente.

   ```sh
   $ docker compose up
   # ou para rodar em segundo plano
   docker compose up -d
   ```

2. **Em execução**:

   - Com todos os containers em execução, a api estará disponível para requisições em [http://localhost:3000](http://localhost:3000).

---

## 🚀 Estrutura de serviços no docker compose

O `compose.yml` inclui os seguintes serviços:

- **API**: Serviço principal que processa requisições e gerencia o fluxo de dados dos lembretes.

- **PostgreSQL**: Banco de dados relacional utilizado para armazenar os dados dos lembretes, usuários e configurações.

- **KeyDB**: Cache de alta performance para otimizar o acesso a dados frequentes e melhorar a performance geral da aplicação.

- **RabbitMQ**: Sistema de mensageria que coordena o envio assíncrono de notificações entre a api e os canais de mensagens.
