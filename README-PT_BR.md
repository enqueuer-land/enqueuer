# enqueuer
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/a4e5c9dbb8983b4b1915/maintainability)](https://codeclimate.com/github/lopidio/enqueuer/maintainability)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/images/fullLogo1.png "Enqueuer Logo")

Quando um _servidor_ _TCP_ seu é atingido, é necessário enviar uma informação para uma _API RESTful_ e notificar o evento através de uma publicação *AMQP*.

![readme-flow](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-flow.png "Fluxo do exemplo")

Neste momento, existem três opções para testar o fluxo poligota:
1. Não testar;
2. Criar testes de componente no próprio código do e-commerce para cada caso separadamente, simulando a comunicação de todos eles, tratando novas dependências, desvendando detalhes e debugando todos quando falham; ou
3. Usar **enqueuer** e ter isso tudo testado de mão beijada.

Para usar **enqueuer**, basta:
1. instalar:

    ```$npm install enqueuer --no-optional --global```
    
2. criar um arquivo de configuração:
    ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")

3. criar um arquivo descrevendo o cenáiro de testes:
    ![readme-tests](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-test.png "testfile")

4. executar:
    ![readme-result](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-result.png "example result")
        
#### O que faz
É uma ferramenta de testes de integração para microserviços que contempla uma vasta gama de protocolos (HTTP, AMQP, MQTT etc.) e fornece as seguintes funcionalidades:
1) Inicia a requisição
2) Mocka serviços dependentes
3) Testa o conteúdo das mensagens
4) CLI facilmente adicionada as pipelines de integração contínua

Para mais detalhes, considere dar uma olhada nas [instruções](https://github.com/lopidio/enqueuer/tree/develop/docs/instructions "instructions")
