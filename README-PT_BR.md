# enqueuer \NQR\
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/logo/fullLogo1.png "Enqueuer Logo")

Quando um _endpoint_ _http_ do seu _e-commerce_ é atingido, é necessário enviar uma informação para uma _API RESTful_ de processamento de cartões de crédito e notificar os usuários interessados através de uma publicação *MQTT*.

![readme-flow](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-flow.png "Fluxo do exemplo")

Neste momento, existem três opções para testar o fluxo poligota:
1. Não testar;
2. Criar testes de componente no próprio código do e-commerce para cada caso separadamente, simulando a comunicação de todos eles, tratando novas dependências, desvendando detalhes e debugando todos quando falham; ou
3. Usar **enqueuer** e ter isso tudo testado de mão beijada.

Para usar **enqueuer**, basta:

    $ npm install -g enqueuer    
Criar um arquivo de configuração, como esse:
![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-config.png "config-file.yml")

Criar um arquivo descrevendo o cenário de testes:
![readme-tests](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-test.png "Arquivo de testes")

E executar:

    $ enqueuer --config-file config-file.yml

O resultado será:
![readme-result](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-result.png "Resultado do exemplo")
