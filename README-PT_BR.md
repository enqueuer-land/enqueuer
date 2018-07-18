# enqueuer
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/logo/fullLogo1.png "Enqueuer Logo")

## **TL;DR**
Quando um endpoint http do seu e-commerce é atingido, você deve enviar uma informação para uma API de processamento de cartões de crédito fazendo uso de MQTT, notificar um provedor de conteúdo de marketing através de uma requisição Rest/Http, notificar o usuário com SQS, persistir dados em um banco de dados e enfileirar uma mensagem AMQP para um sistema de métricas.
Neste momento, você tem três opções:
1. Não escrever teste algum;
2. Escrever testes de componente no próprio código do e-commerce para cada caso separadamente, mockando todos eles, tratando novas dependências, desvendando detalhes e debugando todos quando falham; ou
3. Usar **enqueuer** e ter tudo isso testado de mão beijada.
![Report Example](https://github.com/lopidio/enqueuer/blob/develop/docs//mqttOutputExample.png "Report Example")

# sumário
- [Justificativa](#justificativa)
- [O que faz?](#o-que-faz)
- [Por que é útil?](#por-que-é-útil)
- [Como funciona?](#como-funciona)
    - [Permita-me desenhar para você](#permita-me-desenhar-para-você)
- [Como usar](#como-usar)
    - [Vá fundo e experimente](#vá-fundo-e-experimente)
- [Protocolos IPC atualmente suportados](#protocolos-ipc-atualmente-suportados)
- [Cenários de testes](#cenários-de-testes)
    - [Quando um cenário de testes é inválido](#quando-um-cenário-de-testes-é-inválido)
    - [Meta-Functions](#meta-functions)
- [Arquivo de configuração](#arquivo-de-configuracao)
    - [Modos de execução](#run-mode)
    - [Saídas](#outputs)
    - [Níveis de log](#log-level)
    - [Variáveis](#variables)
- [Questão ~~nem tão~~ frequentemente perguntada](#questão-nem-tao-frequentemente-perguntada)

## justificativa
Ao desenvolver arquiteturas reativas é comum que os fluxos de negócio sejam permeados por diversos protocolos de comunicação o que chamamos de **fluxo de comunicação poliglota**.
Em muitos casos, pela facilidade, pela familiariadade ou pelo propósito mais adequado, arquiteturas RESTful baseadas em requisições HTTP são adotadas.
Contudo, em outros casos, outros protocolos são preferíveis, tais como: amqp; mqtt; sqs etc..
Por vezes, é natural que quando estimulado por uma determinada mensagens, o sistema processe e emita mensagens por meio de diferentes protocolos.
Quando se trata de fluxos que demandam mais de um protocolo, há uma carência de uma ferramenta capaz de realizar testes e agilizar o processo de desenvolvimento e integrar a pipeline de integração contínua.
Esse é o conceito do **enqueuer**: uma ferramenta de testes de comunicação poliglota.

## o que faz?
Verifica se um componente dirigido a eventos atua como esperado quando estimulado por um evento.
Por "atua como esperado" se quer dizer:
  - publica onde deve publicar;
  - publica o que deve publicar;
  - publica mais rápido que o tempo máximo.

## por que é útil?
Foi designado para ajudar o processo de desenvolvimento.
Embora haja outras maneiras de ser utilizado, as duas principais são:
  - enquanto desenvolvendo uma nova funcionalidade do componente de um jeito similar ao TDD; e
  - adicionando como uma etapa da pipeline de integração contínua, assegurando que o componente permanece funcionando apropriadamente a cada commit.

## como funciona?
1. recebe um [cenário de testes](/playground "Runnable exemplo");
2. inicia o teste publicando ou esperando algum evento;
3. espera o tempo máximo estabelecido ou que todos os eventos de saída esperados sejam recebidos;
4. executa testes em cima das mensagens trocadas;
5. reporta o [relatório final](/outputExamples/).
    
#### permita-me desenhar para você
É assim que um componente dirigido a evento age quando estimulado por um *Input*:\
![2018-03-11 19_20_00](https://media.giphy.com/media/YWLDPktqvpBIBgzYEX/giphy.gif "Comportamento esperado de um componente dirigido a eventos")\
**enqueuer** dispara o evento esperado fazendo com que o componente a ser testado atue.
Logo, **enqueuer** coleta os *Outputs* e verifica se estão conforme descrito previamente.
Bem simples, não acha?

## como usar
    $ enqueuer --help
         Usage: enqueuer [options]
         Options:
           -V, --version             Exibe o número da versão
           -v, --verbose             Ativa o modo verboso
           -l, --log-level <level>   Altera o level do log
           -c, --config-file <path>  Altera o endereço do arquivo de configuração
           -h, --help                Exibe o próprio modo de uso

##### vá fundo e experimente:
    $ git clone https://github.com/lopidio/enqueuer.git
    $ cd enqueuer
    $ npm install
    $ npm run build
    $ enqueuer --config-file conf/enqueuer.yml --session-variables httpPayload=virgs

Sem grandes surpresas, hum? Tão simples quanto `$enqueuer`.

#### protocolos IPC atualmente suportados
1. **Amqp**     - Advanced Message Queuing Protocol
2. **File**
3. **Http**     - Hypertext Transfer Protocol
4. **Kafka**
5. **Mqtt**     - Message Queuing Telemetry Transport
6. **Sqs**      - Amazon Simple Queue Service
7. **StdOut**   - Process Standard output
8. **ZeroMq**   - ZeroMq
9. **Stomp**    - Simple (or Streaming) Text Orientated Messaging Protocol
10. **Uds**     - Unix Domain Sockets
11. **Tcp**     - Transfer Control Protocol

## cenários de testes
Um cenário de testes parece com [isso](/playground "Exemplos de teste") e com [isso](/integrationTest "Mais exemplos").
Abaixo, uma definição dos campos do cenário de teste:
#### **runnable**:
-	**runnableVersion**: string, informa qual versão deve ser executada. Atualmente, só a versão "01.00.00" é aceita.
-	**name**: string, identifica o **runnable** por toda a execução do cenário.
-	**initialDelay**: número opcional em milissegundos, informa quanto tempo o cenário tem que esperar antes de considerar o teste como expirado. Ex.: 2000.
-	**runnables**: vetor de outros **runnables** ou **requisitions**. Sim, a parada pode ficar recursiva.

#### **requisition**:
-	**timeout**: número opcional em milissegundos, informa quanto tempo o cenário tem que esperar antes de considerar o teste como expirado. Ex.: 2000.
-	**name**: string, identifica a requisição por toda a execução.
-	**subscriptions**: vetor de subscriptions
    -	**subscription**
        -	**type**: string, identifica o protocolo a ser subscrito. Ex.: "mqtt", "kafka", "amqp" etc..
        -	**name**: string, identifica a **subscription** por toda a execução.
        -	**timeout**: número opcional em milissegundos, informa quanto tempo a subscrição deve esperar antes de ser considerada como inválida. Ex.: 2000.
        -	**onMessageReceived**: código javascript opcional, executada quando o evento aguardado é recebido.
                Existe uma variável especial chamada **message**. À variável será atribuída a própria mensagem recebida.
                É possível fazer testes, caso desejado: Ex.: ```"test['typeMqtt'] = publisher.type=='mqtt';"```.
                Leia mais sobre meta-functions na sessão [**meta-functions**](#meta-functions).			
-	**startEvent**:
    -	**publisher**: object
        -	**type**: string, identifica o protocolo a ser publicado. Ex.: "mqtt", "kafka", "amqp" etc..
        -	**name**: string, identifica o **publisher** por toda a execução.
        -	**payload**: string/object/number, o que será publicado. Pode ser o que for desejado. Inclusive outro **runnable**.[Saca essa](/src/inceptionTest/inceptionRunnable.enq)
        -	**prePublishing**: código javascript opcional, código executado imediatamente antes da publicação da mensagem. 
                    Existe uma variável especial chamada **publisher**. A variável representa o próprio **publisher** e seus atributos.
                    É possível inclusive redefinir novos valores para esses atributos em "tempo de execução".
                    Tipo assim: ```"publisher.payload=new Date().getTime();"``` or ```"publisher.type='mqtt'"```.
                    Leia mais sobre meta-functions na sessão [**meta-functions**](#meta-functions).                    
        -	**onMessageReceived**: código javascript opcional, código executado quando o protocolo (geralmente síncrono) fornece algum dado quando uma mensagem é publicada. 
                    Existe uma variável especial chamada **message**. À variável será atribuída a informação vinda da publicação da mensagem. 
                    Como dito anteriormente, também é possível realizar testes nesse código.
                    Leia mais sobre meta-functions na sessão [**meta-functions**](#meta-functions).			

#### quando um cenário de testes é inválido?
Um cenário de testes é inválido quando:
- Pelo menos um cenário de testes aninhado é inválido; ou
- Pelo menos uma requisição interna é inválida por:
    - Tempo expirado; or
    - Evento de início é inválido por: ou;
        - Não foi possível iniciar o teste; ou
        - Pelo menos um teste é inválido.
    - Pelo menos uma subscrição é inválida por:
        - Não foi possível se conectar; ou
        - Tempo máximo expirou; ou
        - Não recebeu mensagens; ou
        - Pelo menos um teste é inválido.

O valor '**valid**' na raiz do [relatório final](/outputExamples/) será **false**.

#### meta-functions 
Ao escrever uma meta-function (*onMessageReceived, prePublishing*) haverá uma variável especial chamada **test**:
-	**test**:
    Para testar algo: "test['nome do teste'] = expressãoBooleana;".
    A expressão booleana será avaliada em tempo de execução e todas as averiguações serão levadas em consideração para determinar se um cenário é válido ou não.
    Ex.: ```"test['test label'] = true;"```.
    O resultado desses testes estarão expostos no [relatório final](/outputExamples/).
-	**special functions**:
Haverá também três funções especiais: **persistEnqueuerVariable(name, value)**, **persistSessionVariable(name, value)** e **deleteEnqueuerVariable(name)**;
Para recuperar uma variável *enqueuerVariable* ou uma variável *sessionVariable* use chaves duplas: "{{variableName}}". Ex.: ```console.log({{httpPort}});```
    -	**persistEnqueuerVariable**:
    *EnqueuerVariables* são persistidas no [arquivo de configuração](/conf/enqueuer.yml), portanto, elas são persistidas entre diferentes execuções de **enqueuer**.
    É possível persistir uma variável *enqueuerVariable* escrevendo um código assim: ```persistEnqueuerVariable("httpPort", 23076);```
    -	**deleteEnqueuerVariable**:
    Para deletar uma *enqueuerVariable* faça isso: ```deleteEnqueuerVariable("httpPort");```.
    -	**persistSessionVariable**:
    Por outro lado, *sessionVariables* são mantidas em memória, o que significa que seráo disponíveis apenas durante o processo **enqueuer** corrente.
    É possível persistir uma *sessionVariable*, escreva um código assim: ```persistSessionVariable("sessionVar", 100)```;

## arquivo de configuração
Por padrão, **enqueuer** procura um arquivo em [conf/enqueuer.yml](/conf/enqueuer.yml) para configurar suas opções de execução.
Abaixo, uma explicação de cada atributo do arquivo:

##### run-mode:
Explicita o modo de execução. Existem duas opções mutualmente exclusivas:
- *daemon* (padrão): **enqueuer** será executado indefinidamente. Interminavelmente. Como um serviço. Quando executando neste modo, **enqueuer** permanecerá esperando por novos cenários de testes pelos [protocolos definidos logo abaixo](/src/inceptionTest/beingTested.yml).

- *single-run*: este modo é o mais comumente usado quando o objetivo é complementar a pipeline de integração contínua. Todo arquivo cujo nome for reconhecido pelo padrão será reconhecido como um cenário de teste e em seguida executado.
Quando todos os cenários forem executados, **enqueuer** encerrará a execução, compilará um [relatório final](/outputExamples/singleRunOutput.json) e retornará um código de status de execução com os seguintes valores:
     - 0, if all runnables are valid; or
     - 1, if there is at least one invalid runnable.
    
##### outputs:
Aceita uma lista de mecanismos de publicações. Cada vez que um novo cenário de teste é executado, **enqueuer** publica pelo protocolo definido o resultado.

##### log-level:
Define a profundidade que os logs terão. Os valores aceitos são: **trace**; **debug**; **info**; **warning**; **error**; and **fatal**.

##### variables:
Zona onde as variáveis persistidas entre diferentes execuções do enqueuer são armazenadas.


## questão ~~nem tão~~ frequentemente perguntada
1.	**Questão**: Uma vez que **enqueuer** é uma ferramenta para testar componentes dirigidos a eventos e **enqueuer** é um componente dirigido a eventos, **enqueuer** testa a si mesmo?\
	**Resposta**: Estou grato que tenha se perguntado isso. A resposta é sim, a ferramenta se testa, absolutamente, [dê uma olhada](/src/inceptionTest/inception.comp.ts "Inception Teste")

