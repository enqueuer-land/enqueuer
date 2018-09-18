[ ] 'Why is node still running'

To Create:
- [ ] mongodb: http://mongodb.github.io/node-mongodb-native/3.0/tutorials/crud/ ?
- [ ] NSQ: https://github.com/nsqio/nsq ?
- [ ] WebSocket: 
- [ ] SOAP: ?

#####Prerequisites:

Python 2.6 or 2.7 as it is required by GYP. If python is not in your path, set the environment variable PYTHON to its location. For example: set PYTHON=C:\Python27\python.exe
One of:
    - Visual C++ Build Tools
    - Visual Studio 2015 Update 3, all editions including the Community edition (remember to select "Common Tools for Visual C++ 2015" feature during installation).
    - Visual Studio 2017, any edition (including the Build Tools SKU). Required Components: "MSbuild", "VC++ 2017 v141 toolset" and one of the Windows SDKs (10 or 8.1).
    - Basic Unix tools required for some tests, Git for Windows includes Git Bash and tools which can be included in the global PATH.
    - To build, launch a git shell (e.g. Cmd or PowerShell), run vcbuild.bat (to build with VS2017 you need to explicitly add a vs2017 argument), which will checkout the GYP code into build/gyp, generate uv.sln as well as the necesery related project files, and start building.

Implemented daemon adapters: uds; http
Stdin requisition has no name (?)
Inception run only one spawn mode
verify pub/sub attributes existence and types

Combine files:

        flow://files
            -   login.yml
            -   login.yml
            -   dir/**/*.yml
            -   branches:
                store:
                    key: value
                    files: 
                        -   pay1.yml
                        -   pay2.yml

        flow: //flowFile.yml
            stopOnError: true
            branches:
            store:
                user: guigui
            files:
                -
                -
                -
                -
                onError:
                    - 
                
                
Daemon input adapter

#   File                                    |  % Stmts | % Branch |  % Funcs |  % Lines
100 All files                               |    19.97 |    12.62 |    20.33 |    20.32 |
125 All files                               |    22.42 |    18.49 |    23.31 |    22.69 |
200 All files                               |    25.67 |    23.65 |    24.37 |    25.33 |
225 All files                               |    30.18 |    28.25 |    27.95 |       30 |
250 All files                               |    24.49 |    20.92 |    25.82 |    24.07 |
275 All files                               |    32.58 |    27.89 |    33.23 |     32.4 |
300 All files                               |    33.54 |    29.15 |    34.62 |    33.15 |
324 All files                               |     52.9 |    40.99 |    43.99 |    52.28 |

Summary to look like this?
 FAIL  src/inceptionTest/inception.comp.ts
  ● Inception test › should run enqueuer to test another enqueuer process
    ✕ should run enqueuer to test another enqueuer process (3032ms)
