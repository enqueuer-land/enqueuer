# enqueuer \nqr\
[![npm version](https://badge.fury.io/js/enqueuer.svg)](https://badge.fury.io/js/enqueuer) [![Build Status](https://travis-ci.org/lopidio/enqueuer.svg?branch=develop)](https://travis-ci.org/lopidio/enqueuer)

![enqueuerlogo](https://github.com/lopidio/enqueuer/blob/develop/docs/logo/fullLogo1.png "Enqueuer Logo")
[Take a look if you prefer to read it in portuguese](/README-PT_BR.md);

When your e-commerce http endpoint is hit, you have to send an information to a credit card processing RESTful API and notify users about this through MQTT events.

![readme-flow](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-flow.png "Flow")

Now, you have three options to test this **polyglot flow**:
1. Write no test at all;
2. Write a component test for each one of these cases separately in the codebase itself, mock them all, handle new dependencies, figure out details and deal with debugging them when they fail; or
3. Use **enqueuer** and have it all tested right out of the box.

To use **enqueuer**, you have to:

1. install it:

    ```$npm install -g enqueuer```
    
2. create a configuration file like this:
    ![config-file](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-config.png "config-file.yml")

3. create a file to describe how to test:
    ![readme-tests](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-test.png "testfile")

4. execute it:

    ```$enqueuer --config-file config-file.yml```
    
5. get the result:
    ![readme-result](https://github.com/lopidio/enqueuer/blob/develop/docs/readme-result.png "example result")
    
Consider reading the ![wiki](https://github.com/lopidio/enqueuer/wiki "wiki") for further details