# enqueuer \nqr\
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/images/fullLogo1.png "Enqueuer Logo")

Quando um _servidor_ _TCP_ do seu _e-commerce_ é atingido, é necessário enviar uma informação para uma _API RESTful_ de processamento de cartões de crédito e notificar os usuários interessados através de uma publicação *AMQP*.

![readme-flow](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-flow.png "Fluxo do exemplo")

Neste momento, existem três opções para testar o fluxo poligota:
1. Não testar;
2. Criar testes de componente no próprio código do e-commerce para cada caso separadamente, simulando a comunicação de todos eles, tratando novas dependências, desvendando detalhes e debugando todos quando falham; ou
3. Usar **enqueuer** e ter isso tudo testado de mão beijada.

Para usar **enqueuer**, basta:
1. instalar:

    ```$npm install enqueuer -g```
    
2. criar um arquivo de configuração:
    ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-config.png "config-file.yml")

3. criar um arquivo descrevendo o cenáiro de testes:
    ![readme-tests](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-test.png "testfile")

4. executar:
    ![readme-result](https://github.com/lopidio/enqueuer/blob/develop/docs/images/readme-result.png "example result")
        
Para mais detalhes, considere dar uma olhada nas [instruções]
